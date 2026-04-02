'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Calendar, Zap, Award, Clock, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

interface DailyStats {
  date: string;
  count: number;
}

const mockDailyStats: DailyStats[] = [
  { date: '03-24', count: 5 },
  { date: '03-25', count: 8 },
  { date: '03-26', count: 3 },
  { date: '03-27', count: 12 },
  { date: '03-28', count: 6 },
  { date: '03-29', count: 9 },
  { date: '03-30', count: 4 },
];

export default function StatsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

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

  const totalProcessed = mockDailyStats.reduce((sum, day) => sum + day.count, 0);
  const maxCount = Math.max(...mockDailyStats.map(day => day.count));
  const avgPerDay = Math.round(totalProcessed / mockDailyStats.length);
  const remainingQuota = 50 - (totalProcessed % 50);

  const achievements = [
    { 
      name: '初次使用', 
      description: '完成第一次图片处理', 
      unlocked: true,
      icon: Zap,
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      name: '小试牛刀', 
      description: '处理10张图片', 
      unlocked: totalProcessed >= 10,
      icon: Award,
      color: 'from-blue-400 to-cyan-500'
    },
    { 
      name: '效率达人', 
      description: '一天处理5张图片', 
      unlocked: maxCount >= 5,
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-500'
    },
    { 
      name: '长期用户', 
      description: '连续使用7天', 
      unlocked: false,
      icon: Calendar,
      color: 'from-purple-400 to-pink-500'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">使用统计</h1>
            <p className="text-slate-600 mt-2">查看您的使用数据和额度情况</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'week'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              本月
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">总处理</p>
                <p className="text-3xl font-bold mt-1">{totalProcessed}</p>
                <p className="text-purple-100 text-sm mt-1">张图片</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">日均处理</p>
                <p className="text-3xl font-bold mt-1">{avgPerDay}</p>
                <p className="text-green-100 text-sm mt-1">张/天</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">单日最高</p>
                <p className="text-3xl font-bold mt-1">{maxCount}</p>
                <p className="text-orange-100 text-sm mt-1">张</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">剩余额度</p>
                <p className="text-3xl font-bold mt-1">{remainingQuota}</p>
                <p className="text-pink-100 text-sm mt-1">张/月</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 使用量图表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">使用趋势</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  处理量
                </div>
              </div>

              {/* 图表 */}
              <div className="h-64 flex items-end gap-2">
                {mockDailyStats.map((day, index) => {
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '200px' }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        >
                          {height > 15 && (
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold">
                              {day.count}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 额度使用 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">本月额度</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">已使用</span>
                    <span className="font-semibold text-slate-900">{totalProcessed % 50} / 50</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${((totalProcessed % 50) / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">当前套餐</p>
                      <p className="font-semibold text-slate-900">免费版</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                      升级套餐
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">月免费额度</span>
                    <span className="text-slate-900">50 张</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">重置时间</span>
                    <span className="text-slate-900">每月 1 日</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 成就系统 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">成就</h3>
              <p className="text-slate-600 text-sm mt-1">
                已解锁 {achievements.filter(a => a.unlocked).length} / {achievements.length} 个成就
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.name}
                  className={`relative rounded-xl p-4 border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
                      : 'bg-slate-50 border-slate-100 opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900">{achievement.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
                  {achievement.unlocked && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
