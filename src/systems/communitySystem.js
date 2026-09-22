/**
 * 社区团购与互助系统
 * 模拟疫情期间的社区自救与邻里互助
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 团购配置
const GROUP_BUY_CONFIG = {
  minDeposit: 200,
  minParticipants: 10,
  organizingTime: 60, // 组织需要1小时
  reputationReward: 20,
  reputationPenalty: -15,

  packages: [
    {
      id: 'veggies',
      name: '社区蔬菜肉蛋大礼包',
      deposit: 200,
      participants: 10,
      rewards: {
        rawFood: 8,
        instantFood: 2,
        reputation: 20
      },
      description: '需垫资 ¥200，成团后全额返还并获得 8 份生鲜 + 2 盒便当'
    },
    {
      id: 'medical',
      name: '防疫物资团购（N95+抗原+消毒）',
      deposit: 150,
      participants: 8,
      rewards: {
        antigenKits: 3,
        pillsCount: 1,
        reputation: 15
      },
      description: '需垫资 ¥150，成团后获得 3 盒抗原 + 1 盒退烧药'
    },
    {
      id: 'premium',
      name: '高端进口水果与零食礼盒',
      deposit: 300,
      participants: 12,
      rewards: {
        money: 300, // 返还
        rawFood: 5,
        sanity: 30, // 奢侈品带来心理安慰
        reputation: 25
      },
      description: '需垫资 ¥300，成团后获得精品食材与心理慰藉'
    }
  ]
};

// 互助交易配置
const BARTER_TRADES = [
  {
    id: 'pills_for_food',
    name: '602室王阿姨求药',
    give: { pillsCount: 1 },
    receive: { rawFood: 4 },
    reputation: 15,
    message: '王阿姨的孙子发烧，你用 1 盒布洛芬换到了 4 份新鲜蔬菜'
  },
  {
    id: 'food_for_kit',
    name: '1204室程序员小张换抗原',
    give: { instantFood: 1 },
    receive: { antigenKits: 1 },
    reputation: 5,
    message: '小张多囤了抗原，你用 1 盒便当换到了 1 盒试剂'
  },
  {
    id: 'money_for_emergency',
    name: '楼下小超市老板求助',
    give: { money: 100 },
    receive: { reputation: 30 },
    reputation: 30,
    message: '老板资金链断裂，你的 ¥100 帮了大忙，获得巨额声望'
  },
  {
    id: 'volunteer_delivery',
    name: '志愿帮老人送物资',
    give: { energy: 20 },
    receive: { reputation: 25 },
    reputation: 25,
    message: '帮 5 楼独居老人送菜上门，消耗体力但获得邻里好感'
  }
];

/**
 * 发起社区团购
 */
export function startGroupBuy(packageId) {
  const pkg = GROUP_BUY_CONFIG.packages.find(p => p.id === packageId);
  if (!pkg) return false;

  // 检查资金
  if (gameState.money < pkg.deposit) {
    showToast(`垫资资金不足 ¥${pkg.deposit}！无法作为团长发起团购。`, 'error');
    return false;
  }

  // 检查是否已有进行中的团购
  if (gameState.activeGroupBuy) {
    showToast('已有一个团购正在进行中，请等待成团或失败后再发起新的。', 'info');
    return false;
  }

  // 扣除垫资
  gameState.money -= pkg.deposit;

  // 初始化团购状态
  gameState.activeGroupBuy = {
    packageId: pkg.id,
    packageName: pkg.name,
    deposit: pkg.deposit,
    targetParticipants: pkg.participants,
    currentParticipants: 1, // 团长自己
    startTime: { day: gameState.day, hour: gameState.hour },
    success: false
  };

  audio.playTone(600, 0.2, 'triangle', 0.1);
  showToast(`📦 已发起团购：${pkg.name}，正在招募邻居参团...`, 'info');

  advanceTime(5);

  // 开始模拟参团过程
  simulateGroupBuyProgress();

  return true;
}

/**
 * 模拟团购进度
 */
function simulateGroupBuyProgress() {
  if (!gameState.activeGroupBuy) return;

  const pkg = GROUP_BUY_CONFIG.packages.find(p => p.id === gameState.activeGroupBuy.packageId);
  if (!pkg) return;

  // 模拟参团速度（受声望影响）
  const baseChance = 0.6;
  const reputationBonus = Math.min(0.3, gameState.reputation / 100);
  const successChance = baseChance + reputationBonus;

  // 延迟模拟团购成功/失败
  setTimeout(() => {
    if (Math.random() < successChance) {
      completeGroupBuy(true);
    } else {
      completeGroupBuy(false);
    }
  }, 3000);
}

/**
 * 完成团购
 */
function completeGroupBuy(success) {
  if (!gameState.activeGroupBuy) return;

  const pkg = GROUP_BUY_CONFIG.packages.find(p => p.id === gameState.activeGroupBuy.packageId);
  if (!pkg) return;

  advanceTime(GROUP_BUY_CONFIG.organizingTime);

  if (success) {
    // 成团成功
    gameState.money += gameState.activeGroupBuy.deposit; // 返还垫资

    // 发放奖励
    if (pkg.rewards.rawFood) {
      gameState.rawFood += pkg.rewards.rawFood;
      import('./homeSystem.js').then((m) => {
        for (let i = 0; i < pkg.rewards.rawFood; i++) m.addFridgeItem('raw', '团购青菜', 30);
      });
    }
    if (pkg.rewards.instantFood) {
      gameState.instantFood += pkg.rewards.instantFood;
      import('./homeSystem.js').then((m) => {
        for (let i = 0; i < pkg.rewards.instantFood; i++) m.addFridgeItem('instant', '团购便当', 80);
      });
    }
    if (pkg.rewards.antigenKits) gameState.antigenKits += pkg.rewards.antigenKits;
    if (pkg.rewards.pillsCount) gameState.pillsCount += pkg.rewards.pillsCount;
    if (pkg.rewards.sanity) gameState.sanity = Math.min(100, gameState.sanity + pkg.rewards.sanity);
    if (pkg.rewards.reputation) gameState.reputation += pkg.rewards.reputation;

    audio.playCash();
    showToast(`🎉 团购成功！${pkg.name}已送达，垫资退回，物资到手，声望暴涨！`, 'success');

    if (window.player) {
      spawnFloatingText(`+${pkg.rewards.reputation} 声望`, window.player.x, window.player.y - 70, '#22d3ee');
    }
  } else {
    // 成团失败
    gameState.money += gameState.activeGroupBuy.deposit; // 退回垫资
    gameState.reputation += GROUP_BUY_CONFIG.reputationPenalty;

    audio.playWarning();
    showToast(`😔 团购流拍，人数不足。垫资已退回，但声望下降 ${Math.abs(GROUP_BUY_CONFIG.reputationPenalty)} 点。`, 'error');
  }

  gameState.activeGroupBuy = null;
  updateHUD();
}

/**
 * 取消团购
 */
export function cancelGroupBuy() {
  if (!gameState.activeGroupBuy) return;

  // 退回垫资但损失声望
  gameState.money += gameState.activeGroupBuy.deposit;
  gameState.reputation = Math.max(0, gameState.reputation - 10);

  showToast('❌ 取消团购，垫资已退回，但声望 -10', 'info');

  gameState.activeGroupBuy = null;
  updateHUD();
}

/**
 * 执行以物易物交易
 */
export function executeBarter(tradeId) {
  const trade = BARTER_TRADES.find(t => t.id === tradeId);
  if (!trade) return false;

  // 检查是否有足够的物品
  for (const [key, value] of Object.entries(trade.give)) {
    if (gameState[key] < value) {
      const itemName = getItemName(key);
      showToast(`你没有足够的${itemName}进行交换！`, 'error');
      return false;
    }
  }

  // 扣除给出的物品
  for (const [key, value] of Object.entries(trade.give)) {
    gameState[key] -= value;
  }

  // 获得交换物品
  for (const [key, value] of Object.entries(trade.receive)) {
    if (key === 'reputation') {
      gameState.reputation += value;
    } else {
      gameState[key] += value;
    }
  }

  // 增加额外声望
  if (trade.reputation) {
    gameState.reputation += trade.reputation;
  }

  audio.playCash();
  showToast(`🤝 ${trade.message}`, 'success');

  if (window.player && trade.reputation) {
    spawnFloatingText(`+${trade.reputation} 声望`, window.player.x, window.player.y - 70, '#22d3ee');
  }

  advanceTime(10);
  updateHUD();

  return true;
}

/**
 * 志愿者送物资（消耗体力换声望）
 */
export function volunteerDelivery() {
  if (gameState.energy < 30) {
    showToast('体力不足，无法承担志愿者送货任务。', 'error');
    return false;
  }

  gameState.energy -= 20;
  gameState.reputation += 25;
  gameState.sanity = Math.min(100, gameState.sanity + 10);

  audio.playSip();
  showToast('❤️ 你帮独居老人送菜上门，虽然累但心里很温暖。声望 +25', 'success');

  if (window.player) {
    spawnFloatingText('+25 声望', window.player.x, window.player.y - 70, '#22d3ee');
  }

  advanceTime(45);
  updateHUD();

  return true;
}

/**
 * 声望奖励系统 - 高声望解锁特权
 */
export function getReputationBenefits() {
  const rep = gameState.reputation;

  const benefits = {
    carePackageChance: 0.3, // 基础30%
    barterDiscount: 0,
    prioritySupply: false,
    communityProtection: false
  };

  if (rep >= 20) {
    benefits.carePackageChance = 0.5;
  }

  if (rep >= 40) {
    benefits.carePackageChance = 0.7;
    benefits.barterDiscount = 0.1; // 交易优惠10%
  }

  if (rep >= 60) {
    benefits.carePackageChance = 0.85;
    benefits.barterDiscount = 0.2;
    benefits.prioritySupply = true; // 优先获得爱心物资
  }

  if (rep >= 80) {
    benefits.carePackageChance = 0.95;
    benefits.barterDiscount = 0.3;
    benefits.communityProtection = true; // 邻居会主动帮助
  }

  return benefits;
}

/**
 * 获取物品名称
 */
function getItemName(key) {
  const names = {
    money: '金钱',
    rawFood: '生鲜食材',
    instantFood: '自热便当',
    pillsCount: '退烧药',
    antigenKits: '抗原试剂',
    energy: '体力'
  };
  return names[key] || key;
}

/**
 * 检查无接触货架（声望影响）
 */
export function checkContactlessRack() {
  const benefits = getReputationBenefits();

  if (Math.random() < benefits.carePackageChance) {
    const amount = benefits.prioritySupply ? 3 : 2;
    gameState.rawFood += amount;
    import('./homeSystem.js').then((m) => {
      for (let i = 0; i < amount; i++) m.addFridgeItem('raw', '爱心蔬菜', 24);
    });

    audio.playCash();
    showToast(`📦 在无接触货架领到了 ${amount} 份爱心蔬菜包！${benefits.prioritySupply ? '（高声望优先配给）' : ''}`, 'success');

    if (window.player) {
      spawnFloatingText(`+${amount} 生鲜`, window.player.x, window.player.y - 70, '#34d399');
    }

    return true;
  } else {
    showToast('货架空空如也，暂无新的物资配给。', 'info');
    return false;
  }
}

/**
 * 社区互助网络 - 紧急求助
 */
export function emergencyHelp(type) {
  const rep = gameState.reputation;

  if (rep < 30) {
    showToast('声望不足，邻居们不愿意帮助你...', 'error');
    return false;
  }

  switch (type) {
    case 'food':
      if (rep >= 30) {
        gameState.rawFood += 2;
        import('./homeSystem.js').then((m) => {
          m.addFridgeItem('raw', '邻居鸡蛋', 30);
          m.addFridgeItem('raw', '邻居青菜', 24);
        });
        gameState.reputation -= 10;
        showToast('🤝 邻居送来了 2 份应急食材，声望 -10', 'success');
        return true;
      }
      break;

    case 'medicine':
      if (rep >= 50) {
        gameState.pillsCount += 1;
        gameState.reputation -= 20;
        showToast('🤝 邻居借给你 1 盒退烧药，声望 -20', 'success');
        return true;
      } else {
        showToast('声望不足 50，无人愿意借药...', 'error');
      }
      break;

    case 'money':
      if (rep >= 70) {
        gameState.money += 100;
        gameState.reputation -= 30;
        showToast('🤝 邻居借给你 ¥100 应急，声望 -30', 'success');
        return true;
      } else {
        showToast('声望不足 70，无人愿意借钱...', 'error');
      }
      break;
  }

  updateHUD();
  return false;
}

/**
 * 获取当前可用的物物交换列表
 */
export function getAvailableBarterTrades() {
  return BARTER_TRADES.filter(trade => {
    // 检查是否有足够的物品
    for (const [key, value] of Object.entries(trade.give)) {
      if (gameState[key] < value) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 获取团购进度信息
 */
export function getGroupBuyStatus() {
  if (!gameState.activeGroupBuy) return null;

  const pkg = GROUP_BUY_CONFIG.packages.find(p => p.id === gameState.activeGroupBuy.packageId);

  return {
    name: gameState.activeGroupBuy.packageName,
    current: gameState.activeGroupBuy.currentParticipants,
    target: gameState.activeGroupBuy.targetParticipants,
    deposit: gameState.activeGroupBuy.deposit,
    progress: (gameState.activeGroupBuy.currentParticipants / gameState.activeGroupBuy.targetParticipants) * 100,
    rewards: pkg ? pkg.rewards : {}
  };
}
