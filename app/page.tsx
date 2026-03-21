'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, RefreshCw, X, CheckCircle2 } from 'lucide-react';
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
      // 在生产环境中，Worker 会处理 API 调用
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://bg-remover-worker.your-account.workers.dev';
      
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
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              BG Remover
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            GitHub
          </a>
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
        </div>
      </footer>
    </div>
  );
}
