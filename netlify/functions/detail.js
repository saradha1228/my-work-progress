const https = require('https');

const KF_HOST = 'work.kissflow.com';
const KF_BASE = '/case/2/AcFlqmVfTZ1X_CP008/QA_Chapter_Task_Tracker/view/QA_Chapter_Task_Tracker_assigned_to_me/';
const KEY_ID = 'Ak7f3804f1-9076-4805-87a6-67e98c92064d';
const KEY_SECRET = 'T2QDfpHWyGkaebLk0HuEN9yR8mLZIcF-uLjkd2TBbEHx0ht1NcrndcRPFP5mBEmY4LC1InjcYhy61sMbaINl5g';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders() };
  }

  const itemId = event.queryStringParameters && event.queryStringParameters.id;
  if (!itemId) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Missing id' }) };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: KF_HOST,
      port: 443,
      path: KF_BASE + itemId,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key-Id': KEY_ID,
        'X-Access-Key-Secret': KEY_SECRET
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        body: data
      }));
    });

    req.on('error', (e) => resolve({
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: e.message })
    }));

    req.end();
  });
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
