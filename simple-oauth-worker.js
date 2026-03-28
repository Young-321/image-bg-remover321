/**
 * 简化的 Google OAuth Worker
 * 跳过 state 验证，用于测试
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Google OAuth 配置
    const CLIENT_ID = "492775448989-f5oafsq8cum432o5f27foo8921mgplqb.apps.googleusercontent.com";
    // ✅ 使用自定义域名
    const REDIRECT_URI = "https://www.alltoolsimagebgremove.shop/auth/callback";
    
    // CORS 头部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (path === '/auth/login') {
      // 直接重定向到 Google OAuth，跳过 state 生成
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      
      // 添加一个简单的 state（可选）
      authUrl.searchParams.set('state', 'test_state_123');
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': authUrl.toString(),
          ...corsHeaders,
        },
      });
      
    } else if (path === '/auth/callback') {
      // 处理回调，跳过 state 验证
      const code = url.searchParams.get('code');
      
      if (!code) {
        return new Response('Missing authorization code. Please try again.', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders,
          },
        });
      }
      
      // 直接重定向回前端，显示登录成功
      // 在实际应用中，这里应该交换 token 并获取用户信息
      const frontendUrl = 'https://www.alltoolsimagebgremove.shop';
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Successful</title>
          <meta http-equiv="refresh" content="3;url=${frontendUrl}">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 {
              font-size: 2.5em;
              margin-bottom: 20px;
            }
            p {
              font-size: 1.2em;
              margin-bottom: 30px;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top: 4px solid white;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Login Successful!</h1>
            <p>You have successfully logged in with Google.</p>
            <p>Redirecting to BG Remover...</p>
            <div class="spinner"></div>
            <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
              If you are not redirected automatically, <a href="${frontendUrl}" style="color: #fff; text-decoration: underline;">click here</a>.
            </p>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders,
        },
      });
      
    } else if (path === '/auth/test') {
      // 测试端点
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'OAuth Worker is running',
        endpoints: ['/auth/login', '/auth/callback', '/auth/test'],
        client_id: CLIENT_ID,
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    
    // 默认响应
    return new Response('Simple OAuth Worker\nAvailable endpoints:\n- GET /auth/login\n- GET /auth/callback\n- GET /auth/test', {
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders,
      },
    });
  }
};