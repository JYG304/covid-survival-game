/**
 * 交互动作系统
 * 处理玩家与地标物体的交互逻辑
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from '../systems/timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';
import { applyLifeAction } from './simsLifeSystem.js';
import { sceneActions } from './sceneActionSystem.js';

/**
 * 执行睡觉动作
 */
export function sleep(player) {
  if (gameState.mapId === 'home') {
    import('./homeSystem.js').then((m) => m.openSleepMenu());
    return;
  }
  gameState.energy = Math.min(100, gameState.energy + 45);
  if (gameState.bodyTemp > 37.2) gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - 0.3);
  applyLifeAction('sleep', player);
  audio.playTone(330, 0.4, 'sine', 0.1);
  spawnFloatingText('+45 精力', player.x, player.y - 70, '#38bdf8');
  showToast('硬板床也能睡。窗帘拉不严。', 'success');
}

export function takeShower(player) {
  if (gameState.mapId === 'home') {
    import('./homeSystem.js').then((m) => m.useShower(player));
    return;
  }
  applyLifeAction('shower', player);
  if (gameState.bodyTemp > 37.4) gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - 0.15);
  audio.playTone(520, 0.35, 'sine', 0.08);
  spawnFloatingText('冲一下', player.x, player.y - 70, '#22d3ee');
  showToast('旅馆的水压很小。还是热的。', 'success');
}

/**
 * 看新闻 - 使用新闻系统
 */
export function watchNews(player) {
  applyLifeAction('watchNews', player);
  if (typeof window.DeepGameplay !== 'undefined' && window.DeepGameplay.watchMorningNews) {
    window.DeepGameplay.watchMorningNews();
    advanceTime(15);
    updateHUD();
  } else {
    // 降级处理
    const DAILY_NEWS_POOL = [
      { text: "【早间防疫速递】市疾控中心通报：昨日新增无症状感染者微幅上升，呼吁非必要不聚会。", change: () => {} },
      { text: "【物流动态通告】各大生鲜电商加大清晨运力投放，鼓励市民合理错峰按需采购。", change: () => { gameState.reputation += 2; } },
      { text: "【药品产能恢复】国家退烧类药物产能翻倍释放，街区大药房逐步恢复现货直供！", change: () => {} },
      { text: "【气溶胶预警】近期阴雨高湿，公共交通人员密度上升，请务必佩戴好 N95 口罩。", change: () => {} }
    ];

    const news = DAILY_NEWS_POOL[Math.floor(Math.random() * DAILY_NEWS_POOL.length)];
    audio.playTone(440, 0.3, 'sine', 0.1);
    showToast(news.text, 'info');
    news.change();
    advanceTime(15);
    updateHUD();
  }
}

/**
 * 出门
 */
export function exitHome(player) {
  if (gameState.isPositiveKnown && gameState.quarantineDaysLeft > 0) {
    audio.playWarning();
    showToast(`⚠️ 隔离管控中：健康码为红码！还需强制居家 ${gameState.quarantineDaysLeft} 天，严禁出门下楼！`, 'error');
    return false;
  }
  player.x = 890;
  showToast('来到楼下街道，空气中混杂着湿润的泥土与含氯消毒水气味。', 'info');
  return true;
}

/**
 * 检查无接触货架 - 使用社区系统
 */
export function checkRack(player) {
  // 使用深度玩法的社区系统
  if (typeof window.DeepGameplay !== 'undefined' && window.DeepGameplay.checkContactlessRack) {
    window.DeepGameplay.checkContactlessRack();
  } else {
    // 降级处理
    const chance = gameState.reputation >= 20 ? 0.8 : 0.45;
    if (Math.random() < chance) {
      gameState.rawFood += 2;
      audio.playCash();
      spawnFloatingText('+2 份社区配发蔬菜包', player.x, player.y - 70, '#34d399');
      showToast('在无接触架子上领到了居委会配发的新鲜白菜与挂面！', 'success');
    } else {
      showToast('货架空空如也，暂无新的外卖或蔬菜包。', 'info');
    }
  }
}

/**
 * 核酸检测
 */
export function takePCR(player) {
  if (gameState.viralLoad >= 50 || gameState.bodyTemp >= 38.0) {
    gameState.isPositiveKnown = true;
    gameState.quarantineDaysLeft = 4;
    audio.playWarning();
    showToast('🚨 警报！核酸初筛呈阳性！健康码变红，被网格员勒令即刻返回单间居家隔离4天！', 'error');
    player.x = 220;
  } else {
    audio.playTone(520, 0.25, 'triangle', 0.1);
    showToast('核酸采样完成！结果为【阴性】，48小时健康码通行时效已刷新！', 'success');
  }
}

/**
 * 撸猫
 */
export function petCat(player) {
  gameState.sanity = Math.min(100, gameState.sanity + 25);
  applyLifeAction('petCat', player);
  audio.playSip();
  spawnFloatingText('心境 +25 ❤️', player.x, player.y - 65, '#f43f5e');
  showToast('在冷雨与封控的压力下rua到了软绵绵的小猫，焦虑感一扫而空！', 'success');
}

/**
 * 买药
 */
export function buyMedicine(player) {
  if (gameState.money < 60) {
    showToast('银行卡余额不足 ¥60，买不起退热药！', 'error');
    return;
  }
  gameState.money -= 60;
  gameState.pillsCount += 1;
  audio.playCash();
  spawnFloatingText('+1 盒布洛芬胶囊', player.x, player.y - 70, '#f43f5e');
  showToast('在药店柜台买到了一盒退烧布洛芬备用！', 'success');
}

/**
 * 便利店购物
 */
export function buyFood(player) {
  if (gameState.money < 35) {
    showToast('零钱不足 ¥35，买不起便当！', 'error');
    return;
  }
  gameState.money -= 35;
  gameState.instantFood += 1;
  gameState.rawFood += 1;
  import('./homeSystem.js').then((m) => {
    m.addFridgeItem('instant', '自热便当', 96);
    m.addFridgeItem('raw', '鸡蛋', 36);
  });
  audio.playCash();
  spawnFloatingText('+1 便当 +1 生鲜蛋', player.x, player.y - 70, '#f59e0b');
  applyLifeAction('buyFood', player);
  showToast('采购了便当与鸡蛋，塞进冰箱。', 'success');
}

/**
 * 消杀
 */
export function disinfect(player) {
  if (gameState.viralLoad > 0 && gameState.viralLoad < 40) {
    gameState.viralLoad = Math.max(0, gameState.viralLoad - 15);
  }
  audio.playTone(880, 0.3, 'triangle', 0.08);
  spawnFloatingText('外部气溶胶消杀完毕', player.x, player.y - 70, '#38bdf8');
  showToast('雾炮车喷出的细密水雾清除了衣服表面的潜在病毒气溶胶。', 'info');
}

/**
 * 动作映射表
 */
export const actionHandlers = {
  sleep,
  takeShower,
  watchNews,
  exitHome,
  checkRack,
  takePCR,
  petCat,
  buyMedicine,
  buyFood,
  disinfect,
  openParlor: (player) => {
    if (typeof window.DeepGameplay?.openParlorFromStreet === 'function') {
      window.DeepGameplay.openParlorFromStreet(player);
    }
  },
  talkNpc: (player) => {
    if (typeof window.DeepGameplay?.talkNearbyNpc === 'function') {
      window.DeepGameplay.talkNearbyNpc(player);
    }
  },
  ...sceneActions
};
