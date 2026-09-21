const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT_DIR, req.url === '/' ? '/index.html' : req.url);
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // 安全检查：防止目录遍历
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.error(`[404] ${req.url}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        console.error(`[500] ${req.url} - ${error.code}`);
        res.writeHead(500);
        res.end(`500 Internal Server Error: ${error.code}`);
      }
    } else {
      console.log(`[200] ${req.url} (${content.length} bytes)`);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 服务器已启动！\n`);
  console.log(`   本地地址: http://localhost:${PORT}`);
  console.log(`   根目录: ${ROOT_DIR}\n`);
  console.log(`📝 访问日志:\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用！`);
    console.error(`   请先关闭其他服务或更改端口号`);
  } else {
    console.error(`❌ 服务器错误:`, err);
  }
  process.exit(1);
});
