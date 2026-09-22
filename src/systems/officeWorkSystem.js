/**
 * 办公室工作系统 - 完整的职场模拟
 * 包含KPI、摸鱼、同事感染等真实职场互动
 */

import { gameState } from '../data/gameState.js';
import { advanceTime } from './timeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';
import { salaryMultiplier, applyStatEvent } from './statsSystem.js';

function logWork(msg) {
  const el = document.getElementById('workLog');
  if (el) el.innerText = msg;
}

// 工作系统配置
const OFFICE_CONFIG = {
  workDayDuration: 480, // 8小时工作日
  baseSalary: 380,
  kpiBonus: 1.5, // 每1% KPI = ¥1.5
  minEnergy: 25,

  // 工作动作配置
  actions: {
    workHard: {
      timeCost: 90,
      kpiGain: 35,
      energyCost: 20,
      hungerCost: 15,
      immunityDebuff: 5, // 降低抵抗力
      message: '埋头苦干完成汇报，KPI +35%，但体力消耗巨大'
    },
    workSlack: {
      timeCost: 60,
      energyGain: 10,
      sanityGain: 15,
      catchRisk: 0.25, // 25%被抓包风险
      hrPenalty: -50,
      message: '在茶水间摸鱼放松了心情，但有风险被HR发现'
    },
    sanitize: {
      timeCost: 5,
      infectionReduction: 0.8, // 降低80%感染风险
      message: '用酒精消毒工位并紧密调整N95鼻夹，本班次感染风险大幅降低'
    }
  },

  // 同事感染事件
  colleagueInfection: {
    baseChance: 0.35,
    symptoms: [
      '隔壁工位小李突然剧烈咳嗽，面色潮红！',
      '对面的产品经理一直在擦汗，看起来很虚弱...',
      '前排的设计师说头很痛，状态很差'
    ],
    choices: [
      {
        id: 'report',
        label: '🚨 主动举报申请全组居家',
        effect: 'reportToHR',
        description: '立即上报HR，触发全组核酸排查'
      },
      {
        id: 'help',
        label: '💊 借他一颗布洛芬',
        effect: 'lendMedicine',
        description: '消耗1颗药，提升同事好感，但自己可能被传染'
      },
      {
        id: 'ignore',
        label: '👀 装作没看见硬撑',
        effect: 'ignoreRisk',
        description: '继续工作到下班，但感染风险极高'
      }
    ]
  }
};

/**
 * 开始办公室工作
 */
export function startOfficeWork(transportMode, transportCost, travelTime, baseInfectionRisk) {
  const modal = document.getElementById('modalCommute');
  if (modal) modal.classList.add('hidden');

  // 检查资格
  if (gameState.money < transportCost) {
    showToast(`车费不足 ¥${transportCost}！`, 'error');
    return;
  }

  if (gameState.energy < OFFICE_CONFIG.minEnergy) {
    showToast('精力不足，无法支撑一整天高强度工作！先回家休息吧。', 'error');
    return;
  }

  if (gameState.isPositiveKnown) {
    showToast('健康码红码状态，无法进入园区！', 'error');
    return;
  }

  // 扣除车费和通勤时间
  gameState.money -= transportCost;
  advanceTime(travelTime);

  // 通勤感染风险
  let finalRisk = baseInfectionRisk;
  if (gameState.hasMaskOn) {
    finalRisk *= 0.25; // 戴口罩降低75%
  }

  if (Math.random() < finalRisk) {
    gameState.viralLoad = Math.min(100, gameState.viralLoad + 40);
    showToast(`搭乘【${transportMode}】时人流拥挤，可能吸入了气溶胶...`, 'error');
  }

  // 初始化工作状态
  initWorkShift();

  // 打开工作界面
  openOfficeModal();
}

/**
 * 初始化班次状态
 */
function initWorkShift() {
  gameState.workShift = {
    active: true,
    kpi: 0,
    sanitized: false,
    elapsedMinutes: 0,
    totalMinutes: OFFICE_CONFIG.workDayDuration,
    baseSalary: OFFICE_CONFIG.baseSalary,
    bonusSalary: 0,
    colleagueInfected: Math.random() < OFFICE_CONFIG.colleagueInfection.baseChance,
    colleagueEventTriggered: false,
    hrCaughtCount: 0
  };
}

/**
 * 打开办公室界面
 */
function openOfficeModal() {
  const modal = document.getElementById('modalOfficeWork');
  if (!modal) return;

  modal.classList.remove('hidden');
  updateOfficeUI();

  // 更新事件横幅
  updateEventBanner();
}

/**
 * 更新事件横幅
 */
function updateEventBanner() {
  const banner = document.getElementById('officeEventDesc');
  const icon = document.getElementById('officeEventIcon');

  if (!banner || !icon) return;

  if (gameState.workShift.colleagueInfected && !gameState.workShift.colleagueEventTriggered) {
    icon.innerText = '😷';
    const symptom = OFFICE_CONFIG.colleagueInfection.symptoms[
      Math.floor(Math.random() * OFFICE_CONFIG.colleagueInfection.symptoms.length)
    ];
    banner.innerHTML = `<span class="text-rose-400 font-bold">${symptom}</span> 若不采取措施，感染风险将快速上升！`;
  } else if (gameState.lockdownLevel >= 2) {
    icon.innerText = '⚠️';
    banner.innerText = '园区已启动疫情防控，HR在走廊巡视口罩佩戴情况，请谨慎行事。';
  } else {
    icon.innerText = '💼';
    banner.innerText = '今天工作节奏正常，你可以努力拼KPI赚绩效，也可以适度摸鱼保持体力。';
  }
}

/**
 * 更新办公室UI
 */
function updateOfficeUI() {
  const kpiDisplay = document.getElementById('workShiftKpi');
  const clockText = document.getElementById('workClockText');
  const salaryEstimate = document.getElementById('txtEstimatedSalary');

  if (kpiDisplay) {
    kpiDisplay.innerText = `KPI: ${gameState.workShift.kpi}%`;
  }

  if (clockText) {
    const hoursWorked = Math.floor(gameState.workShift.elapsedMinutes / 60);
    const minutesWorked = gameState.workShift.elapsedMinutes % 60;
    clockText.innerText = `已工作: ${hoursWorked}h ${minutesWorked}m / 8h`;
  }

  if (salaryEstimate) {
    const estimatedBonus = Math.floor(gameState.workShift.kpi * OFFICE_CONFIG.kpiBonus);
    const totalEstimate = gameState.workShift.baseSalary + estimatedBonus;
    salaryEstimate.innerText = `预估收入: ¥${totalEstimate}`;
  }
}

/**
 * 埋头苦干
 */
export function workHard() {
  const config = OFFICE_CONFIG.actions.workHard;

  if (gameState.energy < config.energyCost) {
    showToast('体力不支，无法继续高强度工作！', 'error');
    return;
  }

  gameState.energy = Math.max(0, gameState.energy - config.energyCost);
  gameState.hunger = Math.max(0, gameState.hunger - config.hungerCost);
  gameState.workShift.kpi = Math.min(100, gameState.workShift.kpi + config.kpiGain);
  gameState.workShift.elapsedMinutes += config.timeCost;

  // 降低免疫力（增加病毒载量易感性）
  if (gameState.viralLoad > 0) {
    gameState.viralLoad = Math.min(100, gameState.viralLoad + config.immunityDebuff);
  }

  audio.playTone(600, 0.1, 'square', 0.08);
  logWork(config.message);
  showToast(config.message, 'info');

  if (window.player) {
    spawnFloatingText(`KPI +${config.kpiGain}%`, window.player.x, window.player.y - 70, '#facc15');
  }

  advanceTime(config.timeCost);
  updateOfficeUI();
  updateHUD();

  // 检查是否触发同事事件
  checkColleagueEvent();
}

/**
 * 带薪摸鱼
 */
export function workSlack() {
  const config = OFFICE_CONFIG.actions.workSlack;

  gameState.sanity = Math.min(100, gameState.sanity + config.sanityGain);
  gameState.energy = Math.min(100, gameState.energy + config.energyGain);
  gameState.workShift.elapsedMinutes += config.timeCost;

  // HR抓包检测
  if (Math.random() < config.catchRisk) {
    gameState.money += config.hrPenalty;
    gameState.workShift.hrCaughtCount++;
    audio.playWarning();
    showToast('😱 被HR发现摸鱼！当场罚款 ¥50，绩效扣除！', 'error');

    if (window.player) {
      spawnFloatingText(`-¥50 摸鱼罚款`, window.player.x, window.player.y - 70, '#ef4444');
    }
  } else {
    audio.playSip();
    showToast(config.message, 'success');

    if (window.player) {
      spawnFloatingText(`心境 +${config.sanityGain}%`, window.player.x, window.player.y - 70, '#38bdf8');
    }
  }

  advanceTime(config.timeCost);
  updateOfficeUI();
  updateHUD();
}

/**
 * 消毒工位
 */
export function sanitizeWorkspace() {
  const config = OFFICE_CONFIG.actions.sanitize;

  gameState.workShift.sanitized = true;
  gameState.workShift.elapsedMinutes += config.timeCost;

  audio.playTone(750, 0.15, 'triangle', 0.1);
  showToast(config.message, 'success');

  if (window.player) {
    spawnFloatingText('工位防护强化', window.player.x, window.player.y - 70, '#34d399');
  }

  advanceTime(config.timeCost);
  updateOfficeUI();
}

/**
 * 检查是否触发同事感染事件
 */
function checkColleagueEvent() {
  if (!gameState.workShift.colleagueInfected) return;
  if (gameState.workShift.colleagueEventTriggered) return;
  if (gameState.workShift.kpi < 50) return; // 工作到一半才触发

  // 触发事件选择
  gameState.workShift.colleagueEventTriggered = true;
  showColleagueInfectionChoice();
}

/**
 * 显示同事感染选择
 */
function showColleagueInfectionChoice() {
  const modal = document.getElementById('modalColleagueChoice');
  if (!modal) {
    // 如果模态框不存在，使用简化提示
    showToast('⚠️ 同事出现发热症状！你决定装作没看见继续工作...', 'error');
    handleColleagueChoice('ignore');
    return;
  }

  modal.classList.remove('hidden');
  updateEventBanner();
}

/**
 * 处理同事感染选择
 */
export function handleColleagueChoice(choiceId) {
  const modal = document.getElementById('modalColleagueChoice');
  if (modal) modal.classList.add('hidden');

  switch (choiceId) {
    case 'report':
      handleReportToHR();
      break;
    case 'help':
      handleLendMedicine();
      break;
    case 'ignore':
      handleIgnoreRisk();
      break;
  }
}

/**
 * 上报HR
 */
function handleReportToHR() {
  audio.playWarning();
  showToast('🚨 你上报了同事的异常，HR立即安排全组核酸排查！', 'info');

  // 触发核酸检测
  setTimeout(() => {
    if (gameState.viralLoad >= 50 || gameState.bodyTemp >= 38.0) {
      gameState.isPositiveKnown = true;
      gameState.quarantineDaysLeft = 4;
      showToast('核酸结果：你也被检出阳性！立即被遣返居家隔离4天！', 'error');

      if (window.player) {
        window.player.x = 220; // 传送回家
      }

      closeOfficeModal();
    } else {
      showToast('核酸结果：全组阴性，虚惊一场。同事被送去隔离。', 'success');
      // 继续工作
    }
  }, 2000);
}

/**
 * 借药
 */
function handleLendMedicine() {
  if (gameState.pillsCount < 1) {
    showToast('你没有多余的退烧药可以借！', 'error');
    handleIgnoreRisk(); // 退化为忽略
    return;
  }

  gameState.pillsCount -= 1;
  gameState.reputation += 5; // 增加声望

  audio.playCash();
  showToast('💊 你借给同事一颗布洛芬，他感激不已。声望 +5', 'success');

  // 但是有接触感染风险
  if (!gameState.hasMaskOn || Math.random() < 0.3) {
    gameState.viralLoad = Math.min(100, gameState.viralLoad + 30);
    showToast('但在递药时距离过近，你可能被传染了...', 'error');
  }

  updateHUD();
}

/**
 * 忽略风险
 */
function handleIgnoreRisk() {
  showToast('👀 你装作没看见，继续埋头工作...', 'info');

  // 计算感染风险
  let infectionRisk = 0.6;
  if (gameState.hasMaskOn) infectionRisk *= 0.3;
  if (gameState.workShift.sanitized) infectionRisk *= 0.2;

  if (Math.random() < infectionRisk) {
    gameState.viralLoad = 75;
    gameState.bodyTemp = 38.6;
    showToast('⚠️ 在工位上坐了一整天，吸入大量同事的飞沫气溶胶！', 'error');
  }
}

/**
 * 打卡下班
 */
export function finishWorkDay() {
  const modal = document.getElementById('modalOfficeWork');
  if (modal) modal.classList.add('hidden');

  gameState.workShift.active = false;
  gameState.hasWorkedToday = true;
  import('./dayLoopSystem.js').then((m) => m.markDuty('work'));

  // 计算剩余时间并推进
  const remainingTime = OFFICE_CONFIG.workDayDuration - gameState.workShift.elapsedMinutes;
  if (remainingTime > 0) {
    advanceTime(remainingTime);
  }

  // 最终感染检查
  if (gameState.workShift.colleagueInfected && !gameState.workShift.colleagueEventTriggered) {
    let risk = 0.7;
    if (gameState.hasMaskOn) risk *= 0.25;
    if (gameState.workShift.sanitized) risk *= 0.15;

    if (Math.random() < risk) {
      gameState.viralLoad = 70;
      gameState.bodyTemp = 38.8;
      gameState.isPositiveKnown = true;
      gameState.quarantineDaysLeft = 4;

      audio.playWarning();
      showToast('🚨 下班时HR通知：你是密接！立即居家隔离4天！', 'error');

      if (window.player) {
        window.player.x = 220;
      }
      updateHUD();
      return;
    }
  }

  // 结算工资
  const kpiBonus = Math.floor(gameState.workShift.kpi * OFFICE_CONFIG.kpiBonus);
  const penaltyTotal = gameState.workShift.hrCaughtCount * 50;
  const dress = gameState.outfit?.shirt === 'shirt_white' ? 40 : 0;
  const mul = salaryMultiplier();
  const totalEarnings = Math.max(0, Math.floor((gameState.workShift.baseSalary + kpiBonus - penaltyTotal + dress) * mul));

  gameState.money += totalEarnings;

  audio.playCash();
  showToast(`✅ 打卡下班！今日收入 ¥${totalEarnings} (底薪 ¥${gameState.workShift.baseSalary} + 绩效 ¥${kpiBonus} - 罚款 ¥${penaltyTotal})`, 'success');

  if (window.player) {
    spawnFloatingText(`+¥${totalEarnings}`, window.player.x, window.player.y - 70, '#10b981');
  }

  updateHUD();
}

/**
 * 关闭办公室界面
 */
function closeOfficeModal() {
  const modal = document.getElementById('modalOfficeWork');
  if (modal) modal.classList.add('hidden');
}

export function workMail() {
  if (!gameState.workShift?.active) return;
  gameState.workShift.kpi = Math.min(100, gameState.workShift.kpi + 12);
  gameState.workShift.elapsedMinutes += 40;
  gameState.energy = Math.max(0, gameState.energy - 6);
  applyStatEvent('work');
  advanceTime(40);
  const spam = Math.random() < 0.35;
  logWork(spam ? '邮件链里有人把你加进一个没意义的群。KPI 还是涨了一点。' : '你把三条催更回掉。日历上又多了一个会。');
  showToast(spam ? '无意义群聊 +1。KPI +12。' : '邮件清完。KPI +12。', 'info');
  updateOfficeUI();
  updateHUD();
}

export function workLunch() {
  if (!gameState.workShift?.active) return;
  if (gameState.instantFood > 0) {
    gameState.instantFood -= 1;
    gameState.hunger = Math.min(100, gameState.hunger + 28);
    logWork('工位上掀开便当。隔壁说好香。你把口罩拉下来两分钟。');
  } else if (gameState.money >= 25) {
    gameState.money -= 25;
    gameState.hunger = Math.min(100, gameState.hunger + 22);
    logWork('点了外卖。骑手在大堂等你下楼扫场所码。');
  } else {
    showToast('没饭也没钱。你喝了一下午水。', 'error');
    return;
  }
  gameState.workShift.elapsedMinutes += 30;
  advanceTime(30);
  updateOfficeUI();
  updateHUD();
}

export function workOvertime() {
  if (!gameState.workShift?.active) return;
  gameState.workShift.kpi = Math.min(100, gameState.workShift.kpi + 18);
  gameState.workShift.elapsedMinutes += 90;
  gameState.energy = Math.max(0, gameState.energy - 16);
  gameState.sanity = Math.max(0, gameState.sanity - 8);
  gameState.workShift.baseSalary += 60;
  applyStatEvent('work');
  advanceTime(90);
  logWork('灯一盏盏灭了。你还在改 PPT 页脚。加班费记在底薪上。');
  showToast('加班 90 分钟。KPI +18，底薪 +60。', 'info');
  updateOfficeUI();
  updateHUD();
}
