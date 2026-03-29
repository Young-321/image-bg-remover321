'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, RefreshCw, X, CheckCircle2, LogIn, LogOut, User, Check, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // 处理 OAuth 回调和恢复登录状态
  useEffect(() => {
    try {
      // 1. 先尝试从 localStorage 恢复登录状态
      const savedLoginState = localStorage.getItem('bgRemover_loginState');
      if (savedLoginState) {
        try {
          const state = JSON.parse(savedLoginState);
          if (state.isLoggedIn && state.userEmail) {
            setIsLoggedIn(true);
            setUserEmail(state.userEmail);
            setUserName(state.userName || state.userEmail.split('@')[0]);
            console.log('从localStorage恢复登录状态:', state.userEmail);
          }
        } catch (e) {
          console.warn('解析登录状态失败:', e);
          localStorage.removeItem('bgRemover_loginState');
        }
      }
      
      // 2. 再检查 URL 中是否有 OAuth 响应（支持hash和search两种方式）
      let params: URLSearchParams;
      
      // 先检查hash（#后面）
      const hash = window.location.hash.substring(1);
      if (hash) {
        params = new URLSearchParams(hash);
        console.log('从hash获取OAuth参数');
      } 
      // 再检查search（?后面）
      else {
        const search = window.location.search.substring(1);
        if (!search) return; // 没有OAuth参数，直接返回
        params = new URLSearchParams(search);
        console.log('从search获取OAuth参数');
      }
      
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');
      const error = params.get('error');
      const state = params.get('state');
      
      console.log('OAuth 回调参数:', { 
        hasAccessToken: !!accessToken, 
        hasIdToken: !!idToken, 
        error: error,
        state: state
      });
      
      if (error) {
        setError(`OAuth 错误: ${error}`);
        // 清除 URL 中的错误参数
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      if (accessToken) {
        // 使用access_token获取用户信息
        console.log('使用access_token获取用户信息...');
        
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('获取用户信息失败');
          }
          return response.json();
        })
        .then(userInfo => {
          console.log('获取到的用户信息:', userInfo);
          
          if (userInfo && userInfo.email) {
            setIsLoggedIn(true);
            setUserEmail(userInfo.email);
            setUserName(userInfo.name || userInfo.email.split('@')[0]);
            
            // 保存登录状态到 localStorage
            const loginState = {
              isLoggedIn: true,
              userEmail: userInfo.email,
              userName: userInfo.name || userInfo.email.split('@')[0],
              timestamp: Date.now()
            };
            localStorage.setItem('bgRemover_loginState', JSON.stringify(loginState));
            console.log('登录状态已保存到localStorage');
            
            // 清除 URL 中的 OAuth 参数
            window.history.replaceState({}, document.title, window.location.pathname);
            
            console.log('登录成功:', userInfo.email);
            
            // 显示欢迎消息（防止重复）
            if (!showWelcome) {
              setShowWelcome(true);
              setTimeout(() => setShowWelcome(false), 4000);
            }
            
            // 清除错误
            setError(null);
          }
        })
        .catch(err => {
          console.error('获取用户信息失败:', err);
          setError('登录处理失败，请重试');
        });
      }
    } catch (err) {
      console.error('OAuth 处理出错:', err);
      setError('OAuth 处理错误，请刷新页面重试');
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    console.log('处理文件:', file.name, file.type, file.size);
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件 (JPG, PNG, WebP)');
      return;
    }
    setError(null);
    setProcessedImage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('文件读取完成');
      setOriginalImage(e.target?.result as string);
    };
    reader.onerror = () => {
      console.error('文件读取错误');
      setError('文件读取失败，请重试');
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleGoogleLogin = () => {
    // ✅ **使用自定义域名 - 已在 Google Cloud Console 配置**
    console.log('🚀 开始 Google OAuth 登录流程 (使用自定义域名)...');
    
    // ✅ 使用已验证的客户端 ID
    const clientId = '492775448989-f5oafsq8cum432o5f27foo8921mgplqb.apps.googleusercontent.com';
    
    // ✅ **使用自定义域名 - https://www.alltoolsimagebgremove.shop**
    const redirectUri = 'https://www.alltoolsimagebgremove.shop';
    
    // ✅ 简化的 scope
    const scope = 'openid email';
    
    // ✅ 生成 state 参数
    const state = 'custom_domain_' + Date.now();
    
    // ✅ 构建 OAuth URL - 确保正确编码
    const encodedRedirect = encodeURIComponent(redirectUri);
    const encodedScope = encodeURIComponent(scope);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodedRedirect}&response_type=token&scope=${encodedScope}&state=${state}&prompt=consent`;
    
    console.log('🔗 生成的 OAuth URL (前150字符):', authUrl.substring(0, 150));
    console.log('📋 配置详情 (使用自定义域名):');
    console.log('  - 客户端ID:', clientId);
    console.log('  - 重定向URI (已配置):', redirectUri);
    console.log('  - 权限范围:', scope);
    console.log('  - 状态参数:', state);
    console.log('  - ✅ 已在 Google Cloud Console 配置');
    
    // 🔧 测试：在当前窗口重定向（避免弹出窗口拦截）
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserName(null);
    // 清除 localStorage 中的登录状态
    localStorage.removeItem('bgRemover_loginState');
    console.log('已退出登录，localStorage已清除');
  };

  const processImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(originalImage);
      const blob = await res.blob();
      const file = new File([blob], 'image.png', { type: blob.type });

      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('size', 'auto');

      // 调用 Cloudflare Worker
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://bg-remover-worker.yangyong900829.workers.dev';
      
      console.log('调用 Worker:', workerUrl);
      
      const response = await fetch(workerUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Worker 响应状态:', response.status);

      if (!response.ok) {
        throw new Error('处理失败');
      }

      const resultBlob = await response.blob();
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setShowComparison(false);
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = 'bg-removed.png';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 欢迎提示 */}
      {showWelcome && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg flex items-center gap-3 max-w-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-900">欢迎回来，{userName}！</p>
              <p className="text-sm text-green-700">已成功登录</p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              BG Remover
            </span>
            {/* 登录状态徽章 */}
            {isLoggedIn && (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                已登录
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* 用户信息卡片 */}
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {(userName || userEmail || 'U')[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50 hover:text-red-600 hover:border-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">退出登录</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 hover:border-purple-400 hover:text-purple-600 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>使用 Google 登录</span>
              </button>
            )}
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {!originalImage ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                一键移除图片背景
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mb-6">
                上传图片，AI 自动识别主体并移除背景，支持 PNG 透明格式下载
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                每月前 50 张免费
              </div>
              
              {isLoggedIn ? (
                <div className="mt-6">
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(userName || userEmail || 'U')[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-900">欢迎回来，{userName}！</p>
                      <p className="text-sm text-green-700">已登录 · 享受完整功能</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-sm text-slate-500 mb-2">登录后可享受更多功能：</p>
                  <ul className="text-sm text-slate-600 text-left inline-block">
                    <li className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      保存处理历史
                    </li>
                    <li className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      批量处理功能
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      自定义输出设置
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative w-full max-w-xl h-80 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden",
                dragOver
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-300 hover:border-purple-400 hover:bg-slate-50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  console.log('文件输入变化:', e.target.files);
                  if (e.target.files?.[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                  dragOver ? "bg-purple-100" : "bg-slate-100 group-hover:bg-purple-100"
                )}>
                  <Upload className={cn(
                    "w-8 h-8 transition-colors duration-300",
                    dragOver ? "text-purple-600" : "text-slate-400 group-hover:text-purple-600"
                  )} />
                </div>
                <p className="text-lg font-medium text-slate-700">
                  {dragOver ? "松开上传图片" : "点击或拖拽上传图片"}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  支持 JPG、PNG、WebP，最大 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">原图</h3>
              </div>
              <div className="relative aspect-square bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={originalImage}
                  alt="原图"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {processedImage ? "处理结果" : "等待处理..."}
                </h3>
                {processedImage && (
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {showComparison ? "隐藏对比" : "显示对比"}
                  </button>
                )}
              </div>
              <div className="relative aspect-square bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                {processedImage ? (
                  <>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2UwZTBlMCIgZmlsbC1vcGFjaXR5PSIwLjUiPjxwYXRoIGQ9Ik0wIDEwaDEwdjEwSDB6TTEwIDBoMTB2MTBIMTB6Ii8+PC9nPjwvc3ZnPg==')]"></div>
                    <img
                      src={processedImage}
                      alt="处理结果"
                      className="relative z-10 w-full h-full object-contain"
                    />
                    {showComparison && (
                      <div className="absolute inset-0 z-20">
                        <img
                          src={originalImage}
                          alt="对比"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isProcessing ? (
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                        <p className="text-slate-600">正在处理中...</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-3" />
                        <p>点击下方按钮处理图片</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            {!processedImage ? (
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-600/25"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    移除背景
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={downloadImage}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-600/25"
                >
                  <Download className="w-5 h-5" />
                  下载 PNG
                </button>
                <button
                  onClick={reset}
                  className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  重新上传
                </button>
              </>
            )}
          </div>
        </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>由 Next.js + AI 驱动 · 本地处理，保护隐私</p>
          <p className="mt-2">需要帮助？请联系 support@example.com</p>
        </div>
      </footer>
    </div>
  );
}