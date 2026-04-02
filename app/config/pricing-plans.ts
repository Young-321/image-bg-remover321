export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  quota: number;
  durationDays: number;
  features: string[];
  popular?: boolean;
  buttonText?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: '入门版（测试用）',
    description: '适合轻度使用',
    price: 0.1,
    originalPrice: 39.9,
    quota: 100,
    durationDays: 30,
    features: [
      '100张付费处理额度',
      '30天有效期',
      '高清图片质量',
      '优先处理速度',
      '邮件客服支持',
    ],
    buttonText: '立即购买（测试¥0.1）',
  },
  {
    id: 'professional',
    name: '专业版',
    description: '适合专业用户',
    price: 79.9,
    originalPrice: 159.8,
    quota: 500,
    durationDays: 30,
    features: [
      '500张付费处理额度',
      '30天有效期',
      '无损图片质量',
      '极速处理速度',
      '批量处理功能',
      '专属客服支持',
      '优先新功能体验',
    ],
    popular: true,
    buttonText: '立即购买',
  },
  {
    id: 'enterprise',
    name: '企业版',
    description: '适合团队企业',
    price: 299,
    originalPrice: 598,
    quota: 2000,
    durationDays: 30,
    features: [
      '2000张付费处理额度',
      '30天有效期',
      '无损图片质量',
      '极速处理速度',
      '无限批量处理',
      '7x24专属客服',
      'API访问权限',
      '定制化功能',
    ],
    buttonText: '立即购买',
  },
  {
    id: 'yearly-pro',
    name: '年度专业版',
    description: '最超值的选择',
    price: 799,
    originalPrice: 958.8,
    quota: 6000,
    durationDays: 365,
    features: [
      '6000张付费处理额度',
      '365天有效期',
      '无损图片质量',
      '极速处理速度',
      '批量处理功能',
      '专属客服支持',
      '优先新功能体验',
      '节省 ¥159.8',
    ],
    buttonText: '立即购买',
  },
];

export const getPlanById = (id: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === id);
};
