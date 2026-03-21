/**
 * Cloudflare Worker for background removal
 * 直接处理图片，无文件存储，纯内存操作
 */

export interface Env {
  REMOVE_BG_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只处理 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed',
        supported_methods: ['POST'],
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      // 检查 API 密钥
      if (!env.REMOVE_BG_API_KEY || env.REMOVE_BG_API_KEY === 'your-api-key-here') {
        return new Response(JSON.stringify({
          error: 'Server configuration error',
          message: 'Please configure REMOVE_BG_API_KEY in Cloudflare Worker settings',
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 解析 FormData
      const formData = await request.formData();
      const imageFile = formData.get('file') as File | null;

      if (!imageFile) {
        return new Response(JSON.stringify({
          error: 'No image provided',
          message: 'Please upload an image file',
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 检查文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(imageFile.type)) {
        return new Response(JSON.stringify({
          error: 'Invalid file type',
          message: 'Supported formats: JPG, PNG, WebP',
          supported: validTypes,
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 检查文件大小（10MB 限制）
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageFile.size > maxSize) {
        return new Response(JSON.stringify({
          error: 'File too large',
          message: 'Maximum file size is 10MB',
          max_size: maxSize,
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      console.log(`Processing image: ${imageFile.name} (${imageFile.size} bytes)`);

      // 创建 FormData 发送到 remove.bg
      const removeBgFormData = new FormData();
      removeBgFormData.append('image_file', imageFile);
      removeBgFormData.append('size', 'auto'); // auto, preview, regular, hd, 4k

      // 调用 remove.bg API
      const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': env.REMOVE_BG_API_KEY,
        },
        body: removeBgFormData,
      });

      // 处理 remove.bg 响应
      if (!removeBgResponse.ok) {
        const errorText = await removeBgResponse.text();
        console.error('Remove.bg API error:', removeBgResponse.status, errorText);

        // 用户友好的错误消息
        let userMessage = 'Failed to remove background';
        let status = 500;

        switch (removeBgResponse.status) {
          case 400:
            userMessage = 'Image format not supported or content cannot be recognized';
            status = 400;
            break;
          case 402:
            userMessage = 'API quota exceeded (free: 50 images/month)';
            status = 402;
            break;
          case 429:
            userMessage = 'Too many requests, please try again later';
            status = 429;
            break;
          case 403:
            userMessage = 'Invalid API key';
            status = 500;
            break;
        }

        return new Response(JSON.stringify({
          error: userMessage,
          status: removeBgResponse.status,
        }), {
          status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 获取处理后的图片
      const resultBuffer = await removeBgResponse.arrayBuffer();

      // 返回图片
      return new Response(resultBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="bg-removed.png"',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
          'X-Processed-By': 'Cloudflare Worker + Remove.bg API',
          'X-Free-Quota': '50 images/month',
        },
      });

    } catch (error) {
      console.error('Worker error:', error);

      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};