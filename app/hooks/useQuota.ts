'use client';

import { useState, useEffect, useCallback } from 'react';

export type UserType = 'guest' | 'logged_in' | 'paid';

export interface QuotaState {
  userType: UserType;
  guest: { total: number; used: number; remaining: number; };
  loggedIn: any;
  paid: any;
  totalRemaining: number;
  hasQuota: boolean;
}

const GUEST_QUOTA_KEY = 'bgRemover_guestQuota';
const GUEST_QUOTA_TOTAL = 3;

function initGuestQuota(): any {
  return { total: GUEST_QUOTA_TOTAL, used: 0, remaining: GUEST_QUOTA_TOTAL };
}

export function useQuota(userId?: string) {
  const [quotaState, setQuotaState] = useState<QuotaState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initQuota = useCallback(() => {
    setIsLoading(true);
    try {
      let userType: UserType = 'guest';
      let guestQuota = initGuestQuota();
      
      const savedGuestQuota = localStorage.getItem(GUEST_QUOTA_KEY);
      if (savedGuestQuota) {
        try { guestQuota = JSON.parse(savedGuestQuota); } 
        catch { localStorage.removeItem(GUEST_QUOTA_KEY); }
      }
      
      if (userId) userType = 'logged_in';
      
      const totalRemaining = userType === 'guest' ? guestQuota.remaining : 5;
      const hasQuota = totalRemaining > 0;
      
      setQuotaState({
        userType, guest: guestQuota, loggedIn: null, paid: null,
        totalRemaining, hasQuota,
      });
    } catch (error) {
      console.error('初始化配额失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const deductQuota = useCallback((): boolean => {
    if (!quotaState || !quotaState.hasQuota) return false;
    return true;
  }, [quotaState]);

  useEffect(() => { initQuota(); }, [initQuota]);

  return { quotaState, isLoading, deductQuota, refreshQuota: initQuota };
}
