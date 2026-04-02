'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Image, Shield, Save, Trash2, Check, AlertCircle, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

interface UserSettings {
  defaultFormat: 'png' | 'jpg';
  defaultQuality: number;
  autoSaveHistory: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
  customApiKey?: string;
}

export default function SettingsPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    defaultFormat: 'png',
    defaultQuality: 100,
    autoSaveHistory: true,
    emailNotifications: true,
    browserNotifications: false,
    customApiKey: '',
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

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    logout();
    router.push('/');
  };

  const settingsSections = [
    {
      name: '偏好设置',
      description: '自定义您的使用偏好',
      icon: Settings,
      color: 'from-purple-500 to-blue-500',
      content: (
        <div className="space-y-6">
          {/* 默认输出格式 */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">默认输出格式</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSettings(prev => ({ ...prev, defaultFormat: 'png' }))}
                className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  settings.defaultFormat === 'png'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                PNG (透明背景)
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, defaultFormat: 'jpg' }))}
                className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  settings.defaultFormat === 'jpg'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                JPG (白色背景)
              </button>
            </div>
          </div>

          {/* 图片质量 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">默认图片质量</label>
              <span className="text-sm text-slate-600">{settings.defaultQuality}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={settings.defaultQuality}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultQuality: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* 自动保存历史 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">自动保存处理历史</p>
              <p className="text-sm text-slate-500">自动保存您处理过的图片记录</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, autoSaveHistory: !prev.autoSaveHistory }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.autoSaveHistory ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.autoSaveHistory ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>
      ),
    },
    {
      name: '通知设置',
      description: '管理您的通知偏好',
      icon: Bell,
      color: 'from-green-500 to-emerald-500',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">邮件通知</p>
              <p className="text-sm text-slate-500">接收重要更新和活动通知</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.emailNotifications ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">浏览器通知</p>
              <p className="text-sm text-slate-500">处理完成时弹出通知</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, browserNotifications: !prev.browserNotifications }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.browserNotifications ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.browserNotifications ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>
      ),
    },
    {
      name: '账户安全',
      description: '管理您的账户安全设置',
      icon: Shield,
      color: 'from-red-500 to-rose-500',
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">通过 Google 登录</p>
                <p className="text-sm text-blue-700">您的账户由 Google 账户安全保护，登录记录可在 Google 账户设置中管理</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              退出所有设备
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="text-sm font-medium text-red-800 mb-2">危险区域</h4>
              <p className="text-sm text-red-700 mb-4">删除账户后，所有数据将永久丢失且无法恢复</p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                删除账户
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">设置</h1>
            <p className="text-slate-600 mt-2">管理您的账户偏好和设置</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-600/25"
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                保存设置
              </>
            )}
          </button>
        </div>

        {/* 设置卡片 */}
        <div className="space-y-6">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.name} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{section.name}</h3>
                      <p className="text-slate-600 text-sm">{section.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 删除账户确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">确认删除账户</h3>
                <p className="text-slate-600">此操作将永久删除您的账户和所有相关数据，且无法撤销！</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-red-700">所有处理历史将被删除</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-red-700">所有设置和偏好将丢失</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-red-700">账户将无法恢复</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
