/**
 * 数据库访问层
 * 处理用户、配额、订单、交易等数据操作
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

export interface UserQuota {
  id: string;
  userId: string;
  guestTotal: number;
  guestUsed: number;
  guestRemaining: number;
  loggedInMonthlyYear?: number;
  loggedInMonthlyMonth?: number;
  loggedInMonthlyTotal: number;
  loggedInMonthlyUsed: number;
  loggedInMonthlyRemaining: number;
  loggedInLastResetAt?: number;
  paidTotal: number;
  paidUsed: number;
  paidRemaining: number;
  paidValidUntil?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Order {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  quota: number;
  status: 'pending' | 'paid' | 'cancelled' | 'failed';
  paymentMethod?: string;
  paymentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paidAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface QuotaTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  createdAt: number;
}

export class Database {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ========== 用户相关操作 ==========

  async getUserByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const result = await stmt.bind(email).first();
    return result ? this.mapToUser(result) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const result = await stmt.bind(id).first();
    return result ? this.mapToUser(result) : null;
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, avatar_url, provider, provider_id, created_at, updated_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      user.id,
      user.email,
      user.name || null,
      user.avatarUrl || null,
      user.provider,
      user.providerId,
      now,
      now,
      now
    ).run();
    
    return { ...user, createdAt: now, updatedAt: now, lastLoginAt: now };
  }

  async updateUserLogin(id: string): Promise<void> {
    const now = Date.now();
    const stmt = this.db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?');
    await stmt.bind(now, now, id).run();
  }

  // ========== 配额相关操作 ==========

  async getUserQuota(userId: string): Promise<UserQuota | null> {
    const stmt = this.db.prepare('SELECT * FROM user_quotas WHERE user_id = ?');
    const result = await stmt.bind(userId).first();
    return result ? this.mapToUserQuota(result) : null;
  }

  async createUserQuota(userId: string): Promise<UserQuota> {
    const now = Date.now();
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO user_quotas (
        id, user_id, guest_total, guest_used, guest_remaining,
        logged_in_monthly_total, logged_in_monthly_used, logged_in_monthly_remaining,
        paid_total, paid_used, paid_remaining, created_at, updated_at
      ) VALUES (?, ?, 3, 0, 3, 5, 0, 5, 0, 0, 0, ?, ?)
    `);
    await stmt.bind(id, userId, now, now).run();
    
    return {
      id,
      userId,
      guestTotal: 3,
      guestUsed: 0,
      guestRemaining: 3,
      loggedInMonthlyTotal: 5,
      loggedInMonthlyUsed: 0,
      loggedInMonthlyRemaining: 5,
      paidTotal: 0,
      paidUsed: 0,
      paidRemaining: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getOrCreateUserQuota(userId: string): Promise<UserQuota> {
    let quota = await this.getUserQuota(userId);
    if (!quota) {
      quota = await this.createUserQuota(userId);
    }
    return quota;
  }

  async addPaidQuota(userId: string, amount: number, durationDays: number): Promise<UserQuota> {
    const quota = await this.getOrCreateUserQuota(userId);
    const now = Date.now();
    const validUntil = now + (durationDays * 24 * 60 * 60 * 1000);

    quota.paidTotal += amount;
    quota.paidRemaining += amount;
    quota.paidValidUntil = quota.paidValidUntil 
      ? Math.max(quota.paidValidUntil, validUntil)
      : validUntil;
    quota.updatedAt = now;

    const stmt = this.db.prepare(`
      UPDATE user_quotas 
      SET paid_total = ?, paid_remaining = ?, paid_valid_until = ?, updated_at = ?
      WHERE user_id = ?
    `);
    await stmt.bind(quota.paidTotal, quota.paidRemaining, quota.paidValidUntil, now, userId).run();

    return quota;
  }

  // ========== 订单相关操作 ==========

  async createOrder(order: Omit<Order, 'createdAt' | 'updatedAt'>): Promise<Order> {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO orders (
        id, user_id, plan_id, plan_name, amount, quota, status,
        payment_method, payment_id, paypal_order_id, paypal_capture_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      order.id,
      order.userId,
      order.planId,
      order.planName,
      order.amount,
      order.quota,
      order.status,
      order.paymentMethod || null,
      order.paymentId || null,
      order.paypalOrderId || null,
      order.paypalCaptureId || null,
      now,
      now
    ).run();

    return { ...order, createdAt: now, updatedAt: now };
  }

  async getOrderById(id: string): Promise<Order | null> {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    const result = await stmt.bind(id).first();
    return result ? this.mapToOrder(result) : null;
  }

  async getOrderByPayPalOrderId(paypalOrderId: string): Promise<Order | null> {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE paypal_order_id = ?');
    const result = await stmt.bind(paypalOrderId).first();
    return result ? this.mapToOrder(result) : null;
  }

  async updateOrderToPaid(
    id: string, 
    paypalCaptureId: string,
    paymentMethod: string = 'paypal'
  ): Promise<Order | null> {
    const now = Date.now();
    const stmt = this.db.prepare(`
      UPDATE orders 
      SET status = 'paid', payment_method = ?, paypal_capture_id = ?, paid_at = ?, updated_at = ?
      WHERE id = ?
    `);
    await stmt.bind(paymentMethod, paypalCaptureId, now, now, id).run();
    
    return this.getOrderById(id);
  }

  async getUserOrders(userId: string, limit: number = 10): Promise<Order[]> {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
    const results = await stmt.bind(userId, limit).all();
    return results.results?.map((row: any) => this.mapToOrder(row)) || [];
  }

  // ========== 配额交易记录 ==========

  async createQuotaTransaction(
    transaction: Omit<QuotaTransaction, 'createdAt'>
  ): Promise<QuotaTransaction> {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO quota_transactions (id, user_id, type, amount, balance_after, description, order_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      transaction.id,
      transaction.userId,
      transaction.type,
      transaction.amount,
      transaction.balanceAfter,
      transaction.description,
      transaction.orderId || null,
      now
    ).run();

    return { ...transaction, createdAt: now };
  }

  // ========== 辅助方法 ==========

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      provider: row.provider,
      providerId: row.provider_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
    };
  }

  private mapToUserQuota(row: any): UserQuota {
    return {
      id: row.id,
      userId: row.user_id,
      guestTotal: row.guest_total,
      guestUsed: row.guest_used,
      guestRemaining: row.guest_remaining,
      loggedInMonthlyYear: row.logged_in_monthly_year,
      loggedInMonthlyMonth: row.logged_in_monthly_month,
      loggedInMonthlyTotal: row.logged_in_monthly_total,
      loggedInMonthlyUsed: row.logged_in_monthly_used,
      loggedInMonthlyRemaining: row.logged_in_monthly_remaining,
      loggedInLastResetAt: row.logged_in_last_reset_at,
      paidTotal: row.paid_total,
      paidUsed: row.paid_used,
      paidRemaining: row.paid_remaining,
      paidValidUntil: row.paid_valid_until,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToOrder(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      planName: row.plan_name,
      amount: row.amount,
      quota: row.quota,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentId: row.payment_id,
      paypalOrderId: row.paypal_order_id,
      paypalCaptureId: row.paypal_capture_id,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
