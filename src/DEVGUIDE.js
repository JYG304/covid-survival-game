/**
 * 开发指南
 *
 * 本文档提供代码规范和开发建议
 */

// ============================================
// 代码组织原则
// ============================================

/**
 * 1. 单一职责：每个模块只负责一件事
 *    - data/: 只存放数据配置
 *    - systems/: 处理游戏系统逻辑
 *    - ui/: 处理界面显示
 *    - game/: 核心游戏机制
 *    - utils/: 通用工具函数
 */

/**
 * 2. 避免循环依赖
 *    - gameState.js 不应该导入其他模块
 *    - 使用事件或回调解耦
 */

/**
 * 3. 命名规范
 *    - 文件名：camelCase.js
 *    - 函数名：camelCase()
 *    - 常量：UPPER_SNAKE_CASE
 *    - 组件/类：PascalCase
 */

// ============================================
// 添加新功能流程
// ============================================

/**
 * 示例：添加"睡眠质量"系统
 *
 * 步骤1: 在 gameState.js 添加状态
 * ```javascript
 * sleepQuality: 100,  // 0-100
 * ```
 *
 * 步骤2: 在 timeSystem.js 添加时间相关逻辑
 * ```javascript
 * function onHourTick() {
 *   if (gameState.hour >= 0 && gameState.hour < 6) {
 *     // 凌晨时段消耗睡眠质量
 *     gameState.sleepQuality = Math.max(0, gameState.sleepQuality - 2);
 *   }
 * }
 * ```
 *
 * 步骤3: 在 hud.js 添加显示
 * ```javascript
 * function updateVitals() {
 *   // ...
 *   const sleepEl = document.getElementById('barSleep');
 *   if (sleepEl) sleepEl.innerText = `${Math.round(gameState.sleepQuality)}%`;
 * }
 * ```
 *
 * 步骤4: 在 actionSystem.js 添加恢复方法
 * ```javascript
 * export function sleep(player) {
 *   gameState.sleepQuality = Math.min(100, gameState.sleepQuality + 50);
 *   // ...
 * }
 * ```
 */

// ============================================
// 性能优化建议
// ============================================

/**
 * 1. Canvas 渲染优化
 *    - 使用离屏 Canvas 缓存静态内容
 *    - 只重绘变化的区域
 *    - 减少 save/restore 调用
 */

/**
 * 2. 状态更新优化
 *    - 批量更新 DOM 元素
 *    - 使用 requestAnimationFrame
 *    - 避免频繁读取 DOM
 */

/**
 * 3. 内存管理
 *    - 及时清理不用的监听器
 *    - 限制数组大小（如 floatingTexts）
 *    - 对象池复用（如粒子效果）
 */

// ============================================
// 调试技巧
// ============================================

/**
 * 1. 快速修改游戏状态（在浏览器控制台）
 * ```javascript
 * // 修改金钱
 * window.gameState.money = 10000;
 *
 * // 快速推进时间
 * window.advanceTime(480); // 推进8小时
 *
 * // 传送玩家
 * window.player.x = 1500;
 * ```
 */

/**
 * 2. 性能监控
 * ```javascript
 * // 在 gameLoop 中添加
 * const fps = 1 / delta;
 * console.log('FPS:', fps.toFixed(1));
 * ```
 */

/**
 * 3. 状态追踪
 * ```javascript
 * // 监听状态变化
 * const originalMoney = gameState.money;
 * Object.defineProperty(gameState, 'money', {
 *   get() { return this._money || originalMoney; },
 *   set(v) {
 *     console.log('Money changed:', this._money, '->', v);
 *     this._money = v;
 *   }
 * });
 * ```
 */

// ============================================
// 常见问题
// ============================================

/**
 * Q: 为什么需要 HTTP 服务器运行？
 * A: ES6 模块使用 import/export，浏览器的 CORS 策略要求通过 HTTP 协议加载。
 *
 * Q: 如何添加外部音频文件？
 * A: 将音频文件放入 assets/audio/，然后在 audio.js 中添加加载逻辑。
 *
 * Q: Canvas 模糊怎么办？
 * A: 使用 devicePixelRatio 处理高分屏：
 * ```javascript
 * const dpr = window.devicePixelRatio || 1;
 * canvas.width = canvas.offsetWidth * dpr;
 * canvas.height = canvas.offsetHeight * dpr;
 * ctx.scale(dpr, dpr);
 * ```
 *
 * Q: 如何实现存档系统？
 * A: 使用 localStorage：
 * ```javascript
 * // 保存
 * localStorage.setItem('saveData', JSON.stringify(gameState));
 *
 * // 读取
 * const data = JSON.parse(localStorage.getItem('saveData'));
 * Object.assign(gameState, data);
 * ```
 */

// ============================================
// 扩展建议
// ============================================

/**
 * 1. 添加对话系统
 *    - 创建 src/systems/dialogueSystem.js
 *    - 定义 NPC 对话数据结构
 *    - 实现对话树逻辑
 *
 * 2. 添加成就系统
 *    - 创建 src/systems/achievementSystem.js
 *    - 定义成就触发条件
 *    - 实现成就解锁通知
 *
 * 3. 添加随机事件
 *    - 创建 src/systems/eventSystem.js
 *    - 定义事件池和触发概率
 *    - 实现事件选择界面
 *
 * 4. 多语言支持
 *    - 创建 src/data/i18n/
 *    - 提取所有文本到语言文件
 *    - 实现语言切换功能
 */

export default {
  version: '1.0.0',
  lastUpdate: '2026-09-21',
  architecture: 'modular',
  modules: 10,
  linesOfCode: '~1500 (from 2200+)'
};
