'use client';

import { useState, useEffect, useCallback } from 'react';

interface PayPalConfig {
  mode: 'sandbox' | 'live';
  clientId: string;
}

interface PayPalOrderRequest {
  amount: number;
  currency?: string;
  description: string;
  planId: string;
  userId?: string;
}

interface PayPalOrderResponse {
  success: boolean;
  orderId: string;
  approvalLink: string;
}

interface PayPalCaptureResponse {
  success: boolean;
  captureId: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
}

const WORKER_URL = 'https://bg-remover-worker.yangyong900829.workers.dev';

export function usePayPal() {
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载 PayPal 配置
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const response = await fetch(`${WORKER_URL}/paypal/config`);
        
        if (!response.ok) {
          throw new Error('Failed to load PayPal config');
        }
        
        const config = await response.json();
        setConfig(config);
        setError(null);
      } catch (err) {
        console.error('Failed to load PayPal config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PayPal config');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  // 创建 PayPal 订单
  const createOrder = useCallback(async (
    orderRequest: PayPalOrderRequest
  ): Promise<PayPalOrderResponse> => {
    try {
      const response = await fetch(`${WORKER_URL}/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create PayPal order');
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to create PayPal order:', err);
      throw err;
    }
  }, []);

  // 捕获 PayPal 订单（完成支付）
  const captureOrder = useCallback(async (
    orderId: string
  ): Promise<PayPalCaptureResponse> => {
    try {
      const response = await fetch(`${WORKER_URL}/paypal/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to capture PayPal order');
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to capture PayPal order:', err);
      throw err;
    }
  }, []);

  // 快速支付流程
  const initiatePayment = useCallback(async (
    orderRequest: PayPalOrderRequest
  ): Promise<PayPalOrderResponse> => {
    try {
      // 创建订单
      const orderResponse = await createOrder(orderRequest);
      
      if (!orderResponse.approvalLink) {
        throw new Error('No approval link returned');
      }

      return orderResponse;
    } catch (err) {
      console.error('Failed to initiate payment:', err);
      throw err;
    }
  }, [createOrder]);

  return {
    config,
    loading,
    error,
    createOrder,
    captureOrder,
    initiatePayment,
    isReady: !!config && !loading,
  };
}
