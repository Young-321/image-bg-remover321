import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 设置为静态导出，部署到 Cloudflare Pages
  output: 'export',
  // 禁用基于服务器的功能
  images: {
    unoptimized: true,
  },
  // 增加静态导出时的超时时间
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
