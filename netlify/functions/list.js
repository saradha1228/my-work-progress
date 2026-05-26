const https = require('https');

const KF_HOST = 'work.kissflow.com';
const KF_PATH = '/case/2/AcFlqmVfTZ1X_CP008/QA_Chapter_Task_Tracker/view/QA_Chapter_Task_Tracker_assigned_to_me/list/items?view_id=QA_Chapter_Task_Tracker_assigned_to_me&apply_preference=true&q=&visualization=Kanban&page_number=1&edit_view=false';
const KEY_ID = 'Ak7f3804f1-9076-4805-87a6-67e98c92064d';
const KEY_SECRET = 'T2QDfpHWyGkaebLk0HuEN9yR8mLZIcF-uLjkd2TBbEHx0ht1NcrndcRPFP5mBEmY4LC1InjcYhy61sMbaINl5g';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders() };
  }

  const body = event.body || JSON.stringify({
    Column: ['Status_0001_New', 'Status_0001_InProgress', 'Status_0001_Closed'],
    LastModifiedAt: new Date().toISOString(),
    FilterParam: {},
    ViewId: 'QA_Chapter_Task_Tracker_assigned_to_me'
  });

  return proxy('POST', KF_PATH, body);
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function proxy(method, path, body) {
  return new Promise((resolve) => {
    const options = {
      hostname: KF_HOST,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key-Id': KEY_ID,
        'X-Access-Key-Secret': KEY_SECRET,
        'Content-Length': body ? Buffer.byteLength(body) : 0
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

    if (body) req.write(body);
    req.end();
  });
}
