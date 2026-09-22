/**
 * 抢菜系统 - 每日早晨秒杀 QTE
 * 模拟疫情期间生鲜平台抢购体验
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 抢菜配置
const GROCERY_RUSH_CONFIG = {
  startHour: 6,
  endHour: 9,
  baseClicksNeeded: 8,
  timeLimit: 12, // 秒
  queueSimulation: [
    '服务器拥堵中，前方还有 3588 人排队...',
    '正在连接叮咚生鲜服务器...',
    '您已进入结算通道，请快速点击！',
    '配额告急！仅剩 23 份平价菜包！'
  ],
  prizes: {
    success: {
      money: -38,
      rawFood: 5,
      instantFood: 1,
      message: '🎉 抢菜成功！以 ¥38 抢到 5 份生鲜 + 1 盒自热饭！'
    },
    fail: {
      message: '😭 手慢了！本轮平价菜包已被抢光，明早 06:00 请早！'
    }
  }
};

/**
 * 检查是否可以开始抢菜
 */
export function canStartGroceryRush() {
  const hour = gameState.hour;

  if (hour < GROCERY_RUSH_CONFIG.startHour || hour >= GROCERY_RUSH_CONFIG.endHour) {
    showToast(
      `叮咚抢菜每日限时开放：早晨 ${GROCERY_RUSH_CONFIG.startHour}:00 ~ ${GROCERY_RUSH_CONFIG.endHour}:00，请定好闹钟准时蹲点！`,
      'info'
    );
    return false;
  }

  if (gameState.groceryRush.completedToday) {
    showToast('今天已经参与过抢菜了，明天早上再来吧！', 'info');
    return false;
  }

  return true;
}

/**
 * 初始化抢菜界面
 */
export function initGroceryRushUI() {
  const modal = document.getElementById('modalGroceryRush');
  if (!modal) return;

  // 重置状态
  gameState.groceryRush = {
    active: false,
    phase: 'waiting', // waiting, clicking, result
    clicksNeeded: GROCERY_RUSH_CONFIG.baseClicksNeeded + Math.floor(Math.random() * 4),
    clicksCurrent: 0,
    secondsLeft: GROCERY_RUSH_CONFIG.timeLimit,
    timerId: null,
    queuePhase: 0,
    completedToday: false
  };

  updateGroceryRushUI();
}

/**
 * 开始抢菜流程
 */
export function startGroceryRush() {
  if (!canStartGroceryRush()) return;

  const modal = document.getElementById('modalGroceryRush');
  if (!modal) return;

  modal.classList.remove('hidden');

  // 初始化状态
  gameState.groceryRush.active = true;
  gameState.groceryRush.phase = 'waiting';
  gameState.groceryRush.queuePhase = 0;

  // 模拟排队过程
  simulateQueuePhase();
}

/**
 * 模拟排队阶段
 */
function simulateQueuePhase() {
  const queueText = document.getElementById('rushQueueText');
  const queueBar = document.getElementById('rushQueueBar');
  const timerCount = document.getElementById('rushTimerCount');
  const btnClick = document.getElementById('btnClickPayGrocery');

  if (!queueText || !queueBar || !timerCount || !btnClick) return;

  btnClick.disabled = true;
  btnClick.classList.add('opacity-50', 'cursor-not-allowed');

  let phase = 0;
  const queueInterval = setInterval(() => {
    if (phase >= GROCERY_RUSH_CONFIG.queueSimulation.length) {
      clearInterval(queueInterval);
      startClickingPhase();
      return;
    }

    queueText.innerText = GROCERY_RUSH_CONFIG.queueSimulation[phase];
    queueBar.style.width = `${((phase + 1) / GROCERY_RUSH_CONFIG.queueSimulation.length) * 100}%`;

    audio.playTone(400 + phase * 100, 0.1, 'sine', 0.08);
    phase++;
  }, 1200);
}

/**
 * 进入点击抢购阶段
 */
function startClickingPhase() {
  gameState.groceryRush.phase = 'clicking';
  gameState.groceryRush.clicksCurrent = 0;
  gameState.groceryRush.secondsLeft = GROCERY_RUSH_CONFIG.timeLimit;

  const queueText = document.getElementById('rushQueueText');
  const timerCount = document.getElementById('rushTimerCount');
  const btnClick = document.getElementById('btnClickPayGrocery');

  if (!btnClick) return;

  btnClick.disabled = false;
  btnClick.classList.remove('opacity-50', 'cursor-not-allowed');
  btnClick.classList.add('animate-pulse');

  audio.playWarning();
  showToast('⚡ 抢购通道已开启！疯狂点击结算按钮！', 'success');

  updateGroceryRushUI();

  // 倒计时
  gameState.groceryRush.timerId = setInterval(() => {
    gameState.groceryRush.secondsLeft--;

    if (timerCount) {
      timerCount.innerText = `倒计时: ${gameState.groceryRush.secondsLeft} 秒`;
    }

    if (gameState.groceryRush.secondsLeft <= 0) {
      endGroceryRush(false);
    }

    // 增加紧迫感
    if (gameState.groceryRush.secondsLeft <= 3) {
      audio.playTone(800, 0.1, 'square', 0.1);
    }
  }, 1000);
}

/**
 * 处理点击事件
 */
export function handleGroceryClick() {
  if (gameState.groceryRush.phase !== 'clicking') return;

  gameState.groceryRush.clicksCurrent++;

  audio.playClick();

  // 添加视觉反馈
  const btn = document.getElementById('btnClickPayGrocery');
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 100);
  }

  updateGroceryRushUI();

  // 检查是否完成
  if (gameState.groceryRush.clicksCurrent >= gameState.groceryRush.clicksNeeded) {
    endGroceryRush(true);
  }
}

/**
 * 结束抢菜
 */
function endGroceryRush(success) {
  if (gameState.groceryRush.timerId) {
    clearInterval(gameState.groceryRush.timerId);
    gameState.groceryRush.timerId = null;
  }

  gameState.groceryRush.phase = 'result';
  gameState.groceryRush.completedToday = true;

  const modal = document.getElementById('modalGroceryRush');

  if (success) {
    const prize = GROCERY_RUSH_CONFIG.prizes.success;

    if (gameState.money >= Math.abs(prize.money)) {
      gameState.money += prize.money;
      gameState.rawFood += prize.rawFood;
      gameState.instantFood += prize.instantFood;
      import('./homeSystem.js').then((m) => {
        for (let i = 0; i < (prize.rawFood || 0); i++) m.addFridgeItem('raw', '抢菜生鲜', 28);
        for (let i = 0; i < (prize.instantFood || 0); i++) m.addFridgeItem('instant', '抢菜便当', 72);
      });

      audio.playCash();
      showToast(prize.message, 'success');

      // 浮动文字提示
      if (window.player) {
        spawnFloatingText(`+${prize.rawFood} 生鲜 +${prize.instantFood} 便当`, window.player.x, window.player.y - 70, '#34d399');
      }
    } else {
      showToast('抢到了但余额不足支付！订单已取消！', 'error');
      audio.playWarning();
    }
  } else {
    showToast(GROCERY_RUSH_CONFIG.prizes.fail.message, 'error');
    audio.playWarning();
  }

  updateHUD();

  // 2秒后关闭模态框
  setTimeout(() => {
    if (modal) modal.classList.add('hidden');
  }, 2000);

  advanceTime(15);
}

/**
 * 更新UI显示
 */
function updateGroceryRushUI() {
  const queueText = document.getElementById('rushQueueText');
  const queueBar = document.getElementById('rushQueueBar');
  const timerCount = document.getElementById('rushTimerCount');

  if (!queueText || !queueBar || !timerCount) return;

  if (gameState.groceryRush.phase === 'clicking') {
    const progress = (gameState.groceryRush.clicksCurrent / gameState.groceryRush.clicksNeeded) * 100;

    queueText.innerText = `正在疯狂点击结算：(${gameState.groceryRush.clicksCurrent}/${gameState.groceryRush.clicksNeeded})`;
    queueBar.style.width = `${progress}%`;
    timerCount.innerText = `倒计时: ${gameState.groceryRush.secondsLeft} 秒`;

    // 进度条颜色变化
    if (progress >= 80) {
      queueBar.className = 'bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all duration-300 rounded-full';
    } else if (progress >= 50) {
      queueBar.className = 'bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300 rounded-full';
    } else {
      queueBar.className = 'bg-gradient-to-r from-red-500 to-rose-400 h-full transition-all duration-300 rounded-full';
    }
  }
}

/**
 * 每日重置
 */
export function resetDailyGroceryRush() {
  if (gameState.groceryRush) {
    gameState.groceryRush.completedToday = false;
  }
}

/**
 * 关闭模态框
 */
export function closeGroceryRush() {
  const modal = document.getElementById('modalGroceryRush');
  if (!modal) return;

  if (gameState.groceryRush.timerId) {
    clearInterval(gameState.groceryRush.timerId);
    gameState.groceryRush.timerId = null;
  }

  modal.classList.add('hidden');
}
