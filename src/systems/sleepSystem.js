/**
 * 睡眠与梦境系统
 * 模拟睡眠恢复与噩梦事件
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 睡眠配置
const SLEEP_CONFIG = {
  minSleepHours: 4,
  maxSleepHours: 12,
  optimalSleepHours: 8,
  energyRecoveryPerHour: 12,
  hungerCostPerHour: 5,
  nightmareThreshold: 40, // 理智低于此值触发噩梦
  nightmares: [
    {
      title: '追赶噩梦',
      description: '梦到自己在空荡的街道上狂奔，身后传来救护车的警笛声...',
      effect: { sanity: -8, energy: -15 }
    },
    {
      title: '窒息梦境',
      description: '梦到自己戴着N95口罩无法呼吸，拼命挣扎却醒不过来...',
      effect: { sanity: -12, energy: -10 }
    },
    {
      title: '隔离噩梦',
      description: '梦到被大白带走隔离，房门被焊死，手机失联...',
      effect: { sanity: -15, energy: -5 }
    },
    {
      title: '失业焦虑',
      description: '梦到公司倒闭，房租交不起，流落街头...',
      effect: { sanity: -10, energy: -8 }
    }
  ]
};

/**
 * 开始睡眠
 * @param {number} hours - 睡眠小时数
 */
export function startSleep(hours) {
  // 验证睡眠时长
  if (hours < SLEEP_CONFIG.minSleepHours) {
    showToast(`睡眠时间太短！至少需要 ${SLEEP_CONFIG.minSleepHours} 小时。`, 'error');
    return false;
  }

  if (hours > SLEEP_CONFIG.maxSleepHours) {
    showToast(`一次睡太久反而会更累！最多 ${SLEEP_CONFIG.maxSleepHours} 小时。`, 'error');
    return false;
  }

  // 检查是否太精神
  if (gameState.energy > 80) {
    showToast('现在精力充沛，完全睡不着！', 'info');
    return false;
  }

  // 检查是否在工作时间
  if (gameState.hour >= 9 && gameState.hour < 18 && !gameState.hasWorkedToday) {
    showToast('现在是工作时间，睡觉会错过打工机会！', 'warning');
  }

  // 执行睡眠
  audio.playTone(200, 0.2, 'sine', 0.3);

  // 推进时间
  advanceTime(hours * 60);

  // 基础恢复
  const energyRecover = hours * SLEEP_CONFIG.energyRecoveryPerHour;
  const hungerCost = hours * SLEEP_CONFIG.hungerCostPerHour;

  gameState.energy = Math.min(100, gameState.energy + energyRecover);
  gameState.hunger = Math.max(0, gameState.hunger - hungerCost);

  // 最佳睡眠时长额外奖励
  if (hours >= 7 && hours <= 9) {
    gameState.sanity = Math.min(100, gameState.sanity + 10);
    showToast(`💤 睡了 ${hours} 小时，精力完全恢复！充足睡眠让心情也好了起来。`, 'success');
  } else if (hours < 6) {
    gameState.sanity = Math.max(0, gameState.sanity - 5);
    showToast(`😴 只睡了 ${hours} 小时，虽然恢复了些体力，但还是很疲惫...`, 'warning');
  } else if (hours > 10) {
    gameState.sanity = Math.max(0, gameState.sanity - 3);
    showToast(`😵 睡了 ${hours} 小时，头昏脑涨，反而更累了...`, 'warning');
  } else {
    showToast(`💤 睡了 ${hours} 小时，精力恢复。`, 'success');
  }

  // 噩梦事件判定
  if (gameState.sanity < SLEEP_CONFIG.nightmareThreshold && Math.random() < 0.4) {
    triggerNightmare();
  }

  // 发热期间睡眠加速恢复
  if (gameState.bodyTemp > 37.5) {
    const tempReduction = hours * 0.1;
    gameState.bodyTemp = Math.max(36.5, gameState.bodyTemp - tempReduction);
    showToast('🌡️ 充足休息帮助身体对抗病毒，体温略有下降。', 'info');
  }

  updateHUD();
  return true;
}

/**
 * 触发噩梦事件
 */
function triggerNightmare() {
  const nightmare = SLEEP_CONFIG.nightmares[Math.floor(Math.random() * SLEEP_CONFIG.nightmares.length)];

  audio.playWarning();

  // 应用负面效果
  gameState.sanity = Math.max(0, gameState.sanity + nightmare.effect.sanity);
  gameState.energy = Math.max(0, gameState.energy + nightmare.effect.energy);

  // 显示噩梦内容
  showToast(`😱 噩梦惊醒：${nightmare.description}`, 'error');

  // 弹出详细模态框（如果存在）
  const modal = document.getElementById('modalNightmare');
  if (modal) {
    const titleEl = document.getElementById('nightmareTitle');
    const descEl = document.getElementById('nightmareDesc');
    const effectEl = document.getElementById('nightmareEffect');

    if (titleEl) titleEl.textContent = nightmare.title;
    if (descEl) descEl.textContent = nightmare.description;
    if (effectEl) {
      effectEl.innerHTML = `
        <p class="text-red-400">理智 ${nightmare.effect.sanity} | 精力 ${nightmare.effect.energy}</p>
      `;
    }

    modal.classList.remove('hidden');
  }

  updateHUD();
}

/**
 * 快速小憩（2小时）
 */
export function quickNap() {
  if (gameState.energy > 70) {
    showToast('现在不累，睡不着！', 'info');
    return false;
  }

  audio.playTone(300, 0.15, 'sine', 0.2);
  advanceTime(120); // 2 hours

  gameState.energy = Math.min(100, gameState.energy + 25);
  gameState.hunger = Math.max(0, gameState.hunger - 8);

  showToast('😌 小憩了 2 小时，稍微恢复了些精力。', 'success');
  updateHUD();
  return true;
}

/**
 * 关闭噩梦模态框
 */
export function closeNightmareModal() {
  const modal = document.getElementById('modalNightmare');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * 获取建议睡眠时长
 */
export function getRecommendedSleepHours() {
  const currentEnergy = gameState.energy;
  const currentHour = gameState.hour;

  if (currentEnergy > 80) return 0; // 不需要睡眠
  if (currentEnergy > 60) return 4; // 小憩
  if (currentEnergy > 30) return 6; // 正常睡眠
  return 8; // 深度睡眠
}

/**
 * 检查是否应该睡觉（给AI建议使用）
 */
export function shouldSleep() {
  return gameState.energy < 30 ||
         (gameState.hour >= 23 || gameState.hour < 6) && gameState.energy < 50;
}
