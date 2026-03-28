/**
 * Cloudflare Worker for background removal with OAuth support
 * 处理图片移除和 Google OAuth 认证
 */

export interface Env {
  REMOVE_BG_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

// 生成随机字符串
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// 从 cookie 获取值
function getCookieValue(cookies: string, name: string): string | null {
  const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS 头部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }
    
    // OAuth 路由
    if (path === '/auth/login') {
      // 生成 state 参数
      const state = generateRandomString(16);
      // ✅ 使用自定义域名
      const redirectUri = 'https://www.alltoolsimagebgremove.shop/auth/callback';
      
      // 构建 Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '492775448989-f5oafsq8cum432o5f27foo8921mgplqb.apps.googleusercontent.com');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', state);
      
      // 设置 state cookie
      const stateCookie = `oauth_state=${state}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax; Secure`;
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': authUrl.toString(),
          'Set-Cookie': stateCookie,
          ...corsHeaders,
        },
      });
      
    } else if (path === '/auth/callback') {
      // 处理回调
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookies = request.headers.get('Cookie') || '';
      const cookieState = getCookieValue(cookies, 'oauth_state');
      
      // 验证 state
      if (!state || !cookieState || state !== cookieState) {
        return new Response('Invalid OAuth state. Please try logging in again.', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders,
          },
        });
      }
      
      if (!code) {
        return new Response('Missing authorization code', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders,
          },
        });
      }
      
      // ✅ 使用自定义域名
      const redirectUri = 'https://www.alltoolsimagebgremove.shop/auth/callback';
      
      try {
        // 交换 token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID || '492775448989-f5oafsq8cum432o5f27foo8921mgplqb.apps.googleusercontent.com',
            client_secret: env.GOOGLE_CLIENT_SECRET || '',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange error:', tokenResponse.status, errorText);
          return new Response('OAuth token exchange failed', {
            status: 400,
            headers: {
              'Content-Type': 'text/plain',
              ...corsHeaders,
            },
          });
        }
        
        const tokenData = await tokenResponse.json();
        
        // 获取用户信息
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          return new Response('Failed to fetch user info', {
            status: 400,
            headers: {
              'Content-Type': 'text/plain',
              ...corsHeaders,
            },
          });
        }
        
        const userInfo = await userInfoResponse.json();
        
        // 创建会话 token
        const sessionToken = generateRandomString(32);
        const sessionData = {
          userId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24小时
        };
        
        // 在实际应用中，这里应该存储 sessionData 到 KV
        // 简化处理：编码到 cookie 中（注意：这不是安全的最佳实践）
        const sessionCookie = `user_session=${encodeURIComponent(JSON.stringify(sessionData))}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax; Secure`;
        
        // 重定向回前端
        const frontendUrl = 'https://www.alltoolsimagebgremove.shop';
        return new Response(null, {
          status: 302,
          headers: {
            'Location': frontendUrl,
            'Set-Cookie': sessionCookie,
            ...corsHeaders,
          },
        });
        
      } catch (error) {
        console.error('OAuth error:', error);
        return new Response('Internal server error during OAuth', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders,
          },
        });
      }
      
    } else if (path === '/auth/logout') {
      // 退出登录
      const logoutCookie = 'user_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure';
      return new Response(null, {
        status: 302,
        headers: {
          'Location': 'https://www.alltoolsimagebgremove.shop',
          'Set-Cookie': logoutCookie,
          ...corsHeaders,
        },
      });
      
    } else if (path === '/auth/status') {
      // 检查登录状态
      const cookies = request.headers.get('Cookie') || '';
      const sessionCookie = getCookieValue(cookies, 'user_session');
      
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
          return new Response(JSON.stringify({
            logged_in: true,
            user: {
              email: sessionData.email,
              name: sessionData.name,
            },
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        } catch {
          // 如果解析失败，视为未登录
        }
      }
      
      return new Response(JSON.stringify({
        logged_in: false,
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
      
    } else if (request.method === 'POST' && path === '/') {
      // 原有的图片处理逻辑
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
              ...corsHeaders,
            },
          });
        }

        // 解析 FormData
        const formData = await request.formData();
        const imageFile = formData.get('file') as File | null;
        const imageFileAlt = formData.get('image_file') as File | null;
        const image = imageFile || imageFileAlt;

        if (!image) {
          return new Response(JSON.stringify({
            error: 'No image provided',
            message: 'Please upload an image file',
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(image.type)) {
          return new Response(JSON.stringify({
            error: 'Invalid file type',
            message: 'Supported formats: JPG, PNG, WebP',
            supported: validTypes,
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // 检查文件大小（10MB 限制）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (image.size > maxSize) {
          return new Response(JSON.stringify({
            error: 'File too large',
            message: 'Maximum file size is 10MB',
            max_size: maxSize,
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        console.log(`Processing image: ${image.name} (${image.size} bytes)`);

        // 创建 FormData 发送到 remove.bg
        const removeBgFormData = new FormData();
        removeBgFormData.append('image_file', image);
        removeBgFormData.append('size', 'auto');

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
              ...corsHeaders,
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
            ...corsHeaders,
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
            ...corsHeaders,
          },
        });
      }
    }

    // 默认响应
    return new Response('BG Remover API with OAuth\nAvailable endpoints:\n- POST / (image processing)\n- GET /auth/login (OAuth login)\n- GET /auth/callback (OAuth callback)\n- GET /auth/logout (logout)\n- GET /auth/status (check login status)', {
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders,
      },
    });
  },
};