/**
 * 新闻系统 - 每日早间疫情播报
 * 动态影响游戏世界状态
 */

import { gameState } from '../data/gameState.js';
import { showToast } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 新闻事件池
const NEWS_EVENTS = {
  // 疫情通报类
  OUTBREAK: [
    {
      id: 'warehouse_positive',
      title: '【流调通报】某冷链物流园检出阳性',
      content: '昨日某冷链仓库发现确诊病例，已紧急封闭。进出该区域人员请主动报备。',
      effects: {
        lockdownLevel: +1,
        infectionRisk: 1.3,
        priceMultiplier: { rawFood: 1.2 }
      },
      probability: 0.3
    },
    {
      id: 'community_cases',
      title: '【疫情升级】本市新增社区传播病例',
      content: '今日新增无症状感染者微幅上升，呼吁市民非必要不聚会，做好个人防护。',
      effects: {
        infectionRisk: 1.2,
        subwayRisk: 1.4
      },
      probability: 0.4
    },
    {
      id: 'zero_case',
      title: '【好消息】全市连续3天零新增',
      content: '防控成效显著，但请市民继续保持警惕，不可掉以轻心。',
      effects: {
        lockdownLevel: -1,
        infectionRisk: 0.8,
        sanityBonus: 10
      },
      probability: 0.15
    }
  ],

  // 交通管控类
  TRANSPORT: [
    {
      id: 'subway_skip',
      title: '【交通管制】地铁部分线路临时跳站',
      content: '因防疫需要，地铁10号线部分站点临时关闭，请提前规划出行路线。',
      effects: {
        subwayClosed: true,
        subwayRisk: 0 // 关闭后无法乘坐
      },
      probability: 0.2
    },
    {
      id: 'traffic_normal',
      title: '【交通恢复】公共交通运营正常',
      content: '随着疫情平稳，地铁、公交恢复正常班次，请市民错峰出行。',
      effects: {
        subwayClosed: false,
        subwayRisk: 1.0
      },
      probability: 0.25
    }
  ],

  // 物资供应类
  SUPPLY: [
    {
      id: 'medicine_back',
      title: '【产能恢复】布洛芬厂家恢复供应',
      content: '国家退烧类药物产能翻倍释放，街区大药房逐步恢复现货直供！',
      effects: {
        priceMultiplier: { pills: 0.8 },
        pharmacyStock: 'abundant'
      },
      probability: 0.25
    },
    {
      id: 'grocery_boost',
      title: '【物流动态】生鲜电商加大运力投放',
      content: '叮咚买菜、朴朴超市加大清晨运力，鼓励市民合理错峰按需采购。',
      effects: {
        grocerySlots: +2, // 抢菜难度降低
        priceMultiplier: { rawFood: 0.9 }
      },
      probability: 0.3
    },
    {
      id: 'supply_shortage',
      title: '【物资紧张】部分生活物资供应吃紧',
      content: '受物流影响，部分商超出现暂时性缺货，请市民理性购买，避免囤积。',
      effects: {
        priceMultiplier: { rawFood: 1.5, instantFood: 1.3 },
        grocerySlots: -1
      },
      probability: 0.2
    }
  ],

  // 政策类
  POLICY: [
    {
      id: 'nucleic_24h',
      title: '【政策调整】核酸检测时效缩短至24小时',
      content: '为加强防控，健康码有效期调整为24小时，请市民及时进行核酸检测。',
      effects: {
        nucleicValidity: 24,
        checkpointStrict: true
      },
      probability: 0.15
    },
    {
      id: 'work_from_home',
      title: '【通知】倡导企业实行居家办公',
      content: '市政府呼吁有条件的企业采取弹性工作制，减少人员聚集。',
      effects: {
        workFromHomeAvailable: true,
        officeInfectionRisk: 0.7
      },
      probability: 0.2
    },
    {
      id: 'lockdown_lift',
      title: '【解封通知】部分封控小区解除管控',
      content: '经评估，部分低风险小区解除静态管理，居民可有序出入。',
      effects: {
        lockdownLevel: -1,
        sanityBonus: 20
      },
      probability: 0.1
    }
  ],

  // 天气与环境
  WEATHER: [
    {
      id: 'rainy_humid',
      title: '【气溶胶预警】近期阴雨高湿',
      content: '未来一周持续降雨，公共交通人员密度上升，请务必佩戴好N95口罩。',
      effects: {
        infectionRisk: 1.3,
        subwayRisk: 1.5,
        outdoorRisk: 1.2
      },
      probability: 0.25
    }
  ],

  // 社会新闻
  SOCIAL: [
    {
      id: 'volunteer_story',
      title: '【暖心故事】社区志愿者守护独居老人',
      content: '疫情下，无数志愿者默默奉献，为独居老人送菜送药，彰显人间温情。',
      effects: {
        sanityBonus: 5,
        reputationMultiplier: 1.2
      },
      probability: 0.2
    },
    {
      id: 'panic_buying',
      title: '【社会现象】部分市民恐慌性囤货',
      content: '请市民保持理性，政府保障物资充足，无需过度囤积。',
      effects: {
        priceMultiplier: { rawFood: 1.3, instantFood: 1.2 }
      },
      probability: 0.15
    }
  ]
};

/**
 * 获取今日新闻
 */
export function getDailyNews() {
  if (!gameState.newsHistory) {
    gameState.newsHistory = {
      lastDay: 0,
      history: []
    };
  }

  // 每天只生成一次新闻
  if (gameState.newsHistory.lastDay === gameState.day) {
    return gameState.newsHistory.todayNews || null;
  }

  // 根据当前封控等级和天数选择合适的新闻
  const availableCategories = getAvailableNewsCategories();
  const selectedNews = selectNews(availableCategories);

  gameState.newsHistory.lastDay = gameState.day;
  gameState.newsHistory.todayNews = selectedNews;
  gameState.newsHistory.history.push({
    day: gameState.day,
    news: selectedNews
  });

  return selectedNews;
}

/**
 * 获取可用的新闻分类
 */
function getAvailableNewsCategories() {
  const categories = [];

  // 根据游戏状态选择合适的新闻类型
  if (gameState.day <= 3) {
    categories.push('OUTBREAK', 'SUPPLY', 'SOCIAL');
  } else if (gameState.lockdownLevel >= 2) {
    categories.push('OUTBREAK', 'TRANSPORT', 'POLICY', 'WEATHER');
  } else {
    categories.push('SUPPLY', 'SOCIAL', 'WEATHER', 'TRANSPORT');
  }

  return categories;
}

/**
 * 选择新闻
 */
function selectNews(categories) {
  const allNews = [];

  categories.forEach(category => {
    if (NEWS_EVENTS[category]) {
      allNews.push(...NEWS_EVENTS[category]);
    }
  });

  // 根据概率选择
  const rand = Math.random();
  let cumulative = 0;

  for (const news of allNews) {
    cumulative += news.probability;
    if (rand <= cumulative) {
      return news;
    }
  }

  // 默认返回第一条
  return allNews[0] || null;
}

/**
 * 应用新闻效果
 */
export function applyNewsEffects(news) {
  if (!news || !news.effects) return;

  const effects = news.effects;

  // 封控等级变化
  if (effects.lockdownLevel !== undefined) {
    gameState.lockdownLevel = Math.max(1, Math.min(3, gameState.lockdownLevel + effects.lockdownLevel));
  }

  // 感染风险倍率
  if (effects.infectionRisk !== undefined) {
    if (!gameState.worldEffects) gameState.worldEffects = {};
    gameState.worldEffects.infectionRisk = effects.infectionRisk;
  }

  if (effects.subwayRisk !== undefined) {
    if (!gameState.worldEffects) gameState.worldEffects = {};
    gameState.worldEffects.subwayRisk = effects.subwayRisk;
  }

  if (effects.outdoorRisk !== undefined) {
    if (!gameState.worldEffects) gameState.worldEffects = {};
    gameState.worldEffects.outdoorRisk = effects.outdoorRisk;
  }

  // 价格倍率
  if (effects.priceMultiplier) {
    if (!gameState.worldEffects) gameState.worldEffects = {};
    gameState.worldEffects.priceMultiplier = {
      ...gameState.worldEffects.priceMultiplier,
      ...effects.priceMultiplier
    };
  }

  // 心境奖励
  if (effects.sanityBonus) {
    gameState.sanity = Math.min(100, gameState.sanity + effects.sanityBonus);
  }

  // 地铁关闭
  if (effects.subwayClosed !== undefined) {
    gameState.subwayClosed = effects.subwayClosed;
  }

  // 抢菜难度
  if (effects.grocerySlots !== undefined) {
    if (!gameState.worldEffects) gameState.worldEffects = {};
    gameState.worldEffects.grocerySlots = (gameState.worldEffects.grocerySlots || 0) + effects.grocerySlots;
  }

  // 药房库存
  if (effects.pharmacyStock) {
    if (!gameState.worldEffects) gameState.worldEffects = {};
    gameState.worldEffects.pharmacyStock = effects.pharmacyStock;
  }

  // 居家办公
  if (effects.workFromHomeAvailable !== undefined) {
    gameState.workFromHomeAvailable = effects.workFromHomeAvailable;
  }

  updateHUD();
}

/**
 * 观看早间新闻
 */
export function watchMorningNews() {
  const news = getDailyNews();

  if (!news) {
    showToast('今日暂无重要新闻播报。', 'info');
    return;
  }

  // 首次看到新闻，应用效果
  if (!news.viewed) {
    applyNewsEffects(news);
    news.viewed = true;
  }

  audio.playTone(440, 0.3, 'sine', 0.1);

  // 显示新闻内容
  const fullMessage = `${news.title}\n\n${news.content}`;
  showToast(fullMessage, 'info');

  // 如果有心境奖励，显示
  if (news.effects && news.effects.sanityBonus) {
    setTimeout(() => {
      if (window.player) {
        const { spawnFloatingText } = require('../ui/toast.js');
        spawnFloatingText(`心境 +${news.effects.sanityBonus}`, window.player.x, window.player.y - 70, '#a78bfa');
      }
    }, 500);
  }
}

/**
 * 获取价格倍率
 */
export function getPriceMultiplier(itemType) {
  if (!gameState.worldEffects || !gameState.worldEffects.priceMultiplier) {
    return 1.0;
  }

  return gameState.worldEffects.priceMultiplier[itemType] || 1.0;
}

/**
 * 获取感染风险倍率
 */
export function getInfectionRiskMultiplier(type = 'general') {
  if (!gameState.worldEffects) return 1.0;

  switch (type) {
    case 'subway':
      return gameState.worldEffects.subwayRisk || 1.0;
    case 'outdoor':
      return gameState.worldEffects.outdoorRisk || 1.0;
    default:
      return gameState.worldEffects.infectionRisk || 1.0;
  }
}

/**
 * 检查地铁是否可用
 */
export function isSubwayAvailable() {
  return !gameState.subwayClosed;
}

/**
 * 获取抢菜难度调整
 */
export function getGroceryDifficulty() {
  if (!gameState.worldEffects) return 0;
  return gameState.worldEffects.grocerySlots || 0;
}

/**
 * 获取新闻历史
 */
export function getNewsHistory() {
  if (!gameState.newsHistory) return [];
  return gameState.newsHistory.history || [];
}

/**
 * 生成紧急突发新闻（随机事件）
 */
export function generateBreakingNews() {
  const breakingNews = [
    {
      title: '🚨 【紧急通知】所在楼栋发现阳性',
      content: '你所在的楼栋检出确诊病例！全楼立即原地静止，等待上门核酸！',
      effects: {
        forcedQuarantine: true,
        quarantineDays: 3
      }
    },
    {
      title: '📢 【临时管控】小区升级为封控区',
      content: '因周边疫情形势严峻，小区即日起实施封闭管理，人员只进不出！',
      effects: {
        lockdownLevel: 3,
        cannotLeave: true
      }
    },
    {
      title: '✅【管控解除】小区降为防范区',
      content: '经评估，小区风险等级下调，居民可凭48小时核酸有序出入！',
      effects: {
        lockdownLevel: 1,
        cannotLeave: false
      }
    }
  ];

  const selected = breakingNews[Math.floor(Math.random() * breakingNews.length)];

  audio.playWarning();
  showToast(selected.title + '\n' + selected.content, 'error');

  applyNewsEffects(selected);

  return selected;
}

/**
 * 重置每日新闻效果（新的一天开始）
 */
export function resetDailyNewsEffects() {
  // 重置临时效果
  if (gameState.worldEffects) {
    // 保留一些持久性效果，重置临时效果
    gameState.worldEffects.infectionRisk = 1.0;
    gameState.worldEffects.subwayRisk = 1.0;
    gameState.worldEffects.outdoorRisk = 1.0;
  }
}

/**
 * 初始化新闻系统
 */
export function initNewsSystem() {
  if (!gameState.newsHistory) {
    gameState.newsHistory = {
      lastDay: 0,
      history: [],
      todayNews: null
    };
  }

  if (!gameState.worldEffects) {
    gameState.worldEffects = {
      infectionRisk: 1.0,
      subwayRisk: 1.0,
      outdoorRisk: 1.0,
      priceMultiplier: {},
      grocerySlots: 0
    };
  }
}
