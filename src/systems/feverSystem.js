/**
 * 发热病程系统 - 真实的三阶段生理模拟
 * 科学还原新冠感染的临床病程
 */

import { gameState } from '../data/gameState.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';

// 病程阶段定义
export const FEVER_STAGES = {
  HEALTHY: {
    id: 'healthy',
    name: '健康',
    tempRange: [36.0, 37.0],
    viralRange: [0, 20],
    symptoms: [],
    effects: {}
  },
  INCUBATION: {
    id: 'incubation',
    name: '潜伏期',
    tempRange: [37.1, 37.8],
    viralRange: [21, 40],
    symptoms: ['咽干发痒', '轻微乏力', '偶尔干咳'],
    effects: {
      energyDecayRate: 1.2, // 精力消耗加速
      hungerDecayRate: 1.15,
      actionSlowdown: 0.95 // 动作速度降低5%
    }
  },
  HIGH_FEVER: {
    id: 'highFever',
    name: '高热寒颤期',
    tempRange: [38.0, 39.8],
    viralRange: [41, 80],
    symptoms: ['剧烈头痛', '全身酸痛', '畏寒发热', '心跳加速'],
    effects: {
      energyDecayRate: 2.5,
      hungerDecayRate: 1.8,
      actionSlowdown: 0.6, // 动作速度降低40%
      visionBlur: true, // 视觉模糊效果
      mandatoryRest: true // 强制需要休息
    }
  },
  RECOVERY: {
    id: 'recovery',
    name: '水泥鼻刀片嗓期',
    tempRange: [36.8, 37.5],
    viralRange: [15, 35],
    symptoms: ['鼻塞严重', '咽喉剧痛', '味觉丧失', '食欲不振'],
    effects: {
      hungerDecayRate: 2.0, // 食欲下降，饥饿加速
      foodEfficiency: 0.6, // 进食效果降低40%
      voiceLoss: true // 无法正常社交
    }
  }
};

// 药物系统
export const MEDICATION = {
  IBUPROFEN: {
    id: 'ibuprofen',
    name: '布洛芬缓释胶囊',
    cooldown: 360, // 6小时冷却（分钟）
    effects: {
      tempReduction: 1.2, // 降温1.2°C
      duration: 240, // 持续4小时
      painRelief: 0.8,
      sideEffects: {
        stomachDiscomfort: 0.15 // 15%概率胃部不适
      }
    },
    warnings: [
      '需间隔6小时以上服用',
      '连续服用超过3次会增加肝损伤风险',
      '空腹服用可能引起胃部不适'
    ]
  },
  LIANHUA: {
    id: 'lianhua',
    name: '连花清瘟胶囊',
    cooldown: 480, // 8小时
    effects: {
      viralReduction: 10,
      symptomRelief: 0.3,
      immuneBoost: 5
    }
  }
};

/**
 * 获取当前病程阶段
 */
export function getCurrentFeverStage() {
  const temp = gameState.bodyTemp;
  const viral = gameState.viralLoad;

  for (const stage of Object.values(FEVER_STAGES)) {
    const [minTemp, maxTemp] = stage.tempRange;
    const [minViral, maxViral] = stage.viralRange;

    if (temp >= minTemp && temp <= maxTemp && viral >= minViral && viral <= maxViral) {
      return stage;
    }
  }

  // 极重症
  if (temp > 39.8 || viral > 80) {
    return {
      id: 'critical',
      name: '危重症',
      symptoms: ['高热不退', '呼吸困难', '意识模糊'],
      effects: {
        energyDecayRate: 5.0,
        actionSlowdown: 0.3,
        criticalWarning: true
      }
    };
  }

  return FEVER_STAGES.HEALTHY;
}

/**
 * 更新病程效果
 */
export function updateFeverEffects(delta) {
  const stage = getCurrentFeverStage();

  if (!stage.effects) return;

  // 应用效果
  if (stage.effects.energyDecayRate) {
    const extraDecay = (stage.effects.energyDecayRate - 1.0) * delta * 0.5;
    gameState.energy = Math.max(0, gameState.energy - extraDecay);
  }

  if (stage.effects.hungerDecayRate) {
    const extraHunger = (stage.effects.hungerDecayRate - 1.0) * delta * 0.3;
    gameState.hunger = Math.max(0, gameState.hunger - extraHunger);
  }

  // 危重症警告
  if (stage.effects.criticalWarning && Math.random() < 0.001) {
    audio.playWarning();
    showToast('⚠️ 危重症！高热不退，需要立即服药并卧床休息！', 'error');
  }

  // 强制休息检查
  if (stage.effects.mandatoryRest && gameState.energy < 20) {
    if (Math.random() < 0.005) {
      showToast('💤 体力耗尽，身体强制进入虚脱状态...', 'error');
      // 可以触发强制休息事件
    }
  }
}

/**
 * 服用布洛芬
 */
export function takeMedication(medicationType = 'ibuprofen') {
  const med = MEDICATION[medicationType.toUpperCase()];
  if (!med) return false;

  // 检查库存
  if (gameState.pillsCount < 1) {
    showToast('没有退烧药了！需要去药店购买或在互助群中交换。', 'error');
    return false;
  }

  // 检查冷却时间
  if (gameState.pillCooldownMinutes > 0) {
    const hoursLeft = Math.ceil(gameState.pillCooldownMinutes / 60);
    showToast(`⚠️ 药物冷却中！还需等待 ${hoursLeft} 小时才能再次服用（避免肝损伤）`, 'error');
    audio.playWarning();
    return false;
  }

  // 检查连续服药次数
  if (!gameState.medicationHistory) {
    gameState.medicationHistory = {
      consecutiveDoses: 0,
      lastDoseDay: 0
    };
  }

  if (gameState.day !== gameState.medicationHistory.lastDoseDay) {
    gameState.medicationHistory.consecutiveDoses = 0;
  }

  // 消耗药品
  gameState.pillsCount -= 1;
  gameState.pillCooldownMinutes = med.cooldown;
  gameState.medicationHistory.consecutiveDoses += 1;
  gameState.medicationHistory.lastDoseDay = gameState.day;

  // 应用药效
  if (med.effects.tempReduction) {
    const reduction = med.effects.tempReduction;
    gameState.bodyTemp = Math.max(36.3, gameState.bodyTemp - reduction);

    audio.playSip();
    showToast(`💊 服用${med.name}，体温下降 ${reduction}°C，药效将持续 ${med.effects.duration / 60} 小时`, 'success');

    if (window.player) {
      spawnFloatingText(`体温 -${reduction}°C`, window.player.x, window.player.y - 70, '#34d399');
    }
  }

  // 副作用检查
  if (med.effects.sideEffects) {
    if (med.effects.sideEffects.stomachDiscomfort && Math.random() < med.effects.sideEffects.stomachDiscomfort) {
      if (gameState.hunger < 30) {
        showToast('⚠️ 空腹服药导致胃部不适...', 'error');
        gameState.sanity = Math.max(0, gameState.sanity - 10);
      }
    }
  }

  // 过量服药警告
  if (gameState.medicationHistory.consecutiveDoses >= 3) {
    audio.playWarning();
    showToast('⚠️ 警告：连续服用退烧药超过3次！肝脏负担加重，请注意休息！', 'error');
    gameState.energy = Math.max(0, gameState.energy - 15);
  }

  updateHUD();
  return true;
}

/**
 * 食用流质食物（病中恢复）
 */
export function eatLiquidFood() {
  const stage = getCurrentFeverStage();

  if (stage.id === 'recovery' && stage.effects.foodEfficiency) {
    return stage.effects.foodEfficiency;
  }

  return 1.0;
}

/**
 * 获取病程描述
 */
export function getFeverDescription() {
  const stage = getCurrentFeverStage();

  if (stage.id === 'healthy') {
    return {
      title: '✅ 身体健康',
      description: '体温正常，精神状态良好',
      color: 'emerald'
    };
  }

  return {
    title: `🌡️ ${stage.name}`,
    description: stage.symptoms.join('、'),
    color: stage.id === 'highFever' || stage.id === 'critical' ? 'rose' : 'amber',
    symptoms: stage.symptoms
  };
}

/**
 * 显示病程详情
 */
export function showFeverDetails() {
  const stage = getCurrentFeverStage();
  const desc = getFeverDescription();

  let message = `【${desc.title}】\n`;
  message += `体温: ${gameState.bodyTemp.toFixed(1)}°C\n`;
  message += `病毒载量: ${gameState.viralLoad}\n`;

  if (stage.symptoms && stage.symptoms.length > 0) {
    message += `症状: ${stage.symptoms.join('、')}\n`;
  }

  if (gameState.pillCooldownMinutes > 0) {
    const hours = Math.floor(gameState.pillCooldownMinutes / 60);
    const minutes = gameState.pillCooldownMinutes % 60;
    message += `\n药物冷却: ${hours}h ${minutes}m`;
  }

  showToast(message, stage.id === 'highFever' ? 'error' : 'info');
}

/**
 * 检查是否需要强制隔离
 */
export function checkMandatoryQuarantine() {
  if (gameState.bodyTemp >= 38.5 && !gameState.isPositiveKnown) {
    // 高热状态下尝试出门会被拦截
    if (Math.random() < 0.6) {
      gameState.isPositiveKnown = true;
      gameState.quarantineDaysLeft = 4;
      audio.playWarning();
      showToast('🚨 高热被门禁测温仪检测到！健康码变红，强制居家隔离4天！', 'error');
      return true;
    }
  }
  return false;
}

/**
 * 病程自然进展
 */
export function progressFeverNaturally(hours) {
  // 病毒载量自然增长/衰减
  if (gameState.viralLoad > 0) {
    if (gameState.viralLoad < 40) {
      // 潜伏期：缓慢增长
      gameState.viralLoad += hours * 0.5;
    } else if (gameState.viralLoad < 70) {
      // 高峰期：快速增长
      gameState.viralLoad += hours * 1.2;
      gameState.bodyTemp = Math.min(39.8, gameState.bodyTemp + hours * 0.05);
    } else {
      // 峰值后：缓慢衰减（如果有药物治疗）
      if (gameState.medicationHistory && gameState.medicationHistory.consecutiveDoses > 0) {
        gameState.viralLoad = Math.max(0, gameState.viralLoad - hours * 0.8);
        gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - hours * 0.03);
      }
    }
  }

  // 体温自然调节
  if (gameState.bodyTemp > 37.0 && gameState.viralLoad < 20) {
    gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - hours * 0.1);
  }
}

/**
 * 初始化病程系统
 */
export function initFeverSystem() {
  if (!gameState.medicationHistory) {
    gameState.medicationHistory = {
      consecutiveDoses: 0,
      lastDoseDay: 0,
      totalDosesTaken: 0
    };
  }

  if (!gameState.feverStageHistory) {
    gameState.feverStageHistory = {
      currentStage: 'healthy',
      stageChangedAt: { day: 1, hour: 7 }
    };
  }
}
