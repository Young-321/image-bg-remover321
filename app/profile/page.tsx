'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Calendar, Clock, Mail, LogOut, Edit, History, BarChart3, Settings, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

interface UserStats {
  totalProcessed: number;
  thisMonth: number;
  remainingQuota: number;
}

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalProcessed: 0,
    thisMonth: 0,
    remainingQuota: 50,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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

  const quickActions = [
    {
      name: '处理历史',
      description: '查看您处理过的所有图片',
      icon: History,
      href: '/history',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: '使用统计',
      description: '查看您的使用数据和额度',
      icon: BarChart3,
      href: '/stats',
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: '设置',
      description: '管理您的偏好和API密钥',
      icon: Settings,
      href: '/settings',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">个人中心</h1>
          <p className="text-slate-600 mt-2">管理您的账户和查看使用情况</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 用户信息卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              
              <div className="px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user.name[0].toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">通过 Google 登录</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                    <Edit className="w-4 h-4" />
                    编辑资料
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 统计卡片 */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">总处理</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalProcessed}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">本月</p>
                    <p className="text-3xl font-bold mt-1">{stats.thisMonth}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">剩余额度</p>
                    <p className="text-3xl font-bold mt-1">{stats.remainingQuota}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">快捷操作</h3>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {action.name}
                        </p>
                        <p className="text-sm text-slate-500">{action.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 账户信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">账户信息</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-600">用户ID</span>
                    <span className="text-slate-900 font-mono text-sm">{user.id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-600">登录方式</span>
                    <span className="text-slate-900 capitalize">{user.provider}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-600">账户状态</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      活跃
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-600">会员等级</span>
                    <span className="text-slate-900">免费版</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
