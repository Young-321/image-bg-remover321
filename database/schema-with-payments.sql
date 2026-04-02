-- 用户体系 + 支付系统数据库架构
-- 创建时间: 2026-03-31
-- 包含: 用户、配额、订单、交易记录

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

-- 用户配额表
CREATE TABLE IF NOT EXISTS user_quotas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  
  -- 未登录用户配额(不重置)
  guest_total INTEGER DEFAULT 3,
  guest_used INTEGER DEFAULT 0,
  guest_remaining INTEGER DEFAULT 3,
  
  -- 登录用户月度配额(每月重置)
  logged_in_monthly_year INTEGER,
  logged_in_monthly_month INTEGER,
  logged_in_monthly_total INTEGER DEFAULT 5,
  logged_in_monthly_used INTEGER DEFAULT 0,
  logged_in_monthly_remaining INTEGER DEFAULT 5,
  logged_in_last_reset_at INTEGER,
  
  -- 付费配额
  paid_total INTEGER DEFAULT 0,
  paid_used INTEGER DEFAULT 0,
  paid_remaining INTEGER DEFAULT 0,
  paid_valid_until INTEGER,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 套餐表
CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL,
  quota INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features TEXT,
  popular BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount REAL NOT NULL,
  quota INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  paid_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 配额交易表
CREATE TABLE IF NOT EXISTS quota_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  order_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 处理历史表
CREATE TABLE IF NOT EXISTS processing_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  original_size INTEGER NOT NULL,
  processed_at INTEGER NOT NULL,
  original_thumbnail TEXT,
  processed_thumbnail TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  quota_used INTEGER DEFAULT 1,
  quota_type TEXT DEFAULT 'logged_in',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  default_format TEXT DEFAULT 'png',
  default_quality INTEGER DEFAULT 100,
  auto_save_history BOOLEAN DEFAULT 1,
  email_notifications BOOLEAN DEFAULT 1,
  browser_notifications BOOLEAN DEFAULT 0,
  custom_api_key TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 插入默认套餐数据
INSERT OR IGNORE INTO pricing_plans (id, name, description, price, original_price, quota, duration_days, features, popular, created_at, updated_at) VALUES
  ('free', '免费体验', '适合初次尝试', 0, NULL, 10, 7, '["10张免费处理额度","7天有效期","基础图片质量","标准处理速度"]', 0, strftime('%s','now'), strftime('%s','now')),
  ('starter', '入门版', '适合轻度使用', 9.9, 19.9, 100, 30, '["100张处理额度","30天有效期","高清图片质量","优先处理速度","邮件客服支持"]', 0, strftime('%s','now'), strftime('%s','now')),
  ('professional', '专业版', '适合专业用户', 29.9, 59.9, 500, 30, '["500张处理额度","30天有效期","无损图片质量","极速处理速度","批量处理功能","专属客服支持","优先新功能体验"]', 1, strftime('%s','now'), strftime('%s','now')),
  ('enterprise', '企业版', '适合团队使用', 99.9, 199.9, 2000, 30, '["2000张处理额度","30天有效期","无损图片质量","极速处理速度","无限批量处理","7x24专属客服","API访问权限","定制化功能"]', 0, strftime('%s','now'), strftime('%s','now')),
  ('yearly-pro', '年度专业版', '最超值的选择', 299, 358.8, 6000, 365, '["6000张处理额度","365天有效期","无损图片质量","极速处理速度","批量处理功能","专属客服支持","优先新功能体验","节省 ¥58.8"]', 0, strftime('%s','now'), strftime('%s','now'));

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_processing_history_user_id ON processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_processed_at ON processing_history(processed_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_quota_transactions_user_id ON quota_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_transactions_created_at ON quota_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_quota_transactions_order_id ON quota_transactions(order_id);
