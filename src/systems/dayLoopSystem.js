import { gameState } from '../data/gameState.js';
import { showToast } from '../ui/toast.js';
import { addNeed, addMoodlet, think } from './simsLifeSystem.js';
import { flagQuest } from './questSystem.js';

function stamp() {
  return gameState.day * 24 + gameState.hour;
}

export function initDayLoop() {
  if (!gameState.dayLoop) {
    gameState.dayLoop = {
      lastPcr: stamp(),
      outingsLeft: 3,
      outingsMax: 3,
      duties: [],
      failed: [],
      greetT: 0
    };
  }
  const d = gameState.dayLoop;
  if (!d.duties) d.duties = [];
  if (d.outingsLeft == null) d.outingsLeft = 3;
  if (d.lastPcr == null) d.lastPcr = stamp();
  if (!d.duties.length) rollDuties();
}

export function outingCap() {
  if (gameState.isPositiveKnown) return 0;
  if (gameState.lockdownLevel >= 3) return 1;
  if (gameState.lockdownLevel >= 2) return 2;
  return 3;
}

export function getHealthCode() {
  if (gameState.isPositiveKnown) return 'red';
  const age = stamp() - (gameState.dayLoop?.lastPcr ?? stamp());
  if (age > 72) return 'yellow';
  if (age > 48) return 'yellow';
  if (gameState.bodyTemp >= 38.2) return 'yellow';
  return 'green';
}

export function codeLabel() {
  const c = getHealthCode();
  if (c === 'red') return `🔴 红码隔离 (${gameState.quarantineDaysLeft || 0}天)`;
  if (c === 'yellow') return '🟡 黄码（核酸过期/发热）';
  return '🟢 48h绿码';
}

export function rollDuties() {
  initDayLoop();
  const list = [
    { id: 'pcr', title: '做核酸', hint: '小区亭或医院', failHour: 21 },
    { id: 'eat', title: '吃一顿热的', hint: '家里煮或外面买', failHour: 22 }
  ];
  const weekend = gameState.day % 7 === 0 || gameState.day % 7 === 6;
  if (gameState.isPositiveKnown) {
    list.push({ id: 'isolate', title: '居家别出门', hint: '红码只许在家', failHour: 23 });
  } else if (weekend || gameState.lockdownLevel >= 3) {
    list.push({ id: 'cat', title: '照顾阿花', hint: '喂食 + 铲砂', failHour: 22 });
  } else {
    list.push({ id: 'work', title: '去上班打卡', hint: '写字楼 12F 工位', failHour: 18 });
  }
  gameState.dayLoop.duties = list.map((x) => ({ ...x, done: false, failed: false }));
  gameState.dayLoop.failed = [];
  gameState.dayLoop.outingsMax = outingCap();
  gameState.dayLoop.outingsLeft = gameState.dayLoop.outingsMax;
}

export function markDuty(id) {
  initDayLoop();
  const d = gameState.dayLoop.duties.find((x) => x.id === id);
  if (!d || d.done) return;
  d.done = true;
  think(`今日：${d.title} · 勾了。`);
}

export function getDuties() {
  initDayLoop();
  return gameState.dayLoop.duties || [];
}

export function canTravelTo(mapId) {
  initDayLoop();
  const from = gameState.mapId || 'living';
  const code = getHealthCode();
  if (from === mapId) return true;

  if (code === 'red') {
    const feverHospital = mapId === 'hospital' && gameState.bodyTemp >= 37.8;
    if (mapId !== 'home' && !feverHospital) {
      showToast('红码。网格员让你回家。医院只接收发热。', 'error');
      think('健康码红得发亮。');
      return false;
    }
  }

  if (code === 'yellow') {
    const blocked = ['office', 'cbd', 'club', 'redlight', 'mall', 'ktv', 'hotel', 'parlorIn', 'lobby'];
    if (blocked.includes(mapId)) {
      showToast('黄码。写字楼和商场闸机拒识。先做核酸。', 'error');
      return false;
    }
  }

  if (from === 'home' && mapId !== 'home') {
    if (gameState.dayLoop.outingsLeft <= 0) {
      showToast(gameState.isPositiveKnown ? '隔离令：今天不能下楼。' : '今天出门次数用完了。网格员在单元门口。', 'error');
      think('门缝里有人说话。');
      return false;
    }
  }
  return true;
}

export function onLeftHome() {
  initDayLoop();
  if (gameState.dayLoop.outingsLeft > 0) gameState.dayLoop.outingsLeft -= 1;
  const isolate = gameState.dayLoop.duties.find((x) => x.id === 'isolate');
  if (isolate && !isolate.done) {
    isolate.failed = true;
    addNeed('sanity', -6);
    showToast('你下楼了。红码还在亮。', 'error');
  }
}

export function onPcrDone(positive) {
  initDayLoop();
  gameState.dayLoop.lastPcr = stamp();
  markDuty('pcr');
  flagQuest('metroScanned');
  if (!positive) addMoodlet('green', '核酸阴性', 6, 12, '🟢');
}

export function tickDayLoopHour() {
  initDayLoop();
  const hour = gameState.hour;
  for (const d of gameState.dayLoop.duties) {
    if (d.done || d.failed) continue;
    if (hour === d.failHour) {
      d.failed = true;
      failDuty(d);
    }
  }
  if (hour === 8 && getHealthCode() === 'yellow') {
    think('码黄了。今天先排核酸。');
  }
}

export function tickDayLoopNewDay() {
  initDayLoop();
  const missed = (gameState.dayLoop.duties || []).filter((d) => !d.done);
  for (const d of missed) {
    if (d.id === 'isolate' && !d.failed) {
      d.done = true;
      continue;
    }
    if (!d.failed) failDuty(d);
  }
  rollDuties();
  think('闹钟。口罩、钥匙、健康码。出门次数有限。');
}

function failDuty(d) {
  if (d.id === 'pcr') {
    gameState.dayLoop.lastPcr = Math.min(gameState.dayLoop.lastPcr, stamp() - 49);
    addNeed('sanity', -8);
    addMoodlet('yellow', '核酸超时', -8, 16, '🟡');
    showToast('今日核酸没做。健康码开始变黄。', 'error');
  } else if (d.id === 'eat') {
    addNeed('hunger', -18);
    addNeed('sanity', -6);
    showToast('一整天没吃热的。胃在抽。', 'error');
  } else if (d.id === 'work') {
    gameState.money = Math.max(0, gameState.money - 80);
    addNeed('sanity', -8);
    showToast('没打卡。HR 系统扣了当日绩效 ¥80。', 'error');
  } else if (d.id === 'cat') {
    addNeed('sanity', -10);
    if (gameState.home) gameState.home.catHunger = Math.min(100, gameState.home.catHunger + 20);
    showToast('阿花一天没被理。它在防盗门后面抓。', 'error');
  } else if (d.id === 'isolate') {
    addNeed('sanity', -4);
  }
}

export function tickGreet(delta) {
  if (!gameState.dayLoop) return;
  if (gameState.dayLoop.greetT > 0) gameState.dayLoop.greetT = Math.max(0, gameState.dayLoop.greetT - delta);
}
