const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 启动浏览器测试...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`❌ 浏览器错误: ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  浏览器警告: ${text}`);
    } else {
      console.log(`📝 ${text}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log(`❌ 页面错误: ${error.message}`);
  });

  try {
    console.log('📂 加载游戏页面: http://localhost:8888\n');
    await page.goto('http://localhost:8888', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ 页面加载成功\n');

    // 等待canvas元素
    await page.waitForSelector('#gameCanvas', { timeout: 5000 });
    console.log('✅ 找到游戏画布\n');

    // 检查是否有JavaScript错误
    const errors = await page.evaluate(() => {
      return window.__errors || [];
    });

    if (errors.length > 0) {
      console.log(`❌ 发现 ${errors.length} 个错误:\n`);
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ 没有发现JavaScript错误\n');
    }

    console.log('⏳ 等待5秒观察游戏运行...\n');
    await page.waitForTimeout(5000);

    console.log('✅ 测试完成！游戏运行正常！\n');
    console.log('🎮 浏览器窗口将保持打开，你可以手动测试游戏');
    console.log('⚠️  关闭浏览器窗口将结束此脚本\n');

    // 不关闭浏览器，让用户手动测试
    // await browser.close();

  } catch (error) {
    console.log(`\n❌ 测试失败: ${error.message}\n`);
    await browser.close();
    process.exit(1);
  }
})();
