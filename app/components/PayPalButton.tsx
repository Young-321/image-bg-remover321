'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { usePayPal } from '../hooks/usePayPal';
import { PricingPlan } from '../config/pricing-plans';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';

interface PayPalButtonProps {
  plan: PricingPlan;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

type PaymentState = 'idle' | 'loading' | 'redirecting' | 'success' | 'error';

export default function PayPalButton({ 
  plan, 
  onSuccess, 
  onError, 
  className = '' 
}: PayPalButtonProps) {
  const { user } = useAuth();
  const { initiatePayment, loading: configLoading, error: configError, isReady } = usePayPal();
  const { addOrder } = useOrders();
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!isReady || paymentState === 'loading') {
      return;
    }

    try {
      setPaymentState('loading');
      setPaymentError(null);

      // 转换价格为 USD（PayPal 默认货币）
      // 注意：这里简化处理，实际应该根据汇率转换
      const usdAmount = plan.price * 0.14; // 假设 1 CNY ≈ 0.14 USD

      // 先创建本地订单（pending 状态）
      const orderId = crypto.randomUUID();
      
      // 发起 PayPal 支付
      const orderResponse = await initiatePayment({
        amount: usdAmount,
        currency: 'USD',
        description: `${plan.name} - ${plan.quota} 张处理额度`,
        planId: plan.id,
        userId: user?.email,
      });

      // 保存 pending 订单
      addOrder({
        id: orderId,
        planName: plan.name,
        amount: plan.price,
        quota: plan.quota,
        status: 'pending',
        paypalOrderId: orderResponse.orderId,
      });

      setPaymentState('redirecting');
      
      // 等待一下，让用户看到 redirecting 状态
      setTimeout(() => {
        // 跳转到 PayPal
        if (orderResponse.approvalLink) {
          window.location.href = orderResponse.approvalLink;
        } else {
          throw new Error('No approval link returned');
        }
      }, 500);

    } catch (err) {
      console.error('Payment failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setPaymentError(errorMessage);
      setPaymentState('error');
      onError?.(errorMessage);
    }
  };

  if (configLoading) {
    return (
      <button
        disabled
        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-slate-100 text-slate-400 ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        加载支付配置...
      </button>
    );
  }

  if (configError || !isReady) {
    return (
      <button
        disabled
        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-red-50 text-red-400 ${className}`}
      >
        <XCircle className="w-5 h-5" />
        支付服务暂时不可用
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={paymentState === 'loading' || paymentState === 'redirecting'}
        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          paymentState === 'loading' || paymentState === 'redirecting'
            ? 'bg-slate-100 text-slate-400'
            : plan.popular
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-600/25'
            : 'bg-[#0070ba] text-white hover:bg-[#005ea6]'
        } ${className}`}
      >
        {paymentState === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            准备支付...
          </>
        ) : paymentState === 'redirecting' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            跳转到 PayPal...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            使用 PayPal 支付
          </>
        )}
      </button>

      {paymentError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{paymentError}</p>
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        安全支付由 PayPal 提供支持
      </p>
    </div>
  );
}
