const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('========================================');
  console.log('🔍 游戏自动测试与错误检测');
  console.log('========================================\n');

  let logContent = '# 游戏运行日志\n\n';

  function log(msg, saveToFile = true) {
    console.log(msg);
    if (saveToFile) {
      logContent += msg + '\n';
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  const errors = [];
  const warnings = [];
  const logs = [];

  // 监听所有控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      errors.push(text);
      log(`❌ 错误: ${text}`);
    } else if (type === 'warning') {
      warnings.push(text);
      log(`⚠️  警告: ${text}`);
    } else {
      logs.push(text);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    errors.push(error.message);
    log(`❌ 页面错误: ${error.message}`);
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    errors.push(`请求失败: ${request.url()}`);
    log(`❌ 请求失败: ${request.url()}`);
  });

  try {
    log('\n📂 1/6: 加载游戏页面...');
    await page.goto('http://localhost:8888', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    log('✅ 页面加载完成\n');

    log('📂 2/6: 等待Canvas元素...');
    const hasCanvas = await page.$('#gameCanvas');
    if (hasCanvas) {
      log('✅ Canvas元素存在\n');
    } else {
      log('❌ Canvas元素不存在\n');
    }

    log('📂 3/6: 检查模块加载...');
    await page.waitForTimeout(2000);

    log('📂 4/6: 检查游戏状态...');
    const gameInfo = await page.evaluate(() => {
      const info = {
        hasGameState: typeof window.gameState !== 'undefined',
        hasDeepGameplay: typeof window.DeepGameplay !== 'undefined',
        canvasWidth: document.getElementById('gameCanvas')?.width || 0,
        canvasHeight: document.getElementById('gameCanvas')?.height || 0,
        title: document.title,
        bodyClasses: document.body.className
      };
      return info;
    });

    log(`  游戏状态: ${gameInfo.hasGameState ? '✅' : '❌'}`);
    log(`  深度玩法: ${gameInfo.hasDeepGameplay ? '✅' : '❌'}`);
    log(`  Canvas尺寸: ${gameInfo.canvasWidth}x${gameInfo.canvasHeight}`);
    log(`  页面标题: ${gameInfo.title}\n`);

    log('📂 5/6: 截图保存...');
    await page.screenshot({ path: '游戏截图.png', fullPage: false });
    log('✅ 截图已保存: 游戏截图.png\n');

    log('📂 6/6: 等待3秒观察运行...');
    await page.waitForTimeout(3000);

    log('\n========================================');
    log('📊 测试结果汇总');
    log('========================================\n');
    log(`❌ 错误数量: ${errors.length}`);
    log(`⚠️  警告数量: ${warnings.length}`);
    log(`📝 日志数量: ${logs.length}\n`);

    if (errors.length > 0) {
      log('========================================');
      log('❌ 发现的错误:');
      log('========================================');
      errors.forEach((err, i) => {
        log(`${i + 1}. ${err}`);
      });
      log('');
    }

    if (warnings.length > 0) {
      log('========================================');
      log('⚠️  发现的警告:');
      log('========================================');
      warnings.forEach((warn, i) => {
        log(`${i + 1}. ${warn}`);
      });
      log('');
    }

    if (errors.length === 0 && warnings.length === 0) {
      log('✅ 没有发现错误或警告！游戏运行正常！\n');
    }

    // 保存日志到文件
    fs.writeFileSync('游戏运行日志.txt', logContent, 'utf-8');
    log('✅ 日志已保存: 游戏运行日志.txt\n', false);

    await browser.close();

    if (errors.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}\n`);
    fs.writeFileSync('游戏运行日志.txt', logContent, 'utf-8');
    await browser.close();
    process.exit(1);
  }
})();
