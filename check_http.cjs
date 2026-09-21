const http = require('http');

const url = 'http://localhost:8080/browser_test.html';

console.log('正在获取测试页面HTML...\n');

http.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ 页面可访问');
    console.log(`状态码: ${res.statusCode}`);
    console.log(`内容长度: ${data.length} 字节\n`);

    // 尝试获取main.js看看能否访问
    http.get('http://localhost:8080/src/main.js', (res2) => {
      let js = '';
      res2.on('data', (chunk) => { js += chunk; });
      res2.on('end', () => {
        console.log('✅ src/main.js 可访问');
        console.log(`内容长度: ${js.length} 字节`);
        console.log('\n前50行:');
        console.log(js.split('\n').slice(0, 50).join('\n'));
      });
    }).on('error', (err) => {
      console.error('❌ 无法访问 src/main.js:', err.message);
    });
  });
}).on('error', (err) => {
  console.error('❌ 错误:', err.message);
});
