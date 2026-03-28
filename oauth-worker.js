/**
 * 简单的 Google OAuth Worker
 * 处理 OAuth 2.0 认证流程
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Google OAuth 配置
    const CLIENT_ID = env.GOOGLE_CLIENT_ID || "492775448989-f5oafsq8cum432o5f27foo8921mgplqb.apps.googleusercontent.com";
    const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
    // ✅ 使用自定义域名
    const REDIRECT_URI = 'https://www.alltoolsimagebgremove.shop/auth/callback';
    
    // 处理不同的路由
    if (path === '/auth/login') {
      // 生成随机的 state 参数，用于防止 CSRF 攻击
      const state = generateRandomString(16);
      const nonce = generateRandomString(16);
      
      // 保存 state 到 cookie（简单实现）
      const stateCookie = `oauth_state=${state}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax`;
      
      // 构建 Google OAuth 授权 URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('nonce', nonce);
      
      // 重定向到 Google OAuth
      return new Response(null, {
        status: 302,
        headers: {
          'Location': authUrl.toString(),
          'Set-Cookie': stateCookie,
        },
      });
      
    } else if (path === '/auth/callback') {
      // 处理 OAuth 回调
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      // 从 cookie 中获取保存的 state
      const cookies = request.headers.get('Cookie') || '';
      const cookieState = getCookieValue(cookies, 'oauth_state');
      
      // 验证 state 参数（防止 CSRF 攻击）
      if (!state || state !== cookieState) {
        return new Response('Invalid OAuth state', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      if (!code) {
        return new Response('Missing authorization code', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      // 使用授权码交换访问令牌
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return new Response(`Token exchange failed: ${error}`, {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const idToken = tokenData.id_token;
      
      // 使用访问令牌获取用户信息
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!userInfoResponse.ok) {
        return new Response('Failed to fetch user info', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      const userInfo = await userInfoResponse.json();
      
      // 创建简单的会话 token
      const sessionToken = generateRandomString(32);
      const userData = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sessionToken: sessionToken,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天过期
      };
      
      // 在实际应用中，这里应该将用户数据存储到数据库或 KV 中
      // 这里简化处理，直接返回用户信息
      
      // 重定向回前端页面，携带用户信息
      const frontendUrl = new URL('https://www.alltoolsimagebgremove.shop');
      frontendUrl.searchParams.set('logged_in', 'true');
      frontendUrl.searchParams.set('email', encodeURIComponent(userInfo.email));
      frontendUrl.searchParams.set('name', encodeURIComponent(userInfo.name || ''));
      
      // 设置会话 cookie
      const sessionCookie = `user_session=${sessionToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': frontendUrl.toString(),
          'Set-Cookie': sessionCookie,
        },
      });
      
    } else if (path === '/auth/logout') {
      // 退出登录
      const logoutCookie = 'user_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure';
      const stateCookie = 'oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': 'https://www.alltoolsimagebgremove.shop',
          'Set-Cookie': `${logoutCookie}, ${stateCookie}`,
        },
      });
      
    } else if (path === '/auth/status') {
      // 检查登录状态
      const cookies = request.headers.get('Cookie') || '';
      const sessionToken = getCookieValue(cookies, 'user_session');
      
      if (sessionToken) {
        return new Response(JSON.stringify({
          logged_in: true,
          message: 'User is logged in'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        return new Response(JSON.stringify({
          logged_in: false,
          message: 'User is not logged in'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }
    
    // 默认响应
    return new Response('OAuth Worker - Available endpoints: /auth/login, /auth/callback, /auth/logout, /auth/status', {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

// 辅助函数：生成随机字符串
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// 辅助函数：从 cookie 字符串中获取特定 cookie 的值
function getCookieValue(cookies, name) {
  const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}