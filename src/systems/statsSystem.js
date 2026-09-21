import { gameState } from '../data/gameState.js';

const SKILL_KEYS = ['cooking', 'fitness', 'charisma', 'massage', 'office', 'streetwise'];
const SKILL_LABEL = {
  cooking: '烹饪',
  fitness: '体能',
  charisma: '交际',
  massage: '手法',
  office: '职场',
  streetwise: '市井'
};

export function initStats() {
  if (!gameState.stats) {
    gameState.stats = {
      kcal: 1650,
      sleepDebtH: 1.2,
      cortisol: 28,
      immune: 72,
      inflammation: 8,
      hydration: 70,
      socialBattery: 64,
      riskTolerance: 40,
      skills: { cooking: 1.2, fitness: 1.0, charisma: 1.1, massage: 1.0, office: 1.4, streetwise: 1.3 },
      xp: { cooking: 0, fitness: 0, charisma: 0, massage: 0, office: 0, streetwise: 0 }
    };
  }
}

export function skillLabel(k) {
  return SKILL_LABEL[k] || k;
}

export function addSkillXp(key, amount) {
  const s = gameState.stats;
  if (!s?.xp) return;
  s.xp[key] = (s.xp[key] || 0) + amount;
  const need = 40 + (s.skills[key] || 1) * 35;
  if (s.xp[key] >= need) {
    s.xp[key] -= need;
    s.skills[key] = Math.min(10, +(s.skills[key] + 0.2).toFixed(1));
  }
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function tickStatsHour() {
  const s = gameState.stats;
  if (!s) return;
  const moving = 1;
  s.kcal = clamp(s.kcal - (95 + moving * 20) + (gameState.hunger < 30 ? -40 : 0), 900, 2800);
  s.hydration = clamp(s.hydration - 4.5, 0, 100);
  s.sleepDebtH = clamp(s.sleepDebtH + (gameState.energy < 40 ? 0.35 : 0.08), 0, 18);
  s.cortisol = clamp(s.cortisol + (gameState.lockdownLevel - 1) * 1.2 + (gameState.sanity < 40 ? 3 : -0.4), 5, 95);
  s.inflammation = clamp(s.inflammation + (gameState.bodyTemp - 36.6) * 2 + (s.sleepDebtH > 6 ? 1.2 : -0.2), 0, 80);
  s.immune = clamp(100 - s.inflammation * 0.7 - s.sleepDebtH * 2.4 - (gameState.hasMaskOn ? 0 : 4), 5, 100);
  s.socialBattery = clamp(s.socialBattery - 2.2 + (gameState.sims?.social > 60 ? 1 : 0), 0, 100);

  if (s.kcal < 1200) {
    gameState.energy = Math.max(0, gameState.energy - 2);
    gameState.sanity = Math.max(0, gameState.sanity - 1);
  }
  if (s.hydration < 25) gameState.energy = Math.max(0, gameState.energy - 2);
  if (s.cortisol > 70) gameState.sanity = Math.max(0, gameState.sanity - 3);
  if (s.immune < 35 && Math.random() < 0.12) {
    gameState.viralLoad = Math.min(100, gameState.viralLoad + 3);
    gameState.bodyTemp = Math.min(39.8, gameState.bodyTemp + 0.05);
  }
}

export function applyStatEvent(type) {
  const s = gameState.stats;
  if (!s) return;
  if (type === 'eat') {
    s.kcal = clamp(s.kcal + 520, 900, 2800);
    s.hydration = clamp(s.hydration + 8, 0, 100);
    addSkillXp('cooking', 8);
  }
  if (type === 'sleep') {
    s.sleepDebtH = clamp(s.sleepDebtH - 3.2, 0, 18);
    s.cortisol = clamp(s.cortisol - 8, 5, 95);
    s.inflammation = clamp(s.inflammation - 2, 0, 80);
  }
  if (type === 'shower') s.inflammation = clamp(s.inflammation - 1, 0, 80);
  if (type === 'work') {
    s.cortisol = clamp(s.cortisol + 6, 5, 95);
    s.kcal = clamp(s.kcal - 180, 900, 2800);
    addSkillXp('office', 12);
  }
  if (type === 'social') {
    s.socialBattery = clamp(s.socialBattery - 8, 0, 100);
    s.cortisol = clamp(s.cortisol - 3, 5, 95);
    addSkillXp('charisma', 10);
  }
  if (type === 'massageWork') {
    addSkillXp('massage', 14);
    addSkillXp('fitness', 6);
    s.kcal = clamp(s.kcal - 140, 900, 2800);
  }
  if (type === 'dance') {
    addSkillXp('fitness', 10);
    s.kcal = clamp(s.kcal - 220, 900, 2800);
    s.hydration = clamp(s.hydration - 10, 0, 100);
    s.socialBattery = clamp(s.socialBattery - 6, 0, 100);
  }
  if (type === 'crowd') {
    s.cortisol = clamp(s.cortisol + 5, 5, 95);
    addSkillXp('streetwise', 6);
    if (!gameState.hasMaskOn) s.immune = clamp(s.immune - 4, 5, 100);
  }
}

export function salaryMultiplier() {
  const office = gameState.stats?.skills?.office || 1;
  const cort = gameState.stats?.cortisol || 30;
  const debt = gameState.stats?.sleepDebtH || 0;
  return clamp(0.7 + office * 0.08 - cort * 0.002 - debt * 0.02, 0.55, 1.45);
}

export function getStatsLines() {
  const s = gameState.stats;
  if (!s) return [];
  return [
    `热量 ${Math.round(s.kcal)} kcal`,
    `饮水 ${Math.round(s.hydration)}%`,
    `睡眠债 ${s.sleepDebtH.toFixed(1)}h`,
    `皮质醇 ${Math.round(s.cortisol)}`,
    `免疫 ${Math.round(s.immune)}`,
    `炎症 ${Math.round(s.inflammation)}`,
    ...SKILL_KEYS.map((k) => `${SKILL_LABEL[k]} ${s.skills[k].toFixed(1)}`)
  ];
}
