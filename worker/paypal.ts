/**
 * PayPal 支付服务
 * 处理 PayPal 支付订单创建、查询、Webhook 等
 */

interface PayPalConfig {
  mode: 'sandbox' | 'live';
  clientId: string;
  clientSecret: string;
  webhookId: string;
}

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
    custom_id?: string;
    invoice_id?: string;
  }>;
  create_time: string;
  update_time: string;
}

interface PayPalCapture {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  amount: {
    currency_code: string;
    value: string;
  };
  custom_id?: string;
  invoice_id?: string;
}

export class PayPalService {
  private config: PayPalConfig;
  private accessToken: PayPalAccessToken | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: PayPalConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    return this.config.mode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  /**
   * 获取 PayPal 访问令牌
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // 如果 token 还没过期，直接返回
    if (this.accessToken && now < this.tokenExpiresAt - 60000) {
      return this.accessToken.access_token;
    }

    const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    
    const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`);
    }

    this.accessToken = await response.json();
    this.tokenExpiresAt = now + (this.accessToken.expires_in * 1000);
    
    return this.accessToken.access_token;
  }

  /**
   * 创建 PayPal 订单
   */
  async createOrder(
    amount: number,
    currency: string = 'USD',
    description: string,
    customId?: string,
    invoiceId?: string
  ): Promise<PayPalOrder> {
    const accessToken = await this.getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          description,
          custom_id: customId,
          invoice_id: invoiceId,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'BG Remover',
            locale: 'zh-CN',
            landing_page: 'LOGIN',
            user_action: 'PAY_NOW',
            return_url: 'https://www.alltoolsimagebgremove.shop/pricing?success=true',
            cancel_url: 'https://www.alltoolsimagebgremove.shop/pricing?cancelled=true',
          },
        },
      },
    };

    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal create order failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 获取订单详情
   */
  async getOrder(orderId: string): Promise<PayPalOrder> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal get order failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 捕获订单（完成支付）
   */
  async captureOrder(orderId: string): Promise<PayPalCapture> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal capture order failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.purchase_units[0].payments.captures[0];
  }

  /**
   * 验证 Webhook 签名
   */
  async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const authAlgo = headers['paypal-auth-algo'];
    const certUrl = headers['paypal-cert-url'];
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];

    const verificationData = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: this.config.webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(
      `${this.getBaseUrl()}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationData),
      }
    );

    if (!response.ok) {
      console.error('PayPal webhook verification failed:', response.status);
      return false;
    }

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
  }

  /**
   * 获取客户端配置（供前端使用）
   */
  getClientConfig() {
    return {
      mode: this.config.mode,
      clientId: this.config.clientId,
    };
  }
}
