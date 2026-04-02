'use client';

import { useAuth } from '../contexts/AuthContext';
import { useQuota } from '../hooks/useQuota';
import { Ticket, AlertCircle, Lock, LogIn, CreditCard } from 'lucide-react';
import Link from 'next/link';

export function QuotaDisplay({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { quotaState, isLoading } = useQuota(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        {!compact && <span className="text-sm text-slate-500">加载中...</span>}
      </div>
    );
  }

  if (!quotaState) return null;

  const getQuotaText = () => {
    if (quotaState.userType === 'guest') {
      return `${quotaState.guest.remaining}/${quotaState.guest.total}`;
    }
    
    const loggedInRemaining = quotaState.loggedIn?.remaining || 0;
    const paidRemaining = quotaState.paid?.remaining || 0;
    const totalRemaining = loggedInRemaining + paidRemaining;
    
    return `${totalRemaining}`;
  };

  const getQuotaProgress = () => {
    if (quotaState.userType === 'guest') {
      return (quotaState.guest.used / quotaState.guest.total) * 100;
    }
    
    const loggedInTotal = quotaState.loggedIn?.total || 5;
    const loggedInUsed = quotaState.loggedIn?.used || 0;
    const paidTotal = quotaState.paid?.total || 0;
    const paidUsed = quotaState.paid?.used || 0;
    const totalTotal = loggedInTotal + paidTotal;
    const totalUsed = loggedInUsed + paidUsed;
    
    if (totalTotal === 0) return 0;
    return (totalUsed / totalTotal) * 100;
  };

  const getQuotaColor = () => {
    const progress = getQuotaProgress();
    if (progress >= 90) return 'from-red-500 to-red-600';
    if (progress >= 70) return 'from-orange-500 to-amber-600';
    return 'from-green-500 to-emerald-600';
  };

  const shouldShowLoginPrompt = quotaState.userType === 'guest' && quotaState.guest.remaining === 0;
  const shouldShowRechargePrompt = quotaState.userType === 'logged_in' && 
    quotaState.loggedIn && 
    quotaState.loggedIn.remaining === 0 &&
    (!quotaState.paid || quotaState.paid.remaining === 0);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full">
          <Ticket className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-slate-700">
            {getQuotaText()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 配额进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            {quotaState.userType === 'guest' ? '免费体验配额' : '当前配额'}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {getQuotaText()}
          </span>
        </div>
        
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getQuotaColor()} rounded-full transition-all duration-500`}
            style={{ width: `${100 - getQuotaProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* 未登录配额用完提示 */}
      {shouldShowLoginPrompt && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">
                免费体验配额已用完！
              </h4>
              <p className="text-sm text-orange-700 mb-3">
                登录后立即获得每月5次免费配额，还能保存处理历史！
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all"
              >
                <LogIn className="w-4 h-4" />
                使用Google登录
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 登录配额用完提示 */}
      {shouldShowRechargePrompt && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">
                本月免费配额已用完！
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                立即充值，解锁更多功能！
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                查看充值套餐
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
