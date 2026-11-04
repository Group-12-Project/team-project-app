'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const publicRoot = path.join(__dirname, '..', 'public');
const files = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/catalog.js': ['catalog.js', 'text/javascript; charset=utf-8'], '/classes.js': ['classes.js', 'text/javascript; charset=utf-8'], '/schedule.js': ['schedule.js', 'text/javascript; charset=utf-8'], '/ratings.js': ['ratings.js', 'text/javascript; charset=utf-8'], '/career.js': ['career.js', 'text/javascript; charset=utf-8'], '/styles.css': ['styles.css', 'text/css; charset=utf-8'] };
function createServer() {
  return http.createServer(async (req, res) => {
    const file = files[new URL(req.url, 'http://localhost').pathname];
    if (!file || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return;
    }
    try {
      const body = await fs.readFile(path.join(publicRoot, file[0]));
      res.writeHead(200, {
        'Content-Type': file[1],
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(500); res.end('Unable to load app'); }
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, '127.0.0.1', () => console.log(`GradPath: http://localhost:${port}`));
}
module.exports = { createServer };
