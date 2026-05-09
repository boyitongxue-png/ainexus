# ApiMix 多级分销计费体系设计

## 一、业务模型

```
上游供应商(USD)        我(RMB)            渠道伙伴(RMB)        终端客户
   |                      |                    |                    |
   |  supplierInputCost   |  myInputCost      |  channelInputPrice |  客户看到的价格
   |  supplierOutputCost  |  myOutputCost     |  channelOutputPrice|
   |                      |      ↓            |      ↓             |
   |      成本价           |   加价20-50%       |   加价30-100%      |
   |                      |      ↓            |      ↓             |
   |                      |  channelInputPrice |  渠道自定义售价    |
```

## 二、三种计费模式

### 1. 文本模型（per_token）
- 计费单位：1M tokens
- 输入/输出分别计价
- 例：GPT-4o
  - 上游：输入 $5/1M，输出 $15/1M
  - 汇率：7.2
  - 我的成本：输入 ¥0.72/1K，输出 ¥2.16/1K
  - 渠道价：输入 ¥1.0/1K，输出 ¥3.0/1K
  - 零售价：输入 ¥1.5/1K，输出 ¥4.5/1K

### 2. 图片模型（per_image）
- 计费单位：张
- 输入/输出相同（单张固定价）
- 例：DALL-E 3
  - 上游：$0.04/张
  - 我的成本：¥0.288/张
  - 渠道价：¥0.4/张
  - 零售价：¥0.6/张

### 3. 视频模型（per_second）
- 计费单位：秒
- 输入/输出相同
- 例：Runway
  - 上游：$0.05/秒
  - 我的成本：¥0.36/秒
  - 渠道价：¥0.5/秒
  - 零售价：¥0.8/秒

## 三、数据库表结构

### models（改进版）

| 字段 | 类型 | 说明 |
|------|------|------|
| billing_mode | enum | per_token / per_image / per_second / per_request |
| billing_unit | varchar | 1M / 1张 / 1秒 |
| supplier_input_cost | decimal | 上游输入成本（USD） |
| supplier_output_cost | decimal | 上游输出成本（USD） |
| exchange_rate | decimal | USD->RMB 汇率 |
| my_input_cost | decimal | 我的输入成本（RMB） |
| my_output_cost | decimal | 我的输出成本（RMB） |
| channel_input_price | decimal | 渠道进货输入价（RMB） |
| channel_output_price | decimal | 渠道进货输出价（RMB） |
| retail_input_price | decimal | 零售指导输入价（RMB） |
| retail_output_price | decimal | 零售指导输出价（RMB） |

### channel_partners（新增）

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | bigint | 关联用户 |
| markup_type | enum | fixed_amount / percentage / custom |
| markup_value | decimal | 加价数值 |
| credit_limit | decimal | 信用额度 |
| status | enum | active / inactive / suspended |

### custom_pricing_rules（新增）

| 字段 | 类型 | 说明 |
|------|------|------|
| channel_partner_id | bigint | 渠道伙伴 |
| model_id | bigint | 模型 |
| custom_input_price | decimal | 自定义输入价 |
| custom_output_price | decimal | 自定义输出价 |

## 四、计费流程

```
1. 用户请求 API
   ↓
2. 解析模型名称 -> 查询 models 表
   ↓
3. 根据 billing_mode 决定计费方式
   ↓
4. 调用上游 API
   ↓
5. 根据实际用量计算成本
   ↓
6. 查询用户角色
   ├── 普通用户：使用 retail_price
   └── 渠道伙伴：使用 channel_price + 自定义加价
   ↓
7. 扣除积分
   ↓
8. 记录 usage_records
```

## 五、关键计算公式

### 文本模型（per_token）
```
成本 = (inputTokens / 1000000 * myInputCost) + (outputTokens / 1000000 * myOutputCost)
渠道价格 = (inputTokens / 1000000 * channelInputPrice) + (outputTokens / 1000000 * channelOutputPrice)
```

### 图片模型（per_image）
```
成本 = imageCount * myInputCost
渠道价格 = imageCount * channelInputPrice
```

### 视频模型（per_second）
```
成本 = videoSeconds * myInputCost
渠道价格 = videoSeconds * channelInputPrice
```

### 渠道加价
```
percentage 模式：finalPrice = channelPrice * (1 + markupValue / 100)
fixed_amount 模式：finalPrice = channelPrice + markupValue
custom 模式：查 custom_pricing_rules 表
```

## 六、SQL 迁移脚本

```sql
-- 1. 修改 users 表角色枚举
ALTER TABLE users MODIFY COLUMN role ENUM('user', 'channel_partner', 'admin') DEFAULT 'user';

-- 2. 修改 models 表（备份旧数据后重建）
-- 建议创建新表 models_v2，迁移数据后重命名

-- 3. 创建新表
CREATE TABLE channel_partners (...);
CREATE TABLE custom_pricing_rules (...);
CREATE TABLE usage_records (...);
```

## 七、API 设计

### 获取模型价格（带渠道价）
```
GET /api/trpc/model.getPricing
Input: { modelId: number }
Output: {
  billingMode: "per_token",
  billingUnit: "1M",
  supplierCost: { input: 5.0, output: 15.0, currency: "USD" },
  myCost: { input: 0.72, output: 2.16, currency: "RMB" },
  channelPrice: { input: 1.0, output: 3.0, currency: "RMB" },
  retailPrice: { input: 1.5, output: 4.5, currency: "RMB" }
}
```

### 渠道伙伴设置自定义价格
```
mutation /api/trpc/pricing.setCustomPrice
Input: { modelId: number, inputPrice: number, outputPrice: number }
```

### 查询用量统计
```
query /api/trpc/usage.getStats
Input: { startDate: string, endDate: string }
Output: {
  totalRequests: number,
  totalTokens: number,
  totalCost: number,
  totalRevenue: number,
  byModel: [...]
}
```
