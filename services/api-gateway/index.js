import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') { res.writeHead(200); return res.end('ok'); }
  if (req.method === 'POST' && req.url === '/robots') {
    res.writeHead(201, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.method === 'GET' && req.url === '/robots') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify([]));
  }
  res.writeHead(404); res.end('not found');
});
server.listen(8080, () => console.log('api-gateway:8080'));
