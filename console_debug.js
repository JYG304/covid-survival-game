// 浏览器控制台错误捕获脚本
// 复制下面的代码到浏览器控制台(F12)运行，查看详细错误

console.clear();
console.log('%c🔍 开始检测模块加载错误...', 'color: #00ff00; font-size: 16px; font-weight: bold;');
console.log('');

// 捕获所有错误
const errors = [];

window.addEventListener('error', (e) => {
  errors.push({
    type: 'error',
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    error: e.error
  });
  console.error('❌ 错误捕获:', e.message, '\n文件:', e.filename, '\n行号:', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  errors.push({
    type: 'rejection',
    reason: e.reason
  });
  console.error('❌ Promise拒绝:', e.reason);
});

// 测试每个模块
const testModules = async () => {
  const modules = [
    './src/data/gameState.js',
    './src/data/landmarks.js',
    './src/utils/audio.js',
    './src/ui/toast.js',
    './src/ui/hud.js',
    './src/game/player.js',
    './src/game/renderer.js',
    './src/systems/timeSystem.js',
    './src/systems/actionSystem.js',
    './src/main.js'
  ];

  for (const mod of modules) {
    try {
      console.log(`%c⏳ 加载: ${mod}`, 'color: #00aaff;');
      const m = await import(mod);
      console.log(`%c✅ 成功: ${mod}`, 'color: #00ff00;', '导出:', Object.keys(m));
    } catch (err) {
      console.error(`%c❌ 失败: ${mod}`, 'color: #ff0000;', '\n错误:', err.message, '\n堆栈:', err.stack);
    }
  }

  console.log('');
  console.log('%c检测完成！', 'color: #00ff00; font-size: 16px; font-weight: bold;');
  console.log('%c错误总数:', 'color: #ffaa00;', errors.length);

  if (errors.length > 0) {
    console.log('%c所有错误:', 'color: #ff0000; font-weight: bold;');
    console.table(errors);
  }
};

testModules();
