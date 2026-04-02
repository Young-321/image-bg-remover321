// 测试 PayPal 订单创建响应
const PAYPAL_CLIENT_ID = 'Af-FZa2gC2hgPNMEDOvhZ4kJ21L40hIcgJljnBRps4euobIXU06Ego_7xNxxRiy3SuDAZ9K5gYq9SBek';
const PAYPAL_CLIENT_SECRET = 'EGw_CIAGvz27z198FZrnsaaAsFpH8tPGbp3yRFMcI2e_XpplPMqqh-3BVooSjOseTkWr5GzPK03IivLk';

async function testPayPalOrder() {
  try {
    // 1. 获取 access token
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    console.log('Access Token:', tokenData.access_token ? '✓ Got token' : '✗ No token');

    // 2. 创建订单
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: '入门版 - 100 张处理额度',
          custom_id: JSON.stringify({ planId: 'starter' }),
          amount: {
            currency_code: 'USD',
            value: '1.39',
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'BG Remover',
            locale: 'zh-CN',
            landing_page: 'LOGIN',
            user_action: 'PAY_NOW',
            return_url: 'https://www.alltoolsimagebgremove.shop/pricing?success=true',
            cancel_url: 'https://www.alltoolsimagebgremove.shop/pricing?cancelled=true',
          },
        },
      },
    };

    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify(orderData),
    });

    const orderResult = await orderResponse.json();
    console.log('\nOrder Response:');
    console.log(JSON.stringify(orderResult, null, 2));

    // 3. 查找 approval link
    console.log('\nLinks:');
    if (orderResult.links) {
      orderResult.links.forEach((link: any, index: number) => {
        console.log(`  [${index}] ${link.rel}: ${link.href}`);
      });
    }

    const approveLink = orderResult.links?.find((link: any) => link.rel === 'approve');
    console.log('\nApprove Link:', approveLink?.href || 'NOT FOUND');

  } catch (error) {
    console.error('Error:', error);
  }
}

testPayPalOrder();
