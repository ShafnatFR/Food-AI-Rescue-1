const https = require('https');

const data = JSON.stringify({
  action: 'LOGIN_USER',
  data: {
    email: 'fake@demo.com',
    password: 'wrong'
  }
});

const options = {
  hostname: 'food-ai-rescue.vercel.app',
  port: 443,
  path: '/api',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => console.log(`BODY: ${responseData}`));
});
req.on('error', console.error);
req.write(data);
req.end();
