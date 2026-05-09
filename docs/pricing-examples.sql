-- ============================================================
-- ApiMix 定价数据示例
-- 展示多级分销定价体系
-- ============================================================

-- 1. GPT-4o (文本模型 - per_token)
-- 上游：OpenAI，输入$5/1M，输出$15/1M，汇率7.2
INSERT INTO models (
  name, provider, model_type, api_identifier,
  billing_mode, billing_unit,
  supplier_input_cost, supplier_output_cost, exchange_rate,
  my_input_cost, my_output_cost,
  channel_input_price, channel_output_price,
  retail_input_price, retail_output_price,
  description
) VALUES (
  'GPT-4o', 'OpenAI', 'text', 'gpt-4o',
  'per_token', '1M',
  5.000000, 15.000000, 7.2000,
  0.720000, 2.160000,     -- 我的成本(USD*7.2/1000)
  1.000000, 3.000000,     -- 渠道价(+38%/+38%)
  1.500000, 4.500000,     -- 零售价(+50%/+50%)
  'OpenAI GPT-4o，支持文本和视觉'
);

-- 2. GPT-4o-mini (文本模型 - per_token)
-- 上游：OpenAI，输入$0.15/1M，输出$0.6/1M
INSERT INTO models (...) VALUES (
  'GPT-4o-mini', 'OpenAI', 'text', 'gpt-4o-mini',
  'per_token', '1M',
  0.150000, 0.600000, 7.2000,
  0.021600, 0.086400,
  0.030000, 0.120000,
  0.050000, 0.200000,
  'OpenAI GPT-4o-mini，高性价比'
);

-- 3. Claude 3.5 Sonnet (文本模型 - per_token)
-- 上游：Anthropic，输入$3/1M，输出$15/1M
INSERT INTO models (...) VALUES (
  'Claude 3.5 Sonnet', 'Anthropic', 'text', 'claude-3-5-sonnet',
  'per_token', '1M',
  3.000000, 15.000000, 7.2000,
  0.432000, 2.160000,
  0.600000, 3.000000,
  0.900000, 4.500000,
  'Anthropic Claude 3.5 Sonnet'
);

-- 4. DALL-E 3 (图片模型 - per_image)
-- 上游：OpenAI，$0.04/张
INSERT INTO models (...) VALUES (
  'DALL-E 3', 'OpenAI', 'image', 'dall-e-3',
  'per_image', '1张',
  0.040000, 0.040000, 7.2000,
  0.288000, 0.288000,    -- 每张成本
  0.400000, 0.400000,    -- 渠道价
  0.600000, 0.600000,    -- 零售价
  'OpenAI DALL-E 3 高质量图片生成'
);

-- 5. Stable Diffusion 3 (图片模型 - per_image)
-- 上游：Stability AI，$0.035/张
INSERT INTO models (...) VALUES (
  'Stable Diffusion 3', 'Stability AI', 'image', 'sd3',
  'per_image', '1张',
  0.035000, 0.035000, 7.2000,
  0.252000, 0.252000,
  0.350000, 0.350000,
  0.500000, 0.500000,
  'Stability AI SD3 图片生成'
);

-- 6. Runway Gen-3 (视频模型 - per_second)
-- 上游：Runway，$0.05/秒
INSERT INTO models (...) VALUES (
  'Runway Gen-3', 'Runway', 'video', 'runway-gen3',
  'per_second', '1秒',
  0.050000, 0.050000, 7.2000,
  0.360000, 0.360000,    -- 每秒成本
  0.500000, 0.500000,    -- 渠道价
  0.800000, 0.800000,    -- 零售价
  'Runway Gen-3 高质量视频生成'
);

-- 7. Pika 1.5 (视频模型 - per_second)
-- 上游：Pika，$0.03/秒
INSERT INTO models (...) VALUES (
  'Pika 1.5', 'Pika', 'video', 'pika-1.5',
  'per_second', '1秒',
  0.030000, 0.030000, 7.2000,
  0.216000, 0.216000,
  0.300000, 0.300000,
  0.500000, 0.500000,
  'Pika 1.5 创意视频生成'
);

-- 8. Whisper v3 (音频模型 - per_second)
-- 上游：OpenAI，$0.006/分钟 = $0.0001/秒
INSERT INTO models (...) VALUES (
  'Whisper v3', 'OpenAI', 'audio', 'whisper-1',
  'per_second', '1秒',
  0.000100, 0.000100, 7.2000,
  0.000720, 0.000720,
  0.001000, 0.001000,
  0.002000, 0.002000,
  'OpenAI Whisper 语音转文字'
);

-- ============================================================
-- 渠道伙伴示例
-- ============================================================

-- 渠道伙伴 A（百分比加价模式，加价30%）
INSERT INTO channel_partners (
  user_id, company_name, contact_name, contact_phone,
  markup_type, markup_value, credit_limit, status, remarks
) VALUES (
  1001, '北京智云科技', '张经理', '13800138001',
  'percentage', 30.0000, 10000.00, 'active',
  '大客户，季度结算'
);

-- 渠道伙伴 B（固定金额加价模式，每张图加价0.2元）
INSERT INTO channel_partners (
  user_id, company_name, contact_name, contact_phone,
  markup_type, markup_value, credit_limit, status, remarks
) VALUES (
  1002, '上海创想AI', '李总监', '13900139002',
  'fixed_amount', 0.2000, 5000.00, 'active',
  '月结客户'
);

-- 渠道伙伴 C（自定义定价模式）
INSERT INTO channel_partners (
  user_id, company_name, contact_name, contact_phone,
  markup_type, markup_value, credit_limit, status, remarks
) VALUES (
  1003, '深圳未来视界', '王总', '13700137003',
  'custom', 0.0000, 20000.00, 'active',
  'VIP客户，独立定价'
);

-- 渠道伙伴 C 的自定义价格（比渠道价更优惠）
INSERT INTO custom_pricing_rules (
  channel_partner_id, model_id, custom_input_price, custom_output_price, is_active
) VALUES
-- GPT-4o 自定义价（比标准渠道价低10%）
(3, 1, 0.900000, 2.700000, true),
-- DALL-E 3 自定义价
(3, 4, 0.350000, 0.350000, true),
-- Runway 自定义价
(3, 6, 0.450000, 0.450000, true);
