/**
 * 时间系统
 * 管理游戏内时间流逝与相关事件
 */

import { gameState } from '../data/gameState.js';
import { showToast } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

/**
 * 推进游戏时间
 * @param {number} minutes - 要推进的分钟数
 */
export function advanceTime(minutes) {
  gameState.minute += minutes;

  while (gameState.minute >= 60) {
    gameState.minute -= 60;
    gameState.hour += 1;
    onHourTick();
  }

  if (gameState.hour >= 24) {
    gameState.hour -= 24;
    gameState.day += 1;
    onNewDayTick();
  }

  updateHUD();
}

/**
 * 每小时触发事件
 */
function onHourTick() {
  // 自然饥饿消耗
  gameState.hunger = Math.max(0, gameState.hunger - 3);

  if (gameState.hunger === 0) {
    gameState.sanity = Math.max(0, gameState.sanity - 4);
    gameState.energy = Math.max(0, gameState.energy - 3);
  }

  // 药物冷却时间
  if (gameState.pillCooldownMinutes > 0) {
    gameState.pillCooldownMinutes = Math.max(0, gameState.pillCooldownMinutes - 60);
  }

  // 发热/病毒潜伏逻辑
  if (gameState.viralLoad > 30) {
    gameState.bodyTemp = Math.min(39.6, gameState.bodyTemp + 0.1);
    if (gameState.bodyTemp >= 38.5) {
      gameState.energy = Math.max(0, gameState.energy - 4);
    }
  }

  if (typeof window.DeepGameplay !== 'undefined' && window.DeepGameplay.onHourTick) {
    window.DeepGameplay.onHourTick();
  }
  if (typeof window.DeepGameplay !== 'undefined' && window.DeepGameplay.tickSimsHour) {
    window.DeepGameplay.tickSimsHour();
  }
}

/**
 * 每天触发事件
 */
function onNewDayTick() {
  gameState.hasWorkedToday = false;

  // 每3天扣房租
  if (gameState.day % 3 === 0) {
    if (gameState.money >= gameState.rentAmount) {
      gameState.money -= gameState.rentAmount;
      showToast(`【银行自动代扣】向房东支付了近3天的房租与水电杂费 ¥${gameState.rentAmount}。`, 'info');
    } else {
      gameState.sanity = Math.max(0, gameState.sanity - 30);
      showToast('【房东催租警告】账户余额不足扣缴房租！面临断电风险，压力剧增！', 'error');
    }
  }

  // 动态升级封控等级
  if (gameState.day === 2) {
    gameState.lockdownLevel = 2;
    audio.playWarning();
    showToast('📢 市政通告：周边社区出现确诊，街区设立红白水马，防控警戒升级！', 'error');
  } else if (gameState.day >= 4) {
    gameState.lockdownLevel = 3;
    audio.playWarning();
    showToast('⚠️ 紧急封控：实施全域静态管理，地铁停运，请非必要居家勿出！', 'error');
  }

  // 隔离倒计时
  if (gameState.isPositiveKnown && gameState.quarantineDaysLeft > 0) {
    gameState.quarantineDaysLeft -= 1;
    if (gameState.quarantineDaysLeft === 0 && gameState.bodyTemp <= 37.1) {
      gameState.isPositiveKnown = false;
      gameState.viralLoad = 0;
      showToast('🎉 解除隔离！身体指标恢复正常，健康码恢复绿码通行！', 'success');
    } else {
      showToast(`仍在居家隔离中（还剩 ${gameState.quarantineDaysLeft} 天），可通过电脑接外快度日。`, 'info');
    }
  }

  // 触发深度玩法每日事件
  if (typeof window.DeepGameplay !== 'undefined' && window.DeepGameplay.onNewDay) {
    window.DeepGameplay.onNewDay();
  }
  if (typeof window.DeepGameplay !== 'undefined' && window.DeepGameplay.onSimsNewDay) {
    window.DeepGameplay.onSimsNewDay();
  }
}

/**
 * 更新游戏内自动时间流逝
 * @param {number} delta - 帧间隔时间（秒）
 */
export function updateTimeFlow(delta) {
  if (gameState.timeSpeed > 0) {
    gameState.timeAccumulator += delta * gameState.timeSpeed;
    if (gameState.timeAccumulator >= 1.2) {
      const minPassed = Math.floor(gameState.timeAccumulator / 1.2);
      gameState.timeAccumulator %= 1.2;
      advanceTime(minPassed);
    }
  }
}

/**
 * 设置时间流速
 * @param {number} speed - 0=暂停, 1=正常, 3=快速
 */
export function setTimeSpeed(speed) {
  gameState.timeSpeed = speed;
}
