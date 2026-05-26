const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');

const PORT = 3030;
const KF_HOST = 'work.kissflow.com';
const KF_BASE = '/case/2/AcFlqmVfTZ1X_CP008/QA_Chapter_Task_Tracker/view/QA_Chapter_Task_Tracker_assigned_to_me';
const HEADERS = {
  'Content-Type': 'application/json',
  'X-Access-Key-Id': 'Ak7f3804f1-9076-4805-87a6-67e98c92064d',
  'X-Access-Key-Secret': 'T2QDfpHWyGkaebLk0HuEN9yR8mLZIcF-uLjkd2TBbEHx0ht1NcrndcRPFP5mBEmY4LC1InjcYhy61sMbaINl5g'
};

function proxyRequest(res, method, path, body) {
  const options = {
    hostname: KF_HOST,
    port: 443,
    path,
    method,
    headers: { ...HEADERS, 'Content-Length': body ? Buffer.byteLength(body) : 0 }
  };
  const req = https.request(options, kfRes => {
    let data = '';
    kfRes.on('data', chunk => data += chunk);
    kfRes.on('end', () => {
      res.writeHead(kfRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });
  req.on('error', e => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });
  if (body) req.write(body);
  req.end();
}

http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Proxy: POST /api/list
  if (req.method === 'POST' && pathname === '/api/list') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const kfPath = KF_BASE + '/list/items?view_id=QA_Chapter_Task_Tracker_assigned_to_me&apply_preference=true&q=&visualization=Kanban&page_number=1&edit_view=false';
      proxyRequest(res, 'POST', kfPath, body);
    });
    return;
  }

  // Proxy: GET /api/detail/:id
  if (req.method === 'GET' && pathname.startsWith('/api/detail/')) {
    const itemId = pathname.replace('/api/detail/', '');
    proxyRequest(res, 'GET', KF_BASE + '/' + itemId, null);
    return;
  }

  // Serve index.html
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    fs.readFile(__dirname + '/index.html', (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');

}).listen(PORT, () => {
  console.log(`\n✅  QA Task Manager running at http://localhost:${PORT}\n`);
  console.log('   Open your browser to: http://localhost:' + PORT);
  console.log('   Press Ctrl+C to stop\n');
});
