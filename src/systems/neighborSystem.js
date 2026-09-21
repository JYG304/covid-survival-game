/**
 * 邻居互动系统
 * 模拟租房环境下的邻里关系与突发事件
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 邻居配置
const NEIGHBOR_CONFIG = {
  neighbors: [
    {
      id: 'elderly_wang',
      name: '王大爷',
      relationship: 50, // 0-100
      traits: ['独居老人', '慢性病患者'],
      avatar: '👴'
    },
    {
      id: 'young_couple',
      name: '小两口',
      relationship: 50,
      traits: ['新婚夫妇', '都是打工人'],
      avatar: '👫'
    },
    {
      id: 'single_mom',
      name: '李姐',
      relationship: 50,
      traits: ['单亲妈妈', '外卖骑手'],
      avatar: '👩'
    },
    {
      id: 'student',
      name: '小张',
      relationship: 50,
      traits: ['大学生', '兼职外包'],
      avatar: '🧑‍🎓'
    }
  ],

  events: [
    {
      id: 'help_groceries',
      title: '求助：帮忙拿快递',
      description: '王大爷腿脚不便，请你帮忙从一楼取快递送到他门口。',
      requirements: { energy: 10 },
      choices: [
        {
          label: '立即帮忙',
          cost: { energy: 10, time: 15 },
          reward: { reputation: 3, relationship: 15 },
          message: '王大爷很感激，塞给你一袋自家腌的咸菜。'
        },
        {
          label: '婉拒',
          cost: {},
          reward: { relationship: -5 },
          message: '王大爷失望地关上了门。'
        }
      ]
    },
    {
      id: 'borrow_food',
      title: '求助：借点吃的',
      description: '小两口被封在家里，食物耗尽了，希望能借 2 份速食应急。',
      requirements: { instantFood: 2 },
      choices: [
        {
          label: '借给他们',
          cost: { instantFood: 2 },
          reward: { reputation: 5, relationship: 20 },
          message: '他们承诺解封后会还你双倍。邻里互助让你心情好了些。',
          extraEffect: { sanity: 10 }
        },
        {
          label: '自己也不够',
          cost: {},
          reward: { relationship: -8 },
          message: '你解释了自己的困境，他们理解但很失落。'
        }
      ]
    },
    {
      id: 'noise_complaint',
      title: '冲突：噪音投诉',
      description: '楼下邻居抱怨你深夜走动太吵，影响他们休息。',
      requirements: {},
      choices: [
        {
          label: '诚恳道歉',
          cost: { money: 20 },
          reward: { relationship: 5 },
          message: '你买了水果送去道歉，邻里关系缓和。'
        },
        {
          label: '据理力争',
          cost: {},
          reward: { relationship: -15, sanity: -5 },
          message: '争吵让双方都很不愉快，关系恶化。'
        },
        {
          label: '忽视不理',
          cost: {},
          reward: { relationship: -10 },
          message: '你选择沉默，但心里很不舒服。'
        }
      ]
    },
    {
      id: 'share_medicine',
      title: '求助：求药救急',
      description: '李姐发烧了，但手里没有退烧药，希望你能匀一颗。',
      requirements: { pills: 1 },
      choices: [
        {
          label: '给她药',
          cost: { pills: 1 },
          reward: { reputation: 8, relationship: 25 },
          message: '李姐非常感激，说以后有什么困难尽管开口。',
          extraEffect: { sanity: 15 }
        },
        {
          label: '自己也要用',
          cost: {},
          reward: { relationship: -12, sanity: -8 },
          message: '你拒绝了，但内心很煎熬。'
        }
      ]
    },
    {
      id: 'suspect_infected',
      title: '危机：怀疑邻居感染',
      description: '小张这几天一直咳嗽，还在楼道里走来走去不戴口罩。',
      requirements: {},
      choices: [
        {
          label: '匿名举报',
          cost: {},
          reward: { relationship: -30, sanity: -10 },
          message: '小张被带走隔离，其他邻居冷眼看你。你心里很不是滋味。',
          extraEffect: { viralLoad: -10 }
        },
        {
          label: '私下提醒',
          cost: {},
          reward: { relationship: 10, infectionRisk: 0.05 },
          message: '小张很感激你没举报他，他承诺会注意防护。但你也暴露在风险中。'
        },
        {
          label: '躲避不管',
          cost: {},
          reward: { sanity: -5, infectionRisk: 0.02 },
          message: '你选择待在房间里不出门，但心里很忐忑。'
        }
      ]
    },
    {
      id: 'group_buy_invite',
      title: '邀请：团购拼单',
      description: '邻居们发起团购，邀请你一起拼单买菜，可以便宜不少。',
      requirements: { money: 50 },
      choices: [
        {
          label: '参与团购',
          cost: { money: 50 },
          reward: { rawFood: 6, relationship: 10, reputation: 2 },
          message: '团购成功！你拿到了 6 份生鲜，邻里关系更融洽了。'
        },
        {
          label: '钱不够',
          cost: {},
          reward: { relationship: -3 },
          message: '你委婉拒绝了，邻居们表示理解。'
        }
      ]
    }
  ]
};

// 初始化邻居关系
if (!gameState.neighbors) {
  gameState.neighbors = {};
  NEIGHBOR_CONFIG.neighbors.forEach(n => {
    gameState.neighbors[n.id] = {
      ...n,
      relationship: 50,
      lastInteractionDay: 0
    };
  });
}

/**
 * 触发随机邻居事件
 */
export function triggerNeighborEvent() {
  // 筛选可用事件（满足需求）
  const availableEvents = NEIGHBOR_CONFIG.events.filter(event => {
    return checkEventRequirements(event.requirements);
  });

  if (availableEvents.length === 0) {
    showToast('暂时没有邻居事件发生。', 'info');
    return false;
  }

  // 随机选择事件
  const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  showNeighborEventModal(event);
  return true;
}

/**
 * 检查事件需求是否满足
 */
function checkEventRequirements(requirements) {
  if (!requirements) return true;

  for (const [key, value] of Object.entries(requirements)) {
    if (gameState[key] < value) {
      return false;
    }
  }
  return true;
}

/**
 * 显示邻居事件模态框
 */
function showNeighborEventModal(event) {
  const modal = document.getElementById('modalNeighborEvent');
  if (!modal) {
    // 降级：直接显示toast
    showToast(`邻居事件：${event.title}`, 'info');
    return;
  }

  // 填充内容
  const titleEl = document.getElementById('neighborEventTitle');
  const descEl = document.getElementById('neighborEventDesc');
  const choicesEl = document.getElementById('neighborEventChoices');

  if (titleEl) titleEl.textContent = event.title;
  if (descEl) descEl.textContent = event.description;

  if (choicesEl) {
    choicesEl.innerHTML = '';
    event.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white px-4 py-3 rounded-lg text-left transition-all';

      // 检查是否能选择
      const canAfford = checkEventRequirements(choice.cost);
      if (!canAfford) {
        btn.className += ' opacity-50 cursor-not-allowed';
        btn.disabled = true;
      }

      // 构建选项文本
      let costText = '';
      if (choice.cost && Object.keys(choice.cost).length > 0) {
        const costs = Object.entries(choice.cost).map(([key, val]) => {
          const labels = {
            energy: `精力-${val}`,
            time: `耗时${val}分钟`,
            money: `¥${val}`,
            instantFood: `速食-${val}`,
            pills: `退烧药-${val}`
          };
          return labels[key] || `${key}-${val}`;
        });
        costText = ` (${costs.join(', ')})`;
      }

      btn.innerHTML = `
        <div class="font-bold text-sm mb-1">${choice.label}${costText}</div>
        <div class="text-xs text-zinc-400">${choice.message}</div>
      `;

      btn.onclick = () => handleNeighborChoice(event, choice);
      choicesEl.appendChild(btn);
    });
  }

  modal.classList.remove('hidden');
  audio.playTone(440, 0.1, 'square', 0.15);
}

/**
 * 处理邻居选择
 */
function handleNeighborChoice(event, choice) {
  // 扣除成本
  if (choice.cost) {
    for (const [key, value] of Object.entries(choice.cost)) {
      if (key === 'time') {
        advanceTime(value);
      } else {
        gameState[key] = Math.max(0, gameState[key] - value);
      }
    }
  }

  // 应用奖励
  if (choice.reward) {
    for (const [key, value] of Object.entries(choice.reward)) {
      if (key === 'relationship') {
        // 更新邻居关系
        updateAllNeighborRelationship(value);
      } else if (key === 'infectionRisk') {
        // 增加感染风险
        const risk = Math.random();
        if (risk < value) {
          gameState.viralLoad = Math.min(100, gameState.viralLoad + 10);
          showToast('⚠️ 不幸暴露在了感染风险中...', 'warning');
        }
      } else {
        gameState[key] = Math.max(0, Math.min(100, gameState[key] + value));
      }
    }
  }

  // 额外效果
  if (choice.extraEffect) {
    for (const [key, value] of Object.entries(choice.extraEffect)) {
      gameState[key] = Math.max(0, Math.min(100, gameState[key] + value));
    }
  }

  // 显示结果
  audio.playTone(600, 0.2, 'triangle', 0.2);
  showToast(choice.message, choice.reward?.sanity > 0 ? 'success' : 'info');

  // 关闭模态框
  closeNeighborEventModal();
  updateHUD();
}

/**
 * 更新所有邻居关系
 */
function updateAllNeighborRelationship(change) {
  for (const id in gameState.neighbors) {
    gameState.neighbors[id].relationship = Math.max(0, Math.min(100,
      gameState.neighbors[id].relationship + change
    ));
  }
}

/**
 * 主动敲邻居门求助
 */
export function askNeighborForHelp(helpType) {
  // 检查邻居关系
  const avgRelationship = getAverageNeighborRelationship();

  if (avgRelationship < 30) {
    showToast('邻里关系太差，没人愿意帮你...', 'error');
    return false;
  }

  const helpOptions = {
    food: {
      success: { instantFood: 1, reputation: -3 },
      message: '邻居匀给你 1 份速食救急。'
    },
    medicine: {
      success: { pills: 1, reputation: -5 },
      message: '邻居给了你 1 颗退烧药。'
    },
    money: {
      success: { money: 50, reputation: -8 },
      message: '邻居借给你 ¥50 应急。'
    }
  };

  const help = helpOptions[helpType];
  if (!help) return false;

  // 成功率基于关系
  const successRate = avgRelationship / 100;
  if (Math.random() < successRate) {
    // 成功
    for (const [key, value] of Object.entries(help.success)) {
      gameState[key] = Math.max(0, gameState[key] + value);
    }
    showToast(`✅ ${help.message}`, 'success');
    updateAllNeighborRelationship(-10); // 降低关系
  } else {
    showToast('😔 邻居们都自顾不暇，帮不了你...', 'error');
    updateAllNeighborRelationship(-5);
  }

  updateHUD();
  return true;
}

/**
 * 获取平均邻居关系
 */
function getAverageNeighborRelationship() {
  const neighbors = Object.values(gameState.neighbors);
  if (neighbors.length === 0) return 50;

  const sum = neighbors.reduce((acc, n) => acc + n.relationship, 0);
  return sum / neighbors.length;
}

/**
 * 查看邻居关系面板
 */
export function showNeighborPanel() {
  const modal = document.getElementById('modalNeighborPanel');
  if (!modal) {
    showToast('邻居系统未初始化', 'error');
    return;
  }

  const listEl = document.getElementById('neighborList');
  if (listEl) {
    listEl.innerHTML = '';

    for (const neighbor of Object.values(gameState.neighbors)) {
      const div = document.createElement('div');
      div.className = 'bg-zinc-800 p-3 rounded-lg border border-zinc-700';

      const relationColor = neighbor.relationship > 70 ? 'text-green-400' :
                           neighbor.relationship > 40 ? 'text-yellow-400' : 'text-red-400';

      div.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${neighbor.avatar}</span>
            <div>
              <div class="font-bold">${neighbor.name}</div>
              <div class="text-xs text-zinc-500">${neighbor.traits.join(' · ')}</div>
            </div>
          </div>
          <div class="${relationColor} font-bold">${Math.round(neighbor.relationship)}</div>
        </div>
        <div class="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-full"
               style="width: ${neighbor.relationship}%"></div>
        </div>
      `;

      listEl.appendChild(div);
    }
  }

  modal.classList.remove('hidden');
}

/**
 * 关闭邻居事件模态框
 */
export function closeNeighborEventModal() {
  const modal = document.getElementById('modalNeighborEvent');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * 关闭邻居面板
 */
export function closeNeighborPanel() {
  const modal = document.getElementById('modalNeighborPanel');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * 每日触发邻居事件（低概率）
 */
export function dailyNeighborCheck() {
  if (gameState.day < 2) return; // 前两天不触发

  // 30% 概率触发邻居事件
  if (Math.random() < 0.3) {
    setTimeout(() => triggerNeighborEvent(), 2000); // 延迟2秒触发
  }
}
