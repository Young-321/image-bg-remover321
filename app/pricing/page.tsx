'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Zap, Star, Clock, Award, Shield, CreditCard, ChevronRight, History, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { pricingPlans, PricingPlan } from '../config/pricing-plans';
import PayPalButton from '../components/PayPalButton';
import { useOrders, Order } from '../hooks/useOrders';

function PricingContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, addOrder, markOrderAsPaid, loading: ordersLoading, findOrderByPayPalOrderId } = useOrders();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'cancelled' | 'error'>('idle');
  const [processingPayment, setProcessingPayment] = useState(false);

  // 检查 URL 参数，处理支付结果
  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const token = searchParams.get('token'); // PayPal 自动添加的 token 参数

    if (token) {
      // 如果有 token 参数，说明是从 PayPal 返回的
      handlePaymentSuccess(token);
    } else if (cancelled === 'true') {
      setPaymentStatus('cancelled');
      router.replace('/pricing', { scroll: false });
    }
  }, [searchParams, router]);

  // 处理支付成功
  const handlePaymentSuccess = async (paypalOrderId: string) => {
    try {
      setProcessingPayment(true);
      
      console.log('Processing payment success for PayPal Order ID:', paypalOrderId);
      
      // 查找对应的订单 - 直接从 localStorage 查找
      let order = findOrderByPayPalOrderId(paypalOrderId);
      
      console.log('Found order:', order);
      
      if (order) {
        if (order.status !== 'paid') {
          // 标记订单为已支付
          markOrderAsPaid(order.id, paypalOrderId);
          console.log('Order marked as paid');
        }
      } else {
        // 如果找不到订单，创建一个已支付的订单（容错处理）
        console.log('Order not found, creating a paid order...');
        addOrder({
          id: crypto.randomUUID(),
          planName: 'PayPal 支付订单', // 这里可以改进，从 PayPal 获取套餐信息
          amount: 0, // 这里可以改进，从 PayPal 获取金额
          quota: 0, // 这里可以改进，从 PayPal 获取配额
          status: 'paid',
          paypalOrderId,
        });
      }
      
      setPaymentStatus('success');
      
      // 清除 URL 参数，但不重新加载页面
      setTimeout(() => {
        router.replace('/pricing', { scroll: false });
      }, 100);
      
    } catch (error) {
      console.error('Failed to process payment success:', error);
      setPaymentStatus('error');
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
    setPaymentStatus('idle');
  };

  const handlePaymentSuccessInternal = (paypalOrderId: string, plan: PricingPlan) => {
    // 创建订单记录
    const orderId = crypto.randomUUID();
    addOrder({
      id: orderId,
      planName: plan.name,
      amount: plan.price,
      quota: plan.quota,
      status: 'paid',
      paypalOrderId,
    });
    
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStatus('success');
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    console.error('Payment error:', error);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  const selectedPlanData = selectedPlan ? pricingPlans.find(p => p.id === selectedPlan) : null;

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">💰 套餐与充值</h1>
        <p className="text-slate-600 mt-3 text-lg">选择适合您的套餐，解锁更多功能</p>
      </div>

      {/* 支付状态提示 */}
      {paymentStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-green-800">支付成功！</h3>
            <p className="text-sm text-green-600">配额已到账，您可以继续使用了！</p>
          </div>
        </div>
      )}

      {paymentStatus === 'cancelled' && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <XCircle className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-semibold text-yellow-800">支付已取消</h3>
            <p className="text-sm text-yellow-600">您取消了支付，如有需要可以重新选择套餐。</p>
          </div>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">支付出错</h3>
            <p className="text-sm text-red-600">支付过程中出现错误，请稍后重试。</p>
          </div>
        </div>
      )}

      {/* 当前配额显示 */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">当前套餐：专业版</h3>
            <div className="flex items-center gap-4 text-purple-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>剩余 350 / 500 张</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>有效期至 2026-04-29</span>
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: '70%' }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-purple-100 mt-2">
              <span>已使用 70%</span>
              <span>剩余 30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 套餐列表 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 transition-all ${
              plan.popular
                ? 'border-purple-500 shadow-lg shadow-purple-500/25'
                : 'border-slate-200 hover:border-purple-300 hover:shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  最受欢迎
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-slate-900">¥{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">¥{plan.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-purple-600">{plan.quota}</span>
                  <span className="text-slate-600">张</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">有效期 {plan.durationDays} 天</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.price === 0 ? (
                <button
                  className="w-full py-3 rounded-xl font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200"
                >
                  {plan.buttonText || '立即体验'}
                </button>
              ) : (
                <PayPalButton
                  plan={plan}
                  onSuccess={() => {
                    // 这里会在 PayPal 组件内部处理
                  }}
                  onError={handlePaymentError}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 充值记录 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              充值记录
            </h3>
            <span className="text-sm text-slate-500">
              共 {orders.length} 条记录
            </span>
          </div>
        </div>
        
        {processingPayment ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-slate-600">正在处理支付...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">暂无充值记录</p>
            <p className="text-sm text-slate-400 mt-2">购买套餐后，记录会显示在这里</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.status === 'paid' ? 'bg-green-100' : 
                    order.status === 'pending' ? 'bg-yellow-100' : 
                    'bg-red-100'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      order.status === 'paid' ? 'text-green-600' : 
                      order.status === 'pending' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{order.planName}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(order.createdAt)} · {order.quota} 张
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(order.amount)}</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status === 'paid' ? (
                      <><Check className="w-3 h-3" /> 已完成</>
                    ) : order.status === 'pending' ? (
                      <><Clock className="w-3 h-3" /> 待支付</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> 已取消</>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 常见问题 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">常见问题</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">配额可以叠加吗？</h4>
            <p className="text-sm text-slate-600">可以！购买多个套餐，配额会自动叠加，有效期按最长的计算。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">配额过期怎么办？</h4>
            <p className="text-sm text-slate-600">配额到期后会清零，请在有效期内使用。建议购买长期套餐更划算。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">可以退款吗？</h4>
            <p className="text-sm text-slate-600">未使用的配额可以申请退款，退款会按比例扣除已使用部分。</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">支持哪些支付方式？</h4>
            <p className="text-sm text-slate-600">目前支持 PayPal 支付，后续会添加更多支付方式。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">加载中...</p>
          </div>
        </div>
      }>
        <PricingContent />
      </Suspense>
    </DashboardLayout>
  );
}
