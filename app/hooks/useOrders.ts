'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Order {
  id: string;
  planName: string;
  amount: number;
  quota: number;
  status: 'pending' | 'paid' | 'cancelled' | 'failed';
  paypalOrderId?: string;
  paypalCaptureId?: string;
  createdAt: number;
  paidAt?: number;
}

const STORAGE_KEY = 'bg_remover_orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 加载订单
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存订单到 localStorage
  const saveOrders = useCallback((newOrders: Order[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
      setOrders(newOrders);
    } catch (error) {
      console.error('Failed to save orders:', error);
    }
  }, []);

  // 添加新订单
  const addOrder = useCallback((order: Omit<Order, 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      createdAt: Date.now(),
    };
    
    const newOrders = [newOrder, ...orders];
    saveOrders(newOrders);
    
    return newOrder;
  }, [orders, saveOrders]);

  // 更新订单状态为已支付
  const markOrderAsPaid = useCallback((orderId: string, paypalCaptureId?: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'paid' as const,
          paypalCaptureId,
          paidAt: Date.now(),
        };
      }
      return order;
    });
    
    saveOrders(updatedOrders);
  }, [orders, saveOrders]);

  // 更新订单状态
  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    });
    
    saveOrders(updatedOrders);
  }, [orders, saveOrders]);

  // 根据 PayPal Order ID 查找订单
  const findOrderByPayPalOrderId = useCallback((paypalOrderId: string) => {
    return orders.find(order => order.paypalOrderId === paypalOrderId);
  }, [orders]);

  return {
    orders,
    loading,
    addOrder,
    markOrderAsPaid,
    updateOrderStatus,
    findOrderByPayPalOrderId,
  };
}
