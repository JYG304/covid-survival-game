import { gameState } from '../data/gameState.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { applyStatEvent } from './statsSystem.js';
import { flagQuest } from './questSystem.js';

export const NEED_KEYS = ['hunger', 'energy', 'hygiene', 'bladder', 'social', 'fun', 'comfort'];

export const NEED_META = {
  hunger: { label: '饥饿', icon: '🍔', color: '#f59e0b' },
  energy: { label: '精力', icon: '⚡', color: '#38bdf8' },
  hygiene: { label: '卫生', icon: '🚿', color: '#22d3ee' },
  bladder: { label: '排泄', icon: '🚽', color: '#94a3b8' },
  social: { label: '社交', icon: '💬', color: '#a78bfa' },
  fun: { label: '娱乐', icon: '🎮', color: '#fb7185' },
  comfort: { label: '舒适', icon: '🛋️', color: '#34d399' }
};

const WANT_POOL = [
  { id: 'eat_hot', text: '想吃一顿热饭', check: (s) => s.hunger < 70, reward: { fun: 6, sanity: 4 } },
  { id: 'shower', text: '想冲个热水澡', check: (s) => s.hygiene < 65, reward: { comfort: 8 } },
  { id: 'chat', text: '想找邻居说说话', check: (s) => s.social < 60, reward: { social: 8, sanity: 5 } },
  { id: 'tv', text: '想窝在沙发上看电视', check: () => true, reward: { fun: 8 } },
  { id: 'cat', text: '想去rua阿花', check: () => true, reward: { fun: 10, social: 4 } },
  { id: 'work', text: '想准时打卡不扣薪', check: (s) => !s.hasWorkedToday && s.hour < 10, reward: { money: 40, sanity: 4 } },
  { id: 'news', text: '想看一眼早间新闻', check: (s) => s.hour < 12, reward: { fun: 4 } },
  { id: 'sleep', text: '眼皮打架，想睡觉', check: (s) => s.energy < 45 || s.hour >= 22, reward: { energy: 8, comfort: 6 } },
  { id: 'clean', text: '地板粘脚，想拖一下', check: () => (gameState.home?.dirt || 0) > 40, reward: { comfort: 8, hygiene: 4 } },
  { id: 'feedcat', text: '阿花的碗空了', check: () => (gameState.home?.catHunger || 0) > 50, reward: { fun: 8, social: 4 } },
  { id: 'toilet', text: '内急，想上厕所', check: (s) => s.bladder < 45, reward: { comfort: 8 } },
  { id: 'trash', text: '垃圾袋要满了', check: () => (gameState.home?.trash || 0) > 55, reward: { hygiene: 6, comfort: 4 } },
  { id: 'litter', text: '砂盆该铲了', check: () => (gameState.home?.litter || 0) > 50, reward: { hygiene: 4 } }
];

export function initSimsLife() {
  if (!gameState.sims) {
    gameState.sims = {
      hygiene: 72,
      bladder: 78,
      social: 55,
      fun: 48,
      comfort: 60,
      moodlets: [],
      wants: [],
      thought: '',
      thoughtUntil: 0,
      lastWantRefreshDay: 0,
      skills: { cooking: 1, fitness: 1, charisma: 1 }
    };
  }
  if (gameState.sims.bladder == null) gameState.sims.bladder = 78;
  refreshWants(true);
  think('新的一天，先活下去。', 4000);
}

export function getNeed(key) {
  if (key === 'hunger') return gameState.hunger;
  if (key === 'energy') return gameState.energy;
  if (key === 'sanity') return gameState.sanity;
  return gameState.sims?.[key] ?? 50;
}

export function setNeed(key, value) {
  const v = Math.max(0, Math.min(100, value));
  if (key === 'hunger') gameState.hunger = v;
  else if (key === 'energy') gameState.energy = v;
  else if (key === 'sanity') gameState.sanity = v;
  else if (gameState.sims) gameState.sims[key] = v;
}

export function addNeed(key, delta) {
  setNeed(key, getNeed(key) + delta);
}

export function getMoodScore() {
  const weights = { hunger: 1.1, energy: 1, hygiene: 0.8, bladder: 0.9, social: 0.9, fun: 1, comfort: 0.7, sanity: 1.2 };
  let sum = 0;
  let w = 0;
  for (const [k, wt] of Object.entries(weights)) {
    sum += getNeed(k) * wt;
    w += wt;
  }
  let mood = sum / w;
  for (const m of gameState.sims?.moodlets || []) mood += m.mood || 0;
  return Math.max(0, Math.min(100, mood));
}

export function getPlumbobColor() {
  const mood = getMoodScore();
  if (mood >= 75) return '#4ade80';
  if (mood >= 55) return '#a3e635';
  if (mood >= 40) return '#facc15';
  if (mood >= 25) return '#fb923c';
  return '#f43f5e';
}

export function addMoodlet(id, label, mood, hours, icon = '✨') {
  if (!gameState.sims) return;
  gameState.sims.moodlets = gameState.sims.moodlets.filter((m) => m.id !== id);
  gameState.sims.moodlets.push({
    id,
    label,
    mood,
    icon,
    expiresAt: gameState.day * 24 + gameState.hour + hours
  });
}

export function think(text, ms = 3200) {
  if (!gameState.sims) return;
  gameState.sims.thought = text;
  gameState.sims.thoughtUntil = performance.now() + ms;
}

export function getThought() {
  if (!gameState.sims) return '';
  if (performance.now() > gameState.sims.thoughtUntil) return '';
  return gameState.sims.thought;
}

export function tickSimsHour() {
  if (!gameState.sims) return;
  addNeed('hygiene', -2.2);
  addNeed('bladder', -3.6);
  addNeed('social', -1.6);
  addNeed('fun', -1.8);
  addNeed('comfort', gameState.hour >= 22 || gameState.hour < 6 ? -0.4 : -1.1);

  const now = gameState.day * 24 + gameState.hour;
  gameState.sims.moodlets = gameState.sims.moodlets.filter((m) => m.expiresAt > now);

  if (getNeed('hygiene') < 25) {
    addMoodlet('stinky', '一身消毒水味和汗味', -8, 3, '🤢');
    addNeed('social', -1);
    think('……自己都闻得到。');
  }
  if (getNeed('social') < 20) {
    addMoodlet('lonely', '封控里的孤独', -10, 4, '🥺');
    addNeed('sanity', -2);
    think('群里好安静。');
  }
  if (getNeed('fun') < 18) {
    addMoodlet('bored', '天花板都看腻了', -6, 3, '😑');
  }
  if (getNeed('hunger') < 20) {
    addMoodlet('starving', '胃在抗议', -12, 2, '😩');
    think('好饿……便利店还开吗。');
  }
  if (getNeed('bladder') < 22) {
    addMoodlet('pee', '内急', -10, 2, '🚽');
    addNeed('comfort', -2);
    think('腿在抖。家里马桶就几步。');
  }
  if (getNeed('bladder') < 6) {
    addNeed('hygiene', -8);
    addNeed('comfort', -6);
    if (gameState.home) gameState.home.dirt = Math.min(100, gameState.home.dirt + 12);
    addMoodlet('accident', '没赶上', -16, 6, '💦');
    think('……完了。');
    setNeed('bladder', 18);
  }
  if (getNeed('energy') < 18) {
    addMoodlet('exhausted', '眼皮在打架', -8, 2, '😴');
  }
  if (gameState.hasMaskOn && getNeed('comfort') < 40) {
    addNeed('comfort', -0.4);
  }

  maybeIdleThought();
}

export function onSimsNewDay() {
  refreshWants(true);
  addMoodlet('newday', '新的一天还活着', 6, 6, '🌤️');
  think('闹钟响了。口罩，钥匙，健康码。');
}

function maybeIdleThought() {
  if (Math.random() > 0.28) return;
  const lines = [];
  if (getNeed('hunger') < 40) lines.push('再熬一顿会晕过去。');
  if (getNeed('hygiene') < 40) lines.push('该洗头了。');
  if (getNeed('social') < 40) lines.push('给邻居发条消息？');
  if (gameState.lockdownLevel >= 3) lines.push('窗外的雾炮车又来了。');
  if (gameState.bodyTemp >= 37.5) lines.push('额头好烫……是心理作用吗。');
  if (!lines.length) lines.push('如果解封了，第一件事去吃火锅。');
  think(lines[Math.floor(Math.random() * lines.length)]);
}

export function refreshWants(force = false) {
  if (!gameState.sims) return;
  if (!force && gameState.sims.lastWantRefreshDay === gameState.day) return;
  gameState.sims.lastWantRefreshDay = gameState.day;
  const pool = WANT_POOL.filter((w) => w.check(gameState));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  gameState.sims.wants = shuffled.slice(0, 3).map((w) => ({ ...w, done: false }));
}

export function completeWant(id, playerX = 220, playerY = 400) {
  const want = gameState.sims?.wants?.find((w) => w.id === id && !w.done);
  if (!want) return;
  want.done = true;
  for (const [k, v] of Object.entries(want.reward || {})) {
    if (k === 'money') gameState.money += v;
    else addNeed(k, v);
  }
  addMoodlet('want_' + id, '完成了心愿：' + want.text, 8, 8, '💎');
  spawnFloatingText('心愿达成！', playerX, playerY - 90, '#fde047');
  showToast(`💎 模拟人生心愿达成：${want.text}`, 'success');
}

export function applyLifeAction(type, player) {
  const x = player?.x ?? 220;
  const y = player?.y ?? 400;
  switch (type) {
    case 'sleep':
      applyStatEvent('sleep');
      addNeed('energy', 38);
      addNeed('comfort', 22);
      addNeed('hygiene', -6);
      addNeed('fun', -4);
      addMoodlet('rested', '睡了一觉', 10, 8, '😴');
      completeWant('sleep', x, y);
      think('被子还是暖的。');
      break;
    case 'watchNews':
      addNeed('fun', 10);
      addNeed('social', 3);
      addNeed('comfort', 6);
      completeWant('news', x, y);
      completeWant('tv', x, y);
      think('新闻里又在念通告。');
      break;
    case 'shower':
      applyStatEvent('shower');
      addNeed('hygiene', 55);
      addNeed('comfort', 18);
      addNeed('energy', 6);
      addNeed('sanity', 6);
      addMoodlet('fresh', '刚洗完热水澡', 12, 10, '🚿');
      completeWant('shower', x, y);
      think('蒸汽糊在镜子上，像没那么糟。');
      break;
    case 'cook':
      applyStatEvent('eat');
      flagQuest('ateHot');
      addNeed('hunger', 40);
      addNeed('bladder', -12);
      addNeed('fun', 6);
      addNeed('comfort', 8);
      if (gameState.sims) gameState.sims.skills.cooking = Math.min(10, gameState.sims.skills.cooking + 0.15);
      completeWant('eat_hot', x, y);
      think('热汤进胃，世界安静了一秒。');
      break;
    case 'eatInstant':
      addNeed('hunger', 28);
      addNeed('bladder', -10);
      addNeed('fun', -2);
      addNeed('comfort', 2);
      think('自热便当……也算活着。');
      break;
    case 'petCat':
      addNeed('fun', 22);
      addNeed('social', 12);
      addNeed('sanity', 10);
      addMoodlet('cat', '被阿花治愈了', 14, 10, '🐱');
      completeWant('cat', x, y);
      completeWant('feedcat', x, y);
      think('咕噜咕噜。');
      break;
    case 'clean':
      completeWant('clean', x, y);
      think('垃圾袋满了。');
      break;
    case 'toilet':
      addNeed('bladder', 70);
      addNeed('comfort', 10);
      completeWant('toilet', x, y);
      think('冲水声在空楼里特别响。');
      break;
    case 'social':
      applyStatEvent('social');
      addNeed('social', 20);
      addNeed('fun', 8);
      addNeed('sanity', 6);
      if (gameState.sims) gameState.sims.skills.charisma = Math.min(10, gameState.sims.skills.charisma + 0.12);
      completeWant('chat', x, y);
      break;
    case 'work':
      applyStatEvent('work');
      addNeed('energy', -18);
      addNeed('fun', -10);
      addNeed('social', 8);
      addNeed('hygiene', -6);
      completeWant('work', x, y);
      think('工位隔板后面，又是一天。');
      break;
    case 'buyFood':
      addNeed('fun', 4);
      think('货架空了一半，还是抢到了。');
      break;
  }
}

export function getTimeOfDayPalette() {
  const h = gameState.hour + gameState.minute / 60;
  if (h >= 5 && h < 8) {
    return { sky0: '#1b1430', sky1: '#c45c3e', sky2: '#f0a36b', light: 'rgba(255, 180, 120, 0.16)', indoor: '#3a2a22' };
  }
  if (h >= 8 && h < 16) {
    return { sky0: '#87b6d9', sky1: '#c9dde9', sky2: '#e8f1f4', light: 'rgba(255, 244, 214, 0.10)', indoor: '#4a3b32' };
  }
  if (h >= 16 && h < 19) {
    return { sky0: '#2a1b3d', sky1: '#d4653a', sky2: '#f2b56b', light: 'rgba(255, 140, 70, 0.18)', indoor: '#3d2c26' };
  }
  return { sky0: '#070814', sky1: '#12182c', sky2: '#1c2438', light: 'rgba(80, 140, 220, 0.08)', indoor: '#231c1a' };
}
