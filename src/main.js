/**
 * 游戏主循环
 * 整合所有系统，驱动游戏运行
 */

import { gameState } from './data/gameState.js';
import { updateTimeFlow } from './systems/timeSystem.js';
import { player, updatePlayer, initControls } from './game/player.js';
import { updateHUD, updateClockButtons } from './ui/hud.js';
import { renderFloatingTexts } from './ui/toast.js';
import {
  renderFarSky,
  renderMidgroundWorld,
  renderRainForeground,
  updateCamera,
  initRain,
  initNPCs,
  cameraX
} from './game/renderer.js';
import { audio } from './utils/audio.js';
import { DeepGameplay, initDeepGameplaySystems, updateDeepGameplay } from './systems/deepGameplayIntegration.js';
import {
  updateParticles,
  renderParticles,
  renderPostProcessing,
  updateScreenShake,
  getShakeOffset
} from './game/enhancedRenderer.js';

let canvas, ctx;
let lastTime = performance.now();

/**
 * 初始化游戏
 */
export function initGame() {
  console.log('[game] build 20260922 click-move / phone / mall');
  canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }

  ctx = canvas.getContext('2d');

  // 设置画布尺寸
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 初始化各个系统
  initControls();
  initRain(canvas.width, canvas.height);
  initNPCs();
  initDeepGameplaySystems();

  // 将深度玩法系统暴露到全局，供其他模块使用
  window.DeepGameplay = DeepGameplay;
  window.player = player;

  updateHUD();

  // 绑定时钟控制按钮
  bindClockControls();

  // 绑定口罩切换
  bindMaskToggle();

  // 启动游戏循环
  requestAnimationFrame(gameLoop);
}

/**
 * 调整画布大小
 */
function resizeCanvas() {
  const parent = canvas.parentElement;
  const w = Math.max(canvas.clientWidth || 0, parent?.clientWidth || 0, window.innerWidth || 0, 800);
  const h = Math.max(canvas.clientHeight || 0, parent?.clientHeight || 0, Math.floor(window.innerHeight * 0.7), 480);
  canvas.width = w;
  canvas.height = h;
}

/**
 * 绑定时钟控制
 */
function bindClockControls() {
  const btnPause = document.getElementById('btnPauseTime');
  const btnSpeed1 = document.getElementById('btnSpeed1');
  const btnSpeed2 = document.getElementById('btnSpeed2');

  if (btnPause) {
    btnPause.onclick = () => {
      gameState.timeSpeed = 0;
      updateClockButtons();
    };
  }

  if (btnSpeed1) {
    btnSpeed1.onclick = () => {
      gameState.timeSpeed = 1;
      updateClockButtons();
    };
  }

  if (btnSpeed2) {
    btnSpeed2.onclick = () => {
      gameState.timeSpeed = 3;
      updateClockButtons();
    };
  }
}

/**
 * 绑定口罩切换
 */
function bindMaskToggle() {
  const btnToggleMask = document.getElementById('btnToggleMask');
  if (btnToggleMask) {
    btnToggleMask.onclick = () => {
      gameState.hasMaskOn = !gameState.hasMaskOn;
      audio.playTone(400, 0.1, 'triangle', 0.1);
      const msg = gameState.hasMaskOn
        ? '已严密佩戴 N95 口罩，有效阻隔外界气溶胶。'
        : '已摘下口罩。请注意公共场所飞沫感染风险！';

      // 动态导入以避免循环依赖
      import('./ui/toast.js').then(({ showToast }) => {
        showToast(msg, 'info');
      });
      updateHUD();
    };
  }
}

/**
 * 游戏主循环
 */
function gameLoop(currentTime) {
  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // 更新逻辑
  updateTimeFlow(delta);
  updatePlayer(delta);
  updateDeepGameplay(delta);
  updateCamera(canvas);
  updateParticles(delta);
  updateScreenShake(delta);

  // 获取屏幕震动偏移
  const shake = getShakeOffset();

  // 渲染
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(shake.x, shake.y);

  renderFarSky(ctx, canvas);
  renderMidgroundWorld(ctx, canvas);
  renderRainForeground(ctx, canvas);

  ctx.restore();

  // 渲染漂浮文字（屏幕空间，不受震动影响）
  renderFloatingTexts(ctx, delta, cameraX);

  // 后处理效果（屏幕空间）
  renderPostProcessing(ctx, canvas);

  requestAnimationFrame(gameLoop);
}

/**
 * 启动游戏（在页面加载后调用）
 */
function boot() {
  initGame();
  requestAnimationFrame(() => resizeCanvas());
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
