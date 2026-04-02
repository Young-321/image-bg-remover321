-- 用户体系数据库架构
-- 创建时间: 2026-03-30

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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_processing_history_user_id ON processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_processed_at ON processing_history(processed_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date);
