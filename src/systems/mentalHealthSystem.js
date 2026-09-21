/**
 * 心理健康系统
 * 深度模拟理智值波动、心理崩溃与自我调节
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 心理健康配置
const MENTAL_CONFIG = {
  stages: [
    {
      min: 80,
      max: 100,
      name: '心态良好',
      color: '#10b981',
      effects: { workEfficiency: 1.2, infectionResist: 1.1 },
      description: '精神状态极佳，工作效率提升，免疫力增强。'
    },
    {
      min: 50,
      max: 79,
      name: '状态正常',
      color: '#3b82f6',
      effects: { workEfficiency: 1.0, infectionResist: 1.0 },
      description: '心理状态稳定，一切正常。'
    },
    {
      min: 30,
      max: 49,
      name: '焦虑不安',
      color: '#f59e0b',
      effects: { workEfficiency: 0.8, infectionResist: 0.9 },
      description: '开始感到焦虑，工作效率下降。'
    },
    {
      min: 10,
      max: 29,
      name: '濒临崩溃',
      color: '#ef4444',
      effects: { workEfficiency: 0.5, infectionResist: 0.7 },
      description: '心理压力巨大，随时可能崩溃。'
    },
    {
      min: 0,
      max: 9,
      name: '精神崩溃',
      color: '#991b1b',
      effects: { workEfficiency: 0.2, infectionResist: 0.5 },
      description: '已经失去理智，需要紧急干预！'
    }
  ],

  // 自我调节活动
  activities: [
    {
      id: 'meditation',
      name: '冥想放松',
      icon: '🧘',
      duration: 30,
      cost: { energy: 5 },
      reward: { sanity: 15 },
      description: '闭目静坐，专注呼吸，让心灵平静下来。',
      requirements: { energy: 10 }
    },
    {
      id: 'music',
      name: '听音乐',
      icon: '🎵',
      duration: 20,
      cost: { energy: 3 },
      reward: { sanity: 10 },
      description: '戴上耳机，沉浸在音乐的世界里。',
      requirements: { energy: 5 }
    },
    {
      id: 'journal',
      name: '写日记',
      icon: '📔',
      duration: 40,
      cost: { energy: 8 },
      reward: { sanity: 20 },
      description: '用文字记录心情，梳理思绪。',
      requirements: { energy: 15 }
    },
    {
      id: 'exercise',
      name: '室内运动',
      icon: '🤸',
      duration: 60,
      cost: { energy: 20, hunger: 10 },
      reward: { sanity: 25, energy: 10 },
      description: '深蹲、俯卧撑、瑜伽...运动让内啡肽分泌。',
      requirements: { energy: 25, hunger: 20 }
    },
    {
      id: 'video_call',
      name: '视频聊天',
      icon: '📱',
      duration: 45,
      cost: { energy: 10, money: 0 },
      reward: { sanity: 30 },
      description: '和朋友、家人视频通话，倾诉心声。',
      requirements: { energy: 10 }
    },
    {
      id: 'watch_comedy',
      name: '看喜剧',
      icon: '😂',
      duration: 90,
      cost: { energy: 5 },
      reward: { sanity: 18 },
      description: '看搞笑视频、脱口秀，笑一笑十年少。',
      requirements: { energy: 10 }
    },
    {
      id: 'clean_room',
      name: '打扫房间',
      icon: '🧹',
      duration: 60,
      cost: { energy: 15 },
      reward: { sanity: 12 },
      description: '收拾房间，整理物品，让环境井井有条。',
      requirements: { energy: 20 }
    },
    {
      id: 'hot_bath',
      name: '洗热水澡',
      icon: '🛁',
      duration: 30,
      cost: { energy: 5, money: 3 },
      reward: { sanity: 15, energy: 10 },
      description: '热水冲刷身体，洗去一天的疲惫。',
      requirements: { energy: 5, money: 3 }
    }
  ],

  // 心理崩溃事件
  breakdownEvents: [
    {
      title: '失控哭泣',
      description: '你突然控制不住情绪，瘫坐在地上痛哭...',
      effect: { energy: -20, time: 30 },
      message: '哭了半小时，精疲力竭...'
    },
    {
      title: '砸东西发泄',
      description: '你暴怒地摔碎了一个杯子，但心情并没有好转...',
      effect: { energy: -10, sanity: -5, money: -10 },
      message: '发泄后更加空虚，还得花钱买新杯子...'
    },
    {
      title: '自我封闭',
      description: '你把自己关在房间里，拒绝与外界联系...',
      effect: { time: 120, sanity: -10 },
      message: '在床上躺了 2 小时，状态更糟了...'
    }
  ]
};

/**
 * 获取当前心理状态
 */
export function getCurrentMentalStage() {
  const sanity = gameState.sanity || 100;
  return MENTAL_CONFIG.stages.find(stage =>
    sanity >= stage.min && sanity <= stage.max
  ) || MENTAL_CONFIG.stages[1];
}

/**
 * 执行自我调节活动
 */
export function doMentalActivity(activityId) {
  const activity = MENTAL_CONFIG.activities.find(a => a.id === activityId);
  if (!activity) {
    showToast('活动不存在！', 'error');
    return false;
  }

  // 检查需求
  for (const [key, value] of Object.entries(activity.requirements)) {
    if (gameState[key] < value) {
      const labels = {
        energy: '精力不足',
        hunger: '太饿了',
        money: '钱不够'
      };
      showToast(labels[key] || '条件不满足', 'error');
      return false;
    }
  }

  // 扣除成本
  for (const [key, value] of Object.entries(activity.cost)) {
    gameState[key] = Math.max(0, gameState[key] - value);
  }

  // 推进时间
  advanceTime(activity.duration);

  // 应用奖励
  for (const [key, value] of Object.entries(activity.reward)) {
    gameState[key] = Math.min(100, gameState[key] + value);
  }

  // 音效与提示
  audio.playTone(600, 0.2, 'sine', 0.3);
  showToast(`${activity.icon} ${activity.description}`, 'success');
  spawnFloatingText(`理智 +${activity.reward.sanity}`, gameState.player?.x || 400, gameState.player?.y || 300, '#10b981');

  updateHUD();
  return true;
}

/**
 * 显示心理调节面板
 */
export function showMentalHealthPanel() {
  const modal = document.getElementById('modalMentalHealth');
  if (!modal) {
    showToast('心理系统未初始化', 'error');
    return;
  }

  const currentStage = getCurrentMentalStage();
  const stageEl = document.getElementById('mentalStageInfo');
  if (stageEl) {
    stageEl.innerHTML = `
      <div class="text-center mb-4">
        <div class="text-2xl font-bold mb-2" style="color: ${currentStage.color}">
          ${currentStage.name}
        </div>
        <div class="text-sm text-zinc-400">
          ${currentStage.description}
        </div>
      </div>
    `;
  }

  const activitiesEl = document.getElementById('mentalActivities');
  if (activitiesEl) {
    activitiesEl.innerHTML = '';

    MENTAL_CONFIG.activities.forEach(activity => {
      const div = document.createElement('div');
      div.className = 'bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:border-zinc-500 cursor-pointer transition-all';

      // 检查是否可用
      const canDo = Object.entries(activity.requirements).every(([key, value]) =>
        gameState[key] >= value
      );

      if (!canDo) {
        div.className += ' opacity-50 cursor-not-allowed';
      }

      // 构建成本文本
      const costTexts = Object.entries(activity.cost).map(([key, val]) => {
        const labels = {
          energy: `精力-${val}`,
          hunger: `饥饿-${val}`,
          money: `¥${val}`
        };
        return labels[key] || `${key}-${val}`;
      });

      div.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${activity.icon}</span>
            <div>
              <div class="font-bold text-sm">${activity.name}</div>
              <div class="text-xs text-zinc-500">${activity.duration}分钟 | ${costTexts.join(', ')}</div>
            </div>
          </div>
          <div class="text-green-400 font-bold">+${activity.reward.sanity}</div>
        </div>
        <div class="text-xs text-zinc-400">${activity.description}</div>
      `;

      if (canDo) {
        div.onclick = () => {
          doMentalActivity(activity.id);
          closeMentalHealthPanel();
        };
      }

      activitiesEl.appendChild(div);
    });
  }

  modal.classList.remove('hidden');
}

/**
 * 关闭心理调节面板
 */
export function closeMentalHealthPanel() {
  const modal = document.getElementById('modalMentalHealth');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * 检查心理崩溃（每小时调用）
 */
export function checkMentalBreakdown() {
  if (gameState.sanity <= 10 && Math.random() < 0.3) {
    triggerMentalBreakdown();
  }
}

/**
 * 触发心理崩溃事件
 */
function triggerMentalBreakdown() {
  const event = MENTAL_CONFIG.breakdownEvents[
    Math.floor(Math.random() * MENTAL_CONFIG.breakdownEvents.length)
  ];

  audio.playWarning();
  showToast(`😱 精神崩溃：${event.description}`, 'error');

  // 应用负面效果
  if (event.effect.energy) {
    gameState.energy = Math.max(0, gameState.energy + event.effect.energy);
  }
  if (event.effect.sanity) {
    gameState.sanity = Math.max(0, gameState.sanity + event.effect.sanity);
  }
  if (event.effect.money) {
    gameState.money = Math.max(0, gameState.money + event.effect.money);
  }
  if (event.effect.time) {
    advanceTime(event.effect.time);
  }

  setTimeout(() => {
    showToast(event.message, 'warning');
  }, 2000);

  updateHUD();
}

/**
 * 获取工作效率倍率
 */
export function getWorkEfficiencyMultiplier() {
  const stage = getCurrentMentalStage();
  return stage.effects.workEfficiency;
}

/**
 * 获取抗感染倍率
 */
export function getInfectionResistMultiplier() {
  const stage = getCurrentMentalStage();
  return stage.effects.infectionResist;
}

/**
 * 理智值自然恢复（在安全环境中）
 */
export function naturalSanityRecover(delta) {
  // 只有在家中且时间流速正常时才恢复
  if (gameState.timeSpeed === 0) return;

  // 理智低于50时，在家中缓慢恢复
  if (gameState.sanity < 50 && gameState.hunger > 30 && gameState.energy > 20) {
    gameState.sanity = Math.min(100, gameState.sanity + delta * 0.05);
  }
}
