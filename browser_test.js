const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });

  try {
    console.log('正在加载 http://localhost:8080/index.html ...');
    await page.goto('http://localhost:8080/index.html', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    console.log('\n========== 错误列表 ==========');
    if (errors.length === 0) {
      console.log('✅ 没有发现JavaScript错误！');
    } else {
      errors.forEach((err, i) => {
        console.log(`\n错误 #${i + 1}:`);
        console.log('消息:', err.message);
        console.log('堆栈:', err.stack);
      });
    }

    console.log('\n========== 控制台输出 ==========');
    consoleMessages.forEach(msg => console.log(msg));

  } catch (err) {
    console.error('加载失败:', err.message);
  } finally {
    await browser.close();
  }
})();
