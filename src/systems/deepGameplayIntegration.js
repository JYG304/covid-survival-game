/**
 * 深度玩法集成 - 将所有新系统整合到游戏中
 * 统一管理和协调各个深度玩法模块
 */

import { gameState } from '../data/gameState.js';
import {
  startGroceryRush,
  handleGroceryClick,
  closeGroceryRush,
  resetDailyGroceryRush
} from './groceryRushSystem.js';
import {
  startOfficeWork,
  workHard,
  workSlack,
  sanitizeWorkspace,
  finishWorkDay,
  handleColleagueChoice,
  workMail,
  workLunch,
  workOvertime
} from './officeWorkSystem.js';
import {
  getCurrentFeverStage,
  updateFeverEffects,
  takeMedication,
  showFeverDetails,
  progressFeverNaturally,
  initFeverSystem
} from './feverSystem.js';
import {
  startGroupBuy,
  executeBarter,
  volunteerDelivery,
  checkContactlessRack,
  emergencyHelp,
  getReputationBenefits
} from './communitySystem.js';
import {
  watchMorningNews,
  getPriceMultiplier,
  getInfectionRiskMultiplier,
  isSubwayAvailable,
  generateBreakingNews,
  resetDailyNewsEffects,
  initNewsSystem
} from './newsSystem.js';
import { updateHUD } from '../ui/hud.js';
import { showToast } from '../ui/toast.js';

// 新系统导入
import {
  startSleep,
  quickNap,
  closeNightmareModal
} from './sleepSystem.js';
import {
  triggerNeighborEvent,
  askNeighborForHelp,
  showNeighborPanel,
  closeNeighborPanel,
  closeNeighborEventModal,
  dailyNeighborCheck
} from './neighborSystem.js';
import {
  doMentalActivity,
  showMentalHealthPanel,
  closeMentalHealthPanel,
  checkMentalBreakdown,
  naturalSanityRecover
} from './mentalHealthSystem.js';
import {
  openBlackMarket,
  closeBlackMarket,
  resetBlackMarketStock,
  autoDiscoverBlackMarket
} from './blackMarketSystem.js';
import { initSimsLife, tickSimsHour, onSimsNewDay, applyLifeAction } from './simsLifeSystem.js';
import { initStreetNpcs, updateStreetNpcs, nearestNpc, talkToNpc, recruitNpc } from './npcInteractSystem.js';
import { initMassageParlor, updateMassageParlor, openParlorFromStreet, closeParlorMenu } from './massageParlorSystem.js';
import { initMaps, spawnMapNpcs, travelTo } from './mapSystem.js';
import { bindMapPickModal } from './sceneActionSystem.js';
import { initStats, tickStatsHour } from './statsSystem.js';
import { initQuests, onQuestNewDay } from './questSystem.js';
import { bindDialogueModal } from './npcInteractSystem.js';
import { initOutfit, renderOutfitShop, openGear } from './outfitSystem.js';

/**
 * 初始化所有深度玩法系统
 */
export function initDeepGameplaySystems() {
  initFeverSystem();
  initNewsSystem();
  initSimsLife();
  initStats();
  initQuests();
  initStreetNpcs();
  initMaps();
  spawnMapNpcs();
  initMassageParlor();
  initOutfit();

  // 初始化游戏状态的扩展字段
  if (!gameState.deepGameplay) {
    gameState.deepGameplay = {
      initialized: true,
      version: '3.0.0' // 升级版本号
    };
  }

  // 绑定UI事件
  bindDeepGameplayEvents();

  console.log('✅ 深度玩法系统初始化完成 v3.0');
}

/**
 * 绑定深度玩法UI事件
 */
function bindDeepGameplayEvents() {
  // 抢菜系统
  const btnOpenGroceryRush = document.getElementById('btnOpenGroceryRush');
  if (btnOpenGroceryRush) {
    btnOpenGroceryRush.onclick = startGroceryRush;
  }

  const btnClickPayGrocery = document.getElementById('btnClickPayGrocery');
  if (btnClickPayGrocery) {
    btnClickPayGrocery.onclick = handleGroceryClick;
  }

  const btnCloseGroceryRush = document.getElementById('btnCloseGroceryRush');
  if (btnCloseGroceryRush) {
    btnCloseGroceryRush.onclick = closeGroceryRush;
  }

  // 办公室工作系统
  const btnWorkHard = document.getElementById('btnWorkHard');
  if (btnWorkHard) {
    btnWorkHard.onclick = workHard;
  }

  const btnWorkSlack = document.getElementById('btnWorkSlack');
  if (btnWorkSlack) {
    btnWorkSlack.onclick = workSlack;
  }

  const btnWorkMaskCheck = document.getElementById('btnWorkMaskCheck');
  if (btnWorkMaskCheck) {
    btnWorkMaskCheck.onclick = sanitizeWorkspace;
  }

  const btnFinishWorkDay = document.getElementById('btnFinishWorkDay');
  if (btnFinishWorkDay) {
    btnFinishWorkDay.onclick = finishWorkDay;
  }
  document.getElementById('btnWorkMail')?.addEventListener('click', workMail);
  document.getElementById('btnWorkLunch')?.addEventListener('click', workLunch);
  document.getElementById('btnWorkOT')?.addEventListener('click', workOvertime);

  // 同事感染选择
  const btnColleagueReport = document.getElementById('btnColleagueReport');
  if (btnColleagueReport) {
    btnColleagueReport.onclick = () => handleColleagueChoice('report');
  }

  const btnColleagueHelp = document.getElementById('btnColleagueHelp');
  if (btnColleagueHelp) {
    btnColleagueHelp.onclick = () => handleColleagueChoice('help');
  }

  const btnColleagueIgnore = document.getElementById('btnColleagueIgnore');
  if (btnColleagueIgnore) {
    btnColleagueIgnore.onclick = () => handleColleagueChoice('ignore');
  }

  // 发热系统 - 服药
  const btnTakePill = document.getElementById('btnTakePill');
  if (btnTakePill) {
    btnTakePill.onclick = () => takeMedication('ibuprofen');
  }

  // 健康码点击显示详情
  const badgeCovidStatus = document.getElementById('badgeCovidStatus');
  if (badgeCovidStatus) {
    badgeCovidStatus.onclick = showFeverDetails;
  }

  // 社区团购
  const btnStartGroupBuyVeggies = document.getElementById('btnStartGroupBuyVeggies');
  if (btnStartGroupBuyVeggies) {
    btnStartGroupBuyVeggies.onclick = () => startGroupBuy('veggies');
  }

  const btnStartGroupBuyMedical = document.getElementById('btnStartGroupBuyMedical');
  if (btnStartGroupBuyMedical) {
    btnStartGroupBuyMedical.onclick = () => startGroupBuy('medical');
  }

  // 以物易物
  const btnTradePillsForFood = document.getElementById('btnTradePillsForFood');
  if (btnTradePillsForFood) {
    btnTradePillsForFood.onclick = () => executeBarter('pills_for_food');
  }

  const btnTradeFoodForKit = document.getElementById('btnTradeFoodForKit');
  if (btnTradeFoodForKit) {
    btnTradeFoodForKit.onclick = () => executeBarter('food_for_kit');
  }

  // 志愿者
  const btnVolunteer = document.getElementById('btnVolunteer');
  if (btnVolunteer) {
    btnVolunteer.onclick = volunteerDelivery;
  }

  // 通勤选择 - 集成感染风险倍率
  const btnChooseSubway = document.getElementById('btnChooseSubway');
  if (btnChooseSubway) {
    btnChooseSubway.onclick = () => {
      if (!isSubwayAvailable()) {
        showToast('地铁线路临时关闭，请选择其他交通方式！', 'error');
        return;
      }
      const riskMultiplier = getInfectionRiskMultiplier('subway');
      startOfficeWork('地铁', 4, 40, 0.35 * riskMultiplier);
    };
  }

  const btnChooseBike = document.getElementById('btnChooseBike');
  if (btnChooseBike) {
    btnChooseBike.onclick = () => {
      const riskMultiplier = getInfectionRiskMultiplier('outdoor');
      startOfficeWork('美团单车', 2.5, 60, 0.05 * riskMultiplier);
    };
  }

  const btnChooseTaxi = document.getElementById('btnChooseTaxi');
  if (btnChooseTaxi) {
    btnChooseTaxi.onclick = () => {
      startOfficeWork('专车', 48, 25, 0.03);
    };
  }

  // 睡眠系统
  const btnSleep8h = document.getElementById('btnSleep8h');
  if (btnSleep8h) {
    btnSleep8h.onclick = () => startSleep(8);
  }

  const btnSleep6h = document.getElementById('btnSleep6h');
  if (btnSleep6h) {
    btnSleep6h.onclick = () => startSleep(6);
  }

  const btnQuickNap = document.getElementById('btnQuickNap');
  if (btnQuickNap) {
    btnQuickNap.onclick = quickNap;
  }

  const btnCloseNightmare = document.getElementById('btnCloseNightmare');
  if (btnCloseNightmare) {
    btnCloseNightmare.onclick = closeNightmareModal;
  }

  // 邻居系统
  const btnNeighborPanel = document.getElementById('btnNeighborPanel');
  if (btnNeighborPanel) {
    btnNeighborPanel.onclick = showNeighborPanel;
  }

  const btnCloseNeighborPanel = document.getElementById('btnCloseNeighborPanel');
  if (btnCloseNeighborPanel) {
    btnCloseNeighborPanel.onclick = closeNeighborPanel;
  }

  const btnCloseNeighborEvent = document.getElementById('btnCloseNeighborEvent');
  if (btnCloseNeighborEvent) {
    btnCloseNeighborEvent.onclick = closeNeighborEventModal;
  }

  // 心理健康系统
  const btnMentalHealth = document.getElementById('btnMentalHealth');
  if (btnMentalHealth) {
    btnMentalHealth.onclick = showMentalHealthPanel;
  }

  const btnCloseMentalHealth = document.getElementById('btnCloseMentalHealth');
  if (btnCloseMentalHealth) {
    btnCloseMentalHealth.onclick = closeMentalHealthPanel;
  }

  // 黑市系统
  const btnBlackMarket = document.getElementById('btnBlackMarket');
  if (btnBlackMarket) {
    btnBlackMarket.onclick = openBlackMarket;
  }

  const btnCloseBlackMarket = document.getElementById('btnCloseBlackMarket');
  if (btnCloseBlackMarket) {
    btnCloseBlackMarket.onclick = closeBlackMarket;
  }

  const closeKitchen = () => document.getElementById('modalKitchen')?.classList.add('hidden');
  document.getElementById('btnCloseKitchen')?.addEventListener('click', closeKitchen);
  document.getElementById('btnCookNoodles')?.addEventListener('click', () => cookMeal('noodles'));
  document.getElementById('btnCookGingerTea')?.addEventListener('click', () => cookMeal('tea'));
  document.getElementById('btnEatInstantMeal')?.addEventListener('click', () => cookMeal('instant'));
  document.getElementById('btnCloseParlor')?.addEventListener('click', closeParlorMenu);
  bindMapPickModal();
  bindDialogueModal();
  document.getElementById('btnCloseMall')?.addEventListener('click', () => document.getElementById('modalMall')?.classList.add('hidden'));
  document.getElementById('phoneFab')?.addEventListener('click', () => {
    document.getElementById('phoneShell')?.classList.toggle('phone-collapsed');
  });
  document.getElementById('btnOpenGear')?.addEventListener('click', openGear);
  document.getElementById('btnCloseGear')?.addEventListener('click', () => document.getElementById('modalGear')?.classList.add('hidden'));
  document.querySelectorAll('[data-travel]').forEach((btn) => {
    btn.addEventListener('click', () => travelTo(btn.dataset.travel, Number(btn.dataset.spawn || 180)));
  });
}

function cookMeal(kind) {
  const { player } = window;
  if (kind === 'noodles') {
    if (gameState.rawFood < 1) { showToast('鲜食不够，煮不了面。', 'error'); return; }
    gameState.rawFood -= 1;
    gameState.hunger = Math.min(100, gameState.hunger + 35);
    gameState.sanity = Math.min(100, gameState.sanity + 10);
    applyLifeAction('cook', player);
    showToast('热汤面下肚，出租屋里终于有了烟火气。', 'success');
  } else if (kind === 'tea') {
    gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - 0.4);
    applyLifeAction('cook', player);
    showToast('姜汤喝完，额头没那么烫了。', 'success');
  } else {
    if (gameState.instantFood < 1) { showToast('便当吃完了。', 'error'); return; }
    gameState.instantFood -= 1;
    gameState.hunger = Math.min(100, gameState.hunger + 55);
    applyLifeAction('eatInstant', player);
    showToast('自热米饭滋滋响，也算一顿正经饭。', 'success');
  }
  document.getElementById('modalKitchen')?.classList.add('hidden');
  updateHUD();
}

/**
 * 每帧更新深度玩法系统
 */
export function talkNearbyNpc(player) {
  const npc = nearestNpc(player.x, 80);
  if (!npc) {
    showToast('附近没有能说话的人。', 'info');
    return;
  }
  talkToNpc(npc, player);
}

export function recruitNearbyNpc(player) {
  const npc = nearestNpc(player.x, 80);
  if (!npc) return;
  recruitNpc(npc);
}

export function updateDeepGameplay(delta) {
  updateStreetNpcs(delta);
  updateMassageParlor(delta);
  // 更新发热病程效果
  updateFeverEffects(delta);

  // 理智自然恢复
  naturalSanityRecover(delta);

  // 检查是否触发随机突发新闻（低概率）
  if (Math.random() < 0.0001) { // 每帧0.01%概率
    if (gameState.day >= 3 && gameState.lockdownLevel >= 2) {
      generateBreakingNews();
    }
  }

  // 自动发现黑市（深夜且资源短缺）
  autoDiscoverBlackMarket();
}

/**
 * 每日重置（在 timeSystem 的 onNewDayTick 中调用）
 */
export function onNewDay() {
  // 重置抢菜资格
  resetDailyGroceryRush();

  // 重置新闻效果
  resetDailyNewsEffects();

  // 病程自然进展
  progressFeverNaturally(24);

  // 重置黑市库存
  resetBlackMarketStock();

  // 邻居事件触发检查
  dailyNeighborCheck();

  // 生成今日新闻（会在玩家看电视时显示）
  // 新闻会在 watchMorningNews 中生成和应用
}

/**
 * 每小时更新
 */
export function onHourTick() {
  // 病程自然进展
  progressFeverNaturally(1);

  // 药物冷却时间减少
  if (gameState.pillCooldownMinutes > 0) {
    gameState.pillCooldownMinutes = Math.max(0, gameState.pillCooldownMinutes - 60);
  }

  // 心理崩溃检查
  checkMentalBreakdown();
  tickStatsHour();
}

/**
 * 获取修改后的价格
 */
export function getAdjustedPrice(basePrice, itemType) {
  const multiplier = getPriceMultiplier(itemType);
  return Math.ceil(basePrice * multiplier);
}

/**
 * 导出所有深度玩法功能供外部调用
 */
export const DeepGameplay = {
  // 初始化
  init: initDeepGameplaySystems,
  update: updateDeepGameplay,
  onNewDay,
  onHourTick,

  // 抢菜系统
  startGroceryRush,
  handleGroceryClick,
  closeGroceryRush,

  // 办公室系统
  startOfficeWork,
  workHard,
  workSlack,
  sanitizeWorkspace,
  finishWorkDay,
  handleColleagueChoice,

  // 发热系统
  getCurrentFeverStage,
  takeMedication,
  showFeverDetails,

  // 社区系统
  startGroupBuy,
  executeBarter,
  volunteerDelivery,
  checkContactlessRack,
  emergencyHelp,
  getReputationBenefits,

  // 新闻系统
  watchMorningNews,
  getPriceMultiplier,
  getInfectionRiskMultiplier,
  isSubwayAvailable,
  generateBreakingNews,

  // 睡眠系统
  startSleep,
  quickNap,

  // 邻居系统
  triggerNeighborEvent,
  askNeighborForHelp,
  showNeighborPanel,

  // 心理健康系统
  doMentalActivity,
  showMentalHealthPanel,

  // 黑市系统
  openBlackMarket,

  // 模拟人生需求
  tickSimsHour,
  onSimsNewDay,
  applyLifeAction,
  openParlorFromStreet,
  talkNearbyNpc,
  recruitNearbyNpc,
  travelTo,

  // 工具函数
  getAdjustedPrice
};

// 导出单独的函数以便其他模块使用
export {
  startGroceryRush,
  handleGroceryClick,
  startOfficeWork,
  takeMedication,
  watchMorningNews,
  executeBarter,
  checkContactlessRack,
  startSleep,
  quickNap,
  triggerNeighborEvent,
  showNeighborPanel,
  showMentalHealthPanel,
  openBlackMarket
};
