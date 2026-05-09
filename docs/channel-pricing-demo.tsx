/**
 * 渠道伙伴定价管理页面示例
 * 展示渠道伙伴如何查看成本价和设置自己的售价
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 模型定价数据示例
const MODEL_PRICING = [
  {
    id: 1,
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'text',
    billingMode: 'per_token' as const,
    billingUnit: '1M',
    myCost: { input: 0.72, output: 2.16 },      // 我的成本
    channelPrice: { input: 1.0, output: 3.0 },    // 渠道进货价
    retailPrice: { input: 1.5, output: 4.5 },     // 零售指导价
  },
  {
    id: 2,
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'image',
    billingMode: 'per_image' as const,
    billingUnit: '1张',
    myCost: { input: 0.288, output: 0.288 },
    channelPrice: { input: 0.4, output: 0.4 },
    retailPrice: { input: 0.6, output: 0.6 },
  },
  {
    id: 3,
    name: 'Runway Gen-3',
    provider: 'Runway',
    type: 'video',
    billingMode: 'per_second' as const,
    billingUnit: '1秒',
    myCost: { input: 0.36, output: 0.36 },
    channelPrice: { input: 0.5, output: 0.5 },
    retailPrice: { input: 0.8, output: 0.8 },
  },
];

// 渠道伙伴的加价设置
type MarkupType = 'percentage' | 'fixed_amount' | 'custom';

interface ChannelSettings {
  markupType: MarkupType;
  markupValue: number;
  customPrices: Record<number, { input: number; output: number }>;
}

export default function ChannelPricingDemo() {
  const [settings, setSettings] = useState<ChannelSettings>({
    markupType: 'percentage',
    markupValue: 30,
    customPrices: {},
  });

  // 计算最终售价
  const calculateFinalPrice = (model: typeof MODEL_PRICING[0]) => {
    const { markupType, markupValue, customPrices } = settings;
    
    if (markupType === 'custom' && customPrices[model.id]) {
      return customPrices[model.id];
    }
    
    if (markupType === 'percentage') {
      return {
        input: Number((model.channelPrice.input * (1 + markupValue / 100)).toFixed(4)),
        output: Number((model.channelPrice.output * (1 + markupValue / 100)).toFixed(4)),
      };
    }
    
    if (markupType === 'fixed_amount') {
      return {
        input: Number((model.channelPrice.input + markupValue).toFixed(4)),
        output: Number((model.channelPrice.output + markupValue).toFixed(4)),
      };
    }
    
    return model.channelPrice;
  };

  // 计算利润率
  const calculateProfit = (model: typeof MODEL_PRICING[0], finalPrice: { input: number; output: number }) => {
    const avgChannel = (model.channelPrice.input + model.channelPrice.output) / 2;
    const avgFinal = (finalPrice.input + finalPrice.output) / 2;
    return (((avgFinal - avgChannel) / avgChannel) * 100).toFixed(1);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">渠道伙伴定价管理</h1>
      
      {/* 加价模式设置 */}
      <Card>
        <CardHeader>
          <CardTitle>加价模式设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={settings.markupType === 'percentage'}
                onChange={() => setSettings({ ...settings, markupType: 'percentage' })}
              />
              百分比加价
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={settings.markupType === 'fixed_amount'}
                onChange={() => setSettings({ ...settings, markupType: 'fixed_amount' })}
              />
              固定金额加价
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={settings.markupType === 'custom'}
                onChange={() => setSettings({ ...settings, markupType: 'custom' })}
              />
              自定义定价
            </label>
          </div>
          
          {settings.markupType !== 'custom' && (
            <div className="flex items-center gap-2">
              <span>加价数值：</span>
              <input
                type="number"
                value={settings.markupValue}
                onChange={(e) => setSettings({ ...settings, markupValue: Number(e.target.value) })}
                className="border rounded px-2 py-1 w-24"
              />
              <span>{settings.markupType === 'percentage' ? '%' : '元'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 模型定价表 */}
      <Card>
        <CardHeader>
          <CardTitle>模型定价明细</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">模型</th>
                <th className="text-left py-2">计费模式</th>
                <th className="text-right py-2">我的成本价</th>
                <th className="text-right py-2">你的进货价</th>
                <th className="text-right py-2">你的售价</th>
                <th className="text-right py-2">利润率</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_PRICING.map((model) => {
                const finalPrice = calculateFinalPrice(model);
                const profit = calculateProfit(model, finalPrice);
                
                return (
                  <tr key={model.id} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-gray-500">{model.provider}</div>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline">
                        {model.billingMode === 'per_token' && '按Token'}
                        {model.billingMode === 'per_image' && '按张'}
                        {model.billingMode === 'per_second' && '按秒'}
                      </Badge>
                      <div className="text-sm text-gray-500">/{model.billingUnit}</div>
                    </td>
                    <td className="text-right py-3 text-red-600">
                      ¥{model.myCost.input}
                    </td>
                    <td className="text-right py-3 text-blue-600">
                      ¥{model.channelPrice.input}
                    </td>
                    <td className="text-right py-3 text-green-600 font-bold">
                      ¥{finalPrice.input}
                    </td>
                    <td className="text-right py-3">
                      <Badge className="bg-green-100 text-green-800">
                        +{profit}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 利润计算示例 */}
      <Card>
        <CardHeader>
          <CardTitle>利润计算示例</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>假设客户调用 GPT-4o，输入 100K tokens，输出 50K tokens：</p>
          <div className="bg-gray-50 p-4 rounded space-y-1 text-sm">
            <p>📊 你的成本：输入 ¥{(100/1000 * MODEL_PRICING[0].channelPrice.input).toFixed(2)} + 输出 ¥{(50/1000 * MODEL_PRICING[0].channelPrice.output).toFixed(2)} = <strong>¥{(100/1000 * MODEL_PRICING[0].channelPrice.input + 50/1000 * MODEL_PRICING[0].channelPrice.output).toFixed(2)}</strong></p>
            <p>💰 你的收入：输入 ¥{(100/1000 * calculateFinalPrice(MODEL_PRICING[0]).input).toFixed(2)} + 输出 ¥{(50/1000 * calculateFinalPrice(MODEL_PRICING[0]).output).toFixed(2)} = <strong>¥{(100/1000 * calculateFinalPrice(MODEL_PRICING[0]).input + 50/1000 * calculateFinalPrice(MODEL_PRICING[0]).output).toFixed(2)}</strong></p>
            <p>📈 你的利润：¥{((100/1000 * (calculateFinalPrice(MODEL_PRICING[0]).input - MODEL_PRICING[0].channelPrice.input)) + (50/1000 * (calculateFinalPrice(MODEL_PRICING[0]).output - MODEL_PRICING[0].channelPrice.output))).toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
