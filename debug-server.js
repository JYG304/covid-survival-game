const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const errorLog = [];
let requestCount = 0;

const server = http.createServer((req, res) => {
  requestCount++;
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);

  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = MIME_TYPES[extname] || 'application/octet-stream';

  console.log(`[${timestamp}] ${requestCount}. ${req.method} ${req.url}`);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        const errMsg = `404 Not Found: ${req.url}`;
        console.log(`  ❌ ${errMsg}`);
        errorLog.push(`[${timestamp}] ${errMsg}`);

        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <head><meta charset="utf-8"><title>404</title></head>
            <body style="font-family: monospace; padding: 40px; background: #1a1a1a; color: #ff4444;">
              <h1>❌ 404 文件未找到</h1>
              <p>路径: <code style="background: #000; padding: 2px 8px;">${req.url}</code></p>
              <p>完整路径: <code style="background: #000; padding: 2px 8px;">${filePath}</code></p>
              <hr style="border-color: #333;">
              <h2>最近的错误:</h2>
              <pre>${errorLog.slice(-10).join('\n')}</pre>
            </body>
          </html>
        `);
      } else {
        const errMsg = `500 Server Error: ${error.code}`;
        console.log(`  ❌ ${errMsg}`);
        errorLog.push(`[${timestamp}] ${errMsg}`);

        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      console.log(`  ✅ ${content.length} bytes (${mimeType})`);
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('🎮 游戏服务器 + 错误监控');
  console.log('========================================');
  console.log(`✅ 服务器运行在: http://localhost:${PORT}`);
  console.log(`📁 根目录: ${ROOT}`);
  console.log(`🔍 实时监控所有请求和错误\n`);
  console.log('按 Ctrl+C 停止服务器\n');
  console.log('----------------------------------------');
  console.log('请求日志:\n');
});

// 错误处理
process.on('uncaughtException', (err) => {
  console.error(`\n❌ 未捕获的异常: ${err.message}`);
  console.error(err.stack);
});

process.on('SIGINT', () => {
  console.log('\n\n========================================');
  console.log('📊 服务器统计');
  console.log('========================================');
  console.log(`总请求数: ${requestCount}`);
  console.log(`错误数: ${errorLog.length}`);
  if (errorLog.length > 0) {
    console.log('\n最近的错误:');
    errorLog.slice(-5).forEach(err => console.log(`  - ${err}`));
  }
  console.log('\n👋 服务器已关闭');
  process.exit(0);
});
