'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, BarChart3, Settings, ChevronRight, ImageIcon, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: '首页', href: '/', icon: Home },
  { name: '套餐充值', href: '/pricing', icon: CreditCard },
  { name: '个人中心', href: '/profile', icon: User },
  { name: '使用统计', href: '/stats', icon: BarChart3 },
  { name: '设置', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                BG Remover
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 侧边栏导航 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                    <span>{item.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-purple-400" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* 移动端底部导航 */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
            <div className="flex justify-around py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                      ${isActive ? 'text-purple-600' : 'text-slate-500'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 主内容区域 */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
