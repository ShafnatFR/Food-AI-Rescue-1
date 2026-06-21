const https = require('https');

const options = {
  hostname: 'ttpwubrflbfymefixuav.supabase.co',
  port: 443,
  path: '/rest/v1/users?select=*',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_JDt5kMZ_ujLoDb9nHfzpVw_Me4PpyWn',
    'Authorization': 'Bearer sb_publishable_JDt5kMZ_ujLoDb9nHfzpVw_Me4PpyWn'
  }
};

https.get(options, (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    console.log("Response:", resp.statusCode);
    console.log("Body:", data.substring(0, 200));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
