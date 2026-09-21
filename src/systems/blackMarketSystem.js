/**
 * 黑市交易系统
 * 封城期间的地下经济与风险交易
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 黑市配置
const BLACK_MARKET_CONFIG = {
  // 黑市开放时间：深夜 22:00 - 凌晨 04:00
  openHour: 22,
  closeHour: 4,

  // 黑市商品
  goods: [
    {
      id: 'food_bundle',
      name: '生鲜大礼包',
      icon: '🥬',
      description: '来路不明的蔬菜肉类，但确实新鲜',
      price: 80,
      priceRange: [60, 100],
      stock: 3,
      reward: { rawFood: 8 },
      risk: 0.05, // 5%被举报风险
      riskPenalty: { money: -200, sanity: -30, reputation: -20 }
    },
    {
      id: 'medicine_black',
      name: '退烧药（散装）',
      icon: '💊',
      description: '药店买不到的紧俏货，真假难辨',
      price: 60,
      priceRange: [40, 80],
      stock: 5,
      reward: { pills: 3 },
      risk: 0.1, // 10%假药风险
      riskPenalty: { money: -60, sanity: -15, bodyTemp: 0.5 }
    },
    {
      id: 'test_kit_premium',
      name: '抗原试剂盒（5盒）',
      icon: '🧪',
      description: '从医院内部流出的正规试剂',
      price: 150,
      priceRange: [120, 180],
      stock: 2,
      reward: { testKits: 5 },
      risk: 0.03,
      riskPenalty: { money: -200, reputation: -15 }
    },
    {
      id: 'fake_green_code',
      name: '假健康码',
      icon: '📱',
      description: '技术手段伪造的绿码，极度危险',
      price: 500,
      priceRange: [400, 600],
      stock: 1,
      reward: { fakeGreenCode: true },
      risk: 0.4, // 40%被发现风险
      riskPenalty: { money: -1000, sanity: -50, reputation: -50, quarantineDaysLeft: 14 }
    },
    {
      id: 'pass_permit',
      name: '通行证（临时）',
      icon: '🎫',
      description: '某志愿者的空白通行证，可用3次',
      price: 200,
      priceRange: [150, 250],
      stock: 1,
      reward: { passPermit: 3 },
      risk: 0.15,
      riskPenalty: { money: -300, sanity: -25, reputation: -30 }
    },
    {
      id: 'n95_masks',
      name: 'N95口罩（10个）',
      icon: '😷',
      description: '正规渠道难买的防护装备',
      price: 100,
      priceRange: [80, 120],
      stock: 4,
      reward: { n95Masks: 10 },
      risk: 0.02,
      riskPenalty: { money: -100, reputation: -10 }
    }
  ],

  // 特殊事件
  specialEvents: [
    {
      id: 'police_raid',
      name: '警察突袭',
      probability: 0.08,
      description: '警察突然出现，黑市摊贩四散逃窜！',
      effect: { sanity: -20, money: -50, time: 60 },
      message: '你慌乱逃跑，丢了一些钱，还虚惊一场...'
    },
    {
      id: 'price_bargain',
      name: '砍价成功',
      probability: 0.15,
      description: '卖家急着出货，同意打折',
      effect: { discount: 0.7 },
      message: '你成功砍价到7折！'
    },
    {
      id: 'free_bonus',
      name: '额外赠品',
      probability: 0.1,
      description: '卖家看你面善，多送了点东西',
      effect: { bonusFood: 2 },
      message: '卖家额外送了你 2 份生鲜！'
    }
  ]
};

// 初始化黑市状态
if (!gameState.blackMarket) {
  gameState.blackMarket = {
    discovered: false,
    lastVisitDay: 0,
    totalTransactions: 0,
    reputation: 0 // 黑市声望
  };
}

/**
 * 检查黑市是否开放
 */
export function isBlackMarketOpen() {
  const hour = gameState.hour;
  return hour >= BLACK_MARKET_CONFIG.openHour || hour < BLACK_MARKET_CONFIG.closeHour;
}

/**
 * 发现黑市（通过特定条件触发）
 */
export function discoverBlackMarket() {
  if (gameState.blackMarket.discovered) {
    showToast('你已经知道黑市的位置了。', 'info');
    return false;
  }

  gameState.blackMarket.discovered = true;
  audio.playTone(300, 0.3, 'triangle', 0.4);
  showToast('🌙 你在深夜听到楼下有异动，发现了地下黑市的秘密...', 'success');

  // 延迟显示更多信息
  setTimeout(() => {
    showToast('黑市在每晚 22:00 - 凌晨 04:00 开放，可以买到紧俏物资，但伴随风险！', 'info');
  }, 3000);

  return true;
}

/**
 * 打开黑市界面
 */
export function openBlackMarket() {
  if (!gameState.blackMarket.discovered) {
    showToast('你还不知道黑市在哪里...', 'error');
    return false;
  }

  if (!isBlackMarketOpen()) {
    showToast('黑市只在深夜开放（22:00 - 04:00），现在去只有空荡荡的街道。', 'warning');
    return false;
  }

  // 扣除前往黑市的时间和体力
  advanceTime(20);
  gameState.energy = Math.max(0, gameState.energy - 5);

  // 检查特殊事件
  checkBlackMarketSpecialEvent();

  // 显示黑市界面
  showBlackMarketModal();
  return true;
}

/**
 * 显示黑市模态框
 */
function showBlackMarketModal() {
  const modal = document.getElementById('modalBlackMarket');
  if (!modal) {
    showToast('黑市系统未初始化', 'error');
    return;
  }

  const goodsEl = document.getElementById('blackMarketGoods');
  if (goodsEl) {
    goodsEl.innerHTML = '';

    BLACK_MARKET_CONFIG.goods.forEach(good => {
      const div = document.createElement('div');
      div.className = 'bg-zinc-900 p-4 rounded-lg border border-red-900/30 hover:border-red-700 cursor-pointer transition-all';

      // 随机价格波动
      const price = Math.floor(
        good.priceRange[0] + Math.random() * (good.priceRange[1] - good.priceRange[0])
      );

      const canAfford = gameState.money >= price;
      if (!canAfford) {
        div.className += ' opacity-50 cursor-not-allowed';
      }

      // 风险指示器
      const riskLevel = good.risk < 0.1 ? '低' : good.risk < 0.2 ? '中' : '高';
      const riskColor = good.risk < 0.1 ? 'text-yellow-400' : good.risk < 0.2 ? 'text-orange-400' : 'text-red-400';

      div.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${good.icon}</span>
            <div>
              <div class="font-bold text-white">${good.name}</div>
              <div class="text-xs text-zinc-500">${good.description}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-green-400 font-bold text-lg">¥${price}</div>
            <div class="${riskColor} text-xs">风险: ${riskLevel}</div>
          </div>
        </div>
        <div class="text-xs text-zinc-600">库存: ${good.stock} | 买到${Math.round(good.risk * 100)}%概率遭遇风险</div>
      `;

      if (canAfford && good.stock > 0) {
        div.onclick = () => purchaseBlackMarketGood(good, price);
      }

      goodsEl.appendChild(div);
    });
  }

  modal.classList.remove('hidden');
  audio.playTone(150, 0.15, 'sawtooth', 0.2);
}

/**
 * 购买黑市商品
 */
function purchaseBlackMarketGood(good, price) {
  if (gameState.money < price) {
    showToast('钱不够！', 'error');
    return;
  }

  if (good.stock <= 0) {
    showToast('卖光了！', 'error');
    return;
  }

  // 扣钱
  gameState.money -= price;
  good.stock -= 1;

  // 风险判定
  const hitRisk = Math.random() < good.risk;

  if (hitRisk) {
    // 触发风险
    audio.playWarning();
    showToast(`⚠️ 交易出事了！${getRiskDescription(good.id)}`, 'error');

    // 应用惩罚
    for (const [key, value] of Object.entries(good.riskPenalty)) {
      if (key === 'bodyTemp') {
        gameState[key] = Math.min(40, gameState[key] + value);
      } else {
        gameState[key] = Math.max(0, gameState[key] + value);
      }
    }
  } else {
    // 成功交易
    audio.playTone(800, 0.2, 'square', 0.3);
    showToast(`✅ 交易成功！获得 ${good.name}`, 'success');

    // 应用奖励
    for (const [key, value] of Object.entries(good.reward)) {
      if (typeof value === 'boolean') {
        gameState[key] = value;
      } else {
        gameState[key] = (gameState[key] || 0) + value;
      }
    }

    // 增加黑市声望
    gameState.blackMarket.reputation += 1;
    gameState.blackMarket.totalTransactions += 1;
  }

  updateHUD();
  closeBlackMarket();
}

/**
 * 获取风险描述
 */
function getRiskDescription(goodId) {
  const descriptions = {
    food_bundle: '被人举报囤积居奇，罚款并没收部分物资！',
    medicine_black: '买到了假药，服用后体温不降反升！',
    test_kit_premium: '被社区巡逻发现，罚款并记录在案！',
    fake_green_code: '假码被识破，立即被强制隔离14天！',
    pass_permit: '被查出证件造假，罚款并列入黑名单！',
    n95_masks: '口罩被证实为假货，钱打了水漂！'
  };
  return descriptions[goodId] || '交易失败！';
}

/**
 * 检查黑市特殊事件
 */
function checkBlackMarketSpecialEvent() {
  for (const event of BLACK_MARKET_CONFIG.specialEvents) {
    if (Math.random() < event.probability) {
      triggerBlackMarketEvent(event);
      return;
    }
  }
}

/**
 * 触发黑市特殊事件
 */
function triggerBlackMarketEvent(event) {
  audio.playTone(200, 0.25, 'sawtooth', 0.35);
  showToast(`🌙 ${event.description}`, 'warning');

  if (event.effect.time) {
    advanceTime(event.effect.time);
  }
  if (event.effect.sanity) {
    gameState.sanity = Math.max(0, gameState.sanity + event.effect.sanity);
  }
  if (event.effect.money) {
    gameState.money = Math.max(0, gameState.money + event.effect.money);
  }

  setTimeout(() => {
    showToast(event.message, event.effect.sanity < 0 ? 'error' : 'success');
  }, 2000);

  updateHUD();
}

/**
 * 关闭黑市
 */
export function closeBlackMarket() {
  const modal = document.getElementById('modalBlackMarket');
  if (modal) {
    modal.classList.add('hidden');
  }

  // 返回耗时
  advanceTime(15);
  gameState.blackMarket.lastVisitDay = gameState.day;
}

/**
 * 每日重置黑市库存
 */
export function resetBlackMarketStock() {
  BLACK_MARKET_CONFIG.goods.forEach(good => {
    good.stock = Math.floor(Math.random() * 3) + 1; // 1-3 件随机库存
  });
}

/**
 * 自动发现黑市（在特定条件下）
 */
export function autoDiscoverBlackMarket() {
  if (gameState.blackMarket.discovered) return;

  // 条件：第5天后 + 深夜在家 + 食物短缺
  if (gameState.day >= 5 &&
      (gameState.hour >= 22 || gameState.hour < 4) &&
      (gameState.rawFood + gameState.instantFood) < 3) {

    if (Math.random() < 0.3) { // 30%概率触发
      discoverBlackMarket();
    }
  }
}
