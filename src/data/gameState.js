/**
 * 游戏状态数据管理
 * 集中管理所有游戏状态变量
 */

export const gameState = {
  // 时间系统
  day: 1,
  hour: 7,
  minute: 30,
  timeSpeed: 1, // 0=暂停, 1=正常, 3=快速
  timeAccumulator: 0,

  // 财务与租金
  money: 1850,
  rentDueDays: 3,
  rentAmount: 450,
  reputation: 10,  // 社区声望

  // 库存物资
  rawFood: 4,      // 鲜食材料
  instantFood: 2,  // 自热便当
  pillsCount: 2,   // 退烧药
  antigenKits: 2,  // 抗原试剂

  // 生理指标
  hunger: 85,      // 饱食度 0-100
  energy: 95,      // 精力 0-100
  sanity: 85,      // 心境 0-100
  bodyTemp: 36.6,  // 体温
  viralLoad: 0,    // 病毒载量 0=健康, 10-40=潜伏, >50=阳性
  pillCooldownMinutes: 0, // 药物冷却时间

  // 状态标记
  hasMaskOn: true,
  hasWorkedToday: false,
  isPositiveKnown: false,
  quarantineDaysLeft: 0,
  mapId: 'living',
  nearbyItem: null,
  activeAction: null,
  lockdownLevel: 1, // 1=正常, 2=局部封控, 3=全域静默

  // 深度玩法状态 - 抢菜小游戏
  groceryRush: {
    active: false,
    phase: 'waiting',
    clicksNeeded: 8,
    clicksCurrent: 0,
    secondsLeft: 12,
    timerId: null,
    queuePhase: 0,
    completedToday: false
  },

  // 工作状态
  workShift: {
    active: false,
    kpi: 0,
    sanitized: false,
    elapsedMinutes: 0,
    totalMinutes: 480,
    baseSalary: 380,
    bonusSalary: 0,
    colleagueInfected: false,
    colleagueEventTriggered: false,
    hrCaughtCount: 0
  },

  activeGroupBuy: null,

  medicationHistory: {
    consecutiveDoses: 0,
    lastDoseDay: 0,
    totalDosesTaken: 0
  },

  feverStageHistory: {
    currentStage: 'healthy',
    stageChangedAt: { day: 1, hour: 7 }
  },

  newsHistory: {
    lastDay: 0,
    history: [],
    todayNews: null
  },

  worldEffects: {
    infectionRisk: 1.0,
    subwayRisk: 1.0,
    outdoorRisk: 1.0,
    priceMultiplier: {},
    grocerySlots: 0,
    pharmacyStock: 'normal'
  },

  subwayClosed: false,
  workFromHomeAvailable: false,

  deepGameplay: {
    initialized: false,
    version: '2.0.0'
  }
};

/**
 * 重置游戏状态
 */
export function resetGameState() {
  Object.assign(gameState, {
    day: 1,
    hour: 7,
    minute: 30,
    money: 1850,
    rawFood: 4,
    instantFood: 2,
    pillsCount: 2,
    antigenKits: 2,
    hunger: 85,
    energy: 95,
    sanity: 85,
    bodyTemp: 36.6,
    viralLoad: 0,
    hasMaskOn: true,
    isPositiveKnown: false,
    quarantineDaysLeft: 0
  });
}
