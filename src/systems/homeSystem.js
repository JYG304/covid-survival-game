import { gameState } from '../data/gameState.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { addNeed, addMoodlet, think, applyLifeAction } from './simsLifeSystem.js';
import { audio } from '../utils/audio.js';
import { startSleep, quickNap } from './sleepSystem.js';
import { advanceTime } from './timeSystem.js';

export const HOME_UPGRADES = [
  { id: 'mattress', name: '加厚床垫', price: 280, desc: '睡得着。噩梦少一点。' },
  { id: 'curtain', name: '遮光窗帘', price: 120, desc: '喇叭和装修声隔一层。' },
  { id: 'heater', name: '小太阳', price: 180, desc: '潮气涨得慢，冬天没那么刺骨。' },
  { id: 'filter', name: '水龙头滤芯', price: 90, desc: '有水时洗澡更干净。' },
  { id: 'catBowl', name: '陶瓷猫碗', price: 45, desc: '阿花饿得慢一点。' },
  { id: 'router', name: '百兆路由', price: 160, desc: '私活少卡，业主群秒回。' },
  { id: 'bathfan', name: '浴霸/排风扇', price: 150, desc: '洗澡不那么潮。镜面少一层雾。' }
];

function hourStamp() {
  return gameState.day * 24 + gameState.hour;
}

function fx(player, text, color) {
  spawnFloatingText(text, player?.x ?? 220, (player?.y ?? 400) - 70, color);
}

function item(id, name, kind, hours) {
  return { id, name, kind, spoilAt: hourStamp() + hours };
}

export function initHome() {
  if (!gameState.home) {
    gameState.home = {
      dirt: 22,
      damp: 14,
      water: true,
      power: true,
      catHunger: 35,
      catFood: 3,
      clog: 12,
      laundry: 18,
      clothesDirty: false,
      trash: 18,
      litter: 16,
      drying: 0,
      streetShirt: null,
      streetPants: null,
      upgrades: {},
      fridge: [
        item('egg', '鸡蛋', 'raw', 36),
        item('egg2', '鸡蛋', 'raw', 36),
        item('veg', '青菜', 'raw', 28),
        item('noodle', '挂面', 'raw', 72),
        item('bento', '自热便当', 'instant', 96),
        item('bento2', '自热便当', 'instant', 96)
      ]
    };
  }
  const h = gameState.home;
  if (!h.upgrades) h.upgrades = {};
  if (!h.fridge) h.fridge = [];
  if (h.catFood == null) h.catFood = 3;
  if (h.clog == null) h.clog = 12;
  if (h.laundry == null) h.laundry = 18;
  if (h.clothesDirty == null) h.clothesDirty = false;
  if (h.trash == null) h.trash = 18;
  if (h.litter == null) h.litter = 16;
  if (h.drying == null) h.drying = 0;
  syncCountsFromFridge();
}

export function homeHas(id) {
  return !!gameState.home?.upgrades?.[id];
}

export function syncCountsFromFridge() {
  const h = gameState.home;
  if (!h) return;
  const now = hourStamp();
  const fresh = h.fridge.filter((f) => f.spoilAt > now);
  gameState.rawFood = fresh.filter((f) => f.kind === 'raw').length;
  gameState.instantFood = fresh.filter((f) => f.kind === 'instant').length;
}

export function addFridgeItem(kind, name, hours = 36) {
  initHome();
  const id = `${kind}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
  gameState.home.fridge.push(item(id, name, kind, hours));
  syncCountsFromFridge();
}

export function takeFridgeKind(kind) {
  initHome();
  const now = hourStamp();
  const i = gameState.home.fridge.findIndex((f) => f.kind === kind && f.spoilAt > now);
  if (i < 0) return false;
  gameState.home.fridge.splice(i, 1);
  syncCountsFromFridge();
  return true;
}

export function tickHomeHour() {
  initHome();
  const h = gameState.home;
  const indoors = gameState.mapId === 'home';
  h.dirt = Math.min(100, h.dirt + (indoors ? 0.7 : 0.25));
  let dampRise = gameState.hour >= 22 || gameState.hour < 7 ? 0.8 : 0.35;
  if (homeHas('heater')) dampRise *= 0.45;
  if (!h.power) dampRise += 0.4;
  h.damp = Math.min(100, h.damp + dampRise);
  const catRate = homeHas('catBowl') ? 1.1 : 2.4;
  h.catHunger = Math.min(100, h.catHunger + catRate);
  h.clog = Math.min(100, h.clog + 0.35);
  if (h.clothesDirty) h.laundry = Math.min(100, h.laundry + 0.8);
  h.litter = Math.min(100, h.litter + 1.6);
  if (h.drying > 0) {
    const was = h.drying;
    h.drying = Math.max(0, h.drying - (h.damp > 50 ? 4 : 10));
    if (was > 0 && h.drying === 0 && indoors) showToast('衣架上的衣服干了。还是硬的。', 'info');
  }

  const now = hourStamp();
  const before = h.fridge.length;
  const spoiled = h.fridge.filter((f) => f.spoilAt <= now);
  h.fridge = h.fridge.filter((f) => f.spoilAt > now);
  h.trash = Math.min(100, h.trash + (indoors ? 1.1 : 0.4) + spoiled.length * 8);
  if (spoiled.length) {
    h.dirt = Math.min(100, h.dirt + spoiled.length * 6);
    if (indoors) showToast(`冰箱里的${spoiled[0].name}坏了。酸味往阁楼爬。`, 'error');
  }
  if (!h.power) {
    h.fridge.forEach((f) => { f.spoilAt -= 2; });
  }
  syncCountsFromFridge();

  if (h.dirt > 70) {
    addNeed('comfort', -1.4);
    addNeed('hygiene', -0.8);
  }
  if (h.damp > 60) {
    addNeed('comfort', -1.1);
    if (Math.random() < 0.08) gameState.bodyTemp = Math.min(38.4, gameState.bodyTemp + 0.05);
  }
  if (h.catHunger > 80 && indoors && Math.random() < 0.25) {
    think('阿花在碗边叫。');
    addNeed('sanity', -1);
  }
  if (h.trash > 75) {
    addNeed('hygiene', -0.6);
    addNeed('comfort', -0.8);
    if (indoors && Math.random() < 0.12) think('垃圾袋在门口鼓着。');
  }
  if (h.litter > 70) {
    addNeed('hygiene', -0.7);
    if (indoors && Math.random() < 0.15) think('砂盆味道上来了。');
  }
  if (before && spoiled.length) addMoodlet('spoil', '剩菜坏了', -6, 6, '🤢');
}

export function tickHomeDay() {
  initHome();
  const h = gameState.home;
  if (gameState.lockdownLevel >= 2 && Math.random() < 0.22) {
    h.water = false;
    showToast('水管只滴了两下。居委会说今晚抢修。', 'error');
  } else if (!h.water && Math.random() < 0.55) {
    h.water = true;
    showToast('水来了。先接一盆。', 'success');
  }
  if (gameState.lockdownLevel >= 3 && Math.random() < 0.18) {
    h.power = false;
    showToast('楼道闸跳了。冰箱开始化。', 'error');
  } else if (!h.power && Math.random() < 0.6) {
    h.power = true;
    showToast('电回来了。路由器重新闪。', 'success');
  }
  if (h.catHunger > 90) {
    addNeed('sanity', -8);
    addMoodlet('cathungry', '阿花一天没吃', -10, 12, '🐱');
  }
}

export function onEnterHome() {
  initHome();
  const o = gameState.outfit;
  if (o) {
    gameState.home.streetShirt = o.shirt;
    gameState.home.streetPants = o.pants;
    if (o.owned?.includes('shirt_home')) o.shirt = 'shirt_home';
    if (o.owned?.includes('pants_home')) o.pants = 'pants_home';
  }
  gameState.hasMaskOn = false;
  gameState.home.clothesDirty = true;
  if (gameState.dayLoop) gameState.dayLoop.greetT = 2.8;
  const hungry = (gameState.home.catHunger || 0) > 70;
  const dirty = (gameState.home.litter || 0) > 65;
  if (hungry) think('阿花堵在门口。先喂。');
  else if (dirty) think('一进门先闻到砂盆。');
  else think('阿花从沙发上跳下来。口罩勒痕还在。');
}

export function onLeaveHome() {
  initHome();
  const o = gameState.outfit;
  const h = gameState.home;
  if (o && h.streetShirt) o.shirt = h.streetShirt;
  if (o && h.streetPants) o.pants = h.streetPants;
  gameState.hasMaskOn = true;
}

function sleepQuality() {
  initHome();
  const h = gameState.home;
  let q = 1;
  if (homeHas('mattress')) q += 0.22;
  if (homeHas('curtain')) q += 0.12;
  if (h.dirt > 55) q -= 0.18;
  if (h.damp > 50) q -= 0.14;
  if (!h.power) q -= 0.08;
  return Math.max(0.55, Math.min(1.35, q));
}

export function openSleepMenu() {
  const box = document.getElementById('modalSleep');
  const hint = document.getElementById('sleepHint');
  if (hint) {
    const q = sleepQuality();
    const bits = [];
    if (homeHas('mattress')) bits.push('床垫还行');
    if (gameState.home.dirt > 55) bits.push('地板粘脚');
    if (gameState.home.damp > 50) bits.push('被子潮');
    if (!gameState.home.power) bits.push('没电');
    hint.innerText = `睡眠质量 ${Math.round(q * 100)}%${bits.length ? ' · ' + bits.join(' / ') : ''}`;
  }
  if (!box) {
    doHomeSleep(8);
    return;
  }
  box.classList.remove('hidden');
}

export function doHomeSleep(hours) {
  document.getElementById('modalSleep')?.classList.add('hidden');
  const q = sleepQuality();
  if ((gameState.home.catHunger || 0) > 82 && hours > 2) {
    showToast('阿花趴在枕头上叫。你睡不着。先喂。', 'error');
    think('咕噜变成了嚎。');
    return;
  }
  const ok = hours <= 2 ? quickNap() : startSleep(hours);
  if (!ok) return;
  const p = window.player;
  addNeed('comfort', Math.round(10 * q));
  addNeed('hygiene', -4);
  if (q > 1) addNeed('energy', Math.round((q - 1) * 12));
  if (q < 0.85) {
    addNeed('energy', -8);
    addNeed('comfort', -6);
    addMoodlet('badsleep', '睡在潮床垫上', -8, 8, '🛏️');
  }
  if (gameState.home.dirt > 70) addNeed('hygiene', -8);
  addMoodlet('rested', '睡了一觉', Math.round(8 * q), 8, '😴');
  import('./simsLifeSystem.js').then((m) => m.completeWant('sleep', p?.x ?? 220, p?.y ?? 400));
  think('被子还是潮的，但暖和。');
  fx(p, '睡着了', '#38bdf8');
  updateHUD();
}

export function openFridge() {
  initHome();
  syncCountsFromFridge();
  const box = document.getElementById('modalFridge');
  const list = document.getElementById('fridgeList');
  const meta = document.getElementById('fridgeMeta');
  if (meta) {
    meta.innerText = gameState.home.power ? '压缩机还在响。' : '停电了。水珠顺着门往下爬。';
  }
  if (!list || !box) {
    showToast(`鲜食 ${gameState.rawFood} · 便当 ${gameState.instantFood} · 猫粮 ${gameState.home.catFood}`, 'info');
    return;
  }
  const now = hourStamp();
  const rows = gameState.home.fridge.map((f, i) => {
    const left = f.spoilAt - now;
    const bad = left <= 0;
    const soon = left <= 8;
    return `<div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
      <div><b class="${bad ? 'text-rose-300' : 'text-amber-200'}">${f.name}</b>
      <span class="block text-[11px] text-zinc-500">${bad ? '坏了' : soon ? `还剩约 ${left} 小时` : `还能放 ${left} 小时`}</span></div>
      <button data-eat="${i}" class="px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-200">${bad ? '扔掉' : '吃掉'}</button>
    </div>`;
  });
  list.innerHTML = rows.length ? rows.join('') : '<p class="text-zinc-500 text-xs">空的。只剩一盒小苏打。</p>';
  list.querySelectorAll('[data-eat]').forEach((b) => {
    b.onclick = () => useFridgeIndex(Number(b.dataset.eat));
  });
  box.classList.remove('hidden');
}

function useFridgeIndex(i) {
  const f = gameState.home.fridge[i];
  if (!f) return;
  const now = hourStamp();
  gameState.home.fridge.splice(i, 1);
  if (f.spoilAt <= now) {
    gameState.home.dirt = Math.min(100, gameState.home.dirt + 8);
    showToast(`${f.name}已经酸了。你扔进了垃圾袋。`, 'error');
  } else if (f.kind === 'instant') {
    addNeed('hunger', 32);
    applyLifeAction('eatInstant', window.player);
    import('./dayLoopSystem.js').then((m) => m.markDuty('eat'));
    showToast('冷的也吃了。塑料味。', 'info');
  } else {
    addNeed('hunger', 18);
    addNeed('fun', -2);
    import('./dayLoopSystem.js').then((m) => m.markDuty('eat'));
    showToast(`生啃了${f.name}。还是该热一下。`, 'info');
  }
  syncCountsFromFridge();
  updateHUD();
  openFridge();
}

export function openKitchen() {
  if (!gameState.home?.power) {
    showToast('没电。灶打不着火。姜汤也得有水。', 'error');
    return;
  }
  document.getElementById('modalKitchen')?.classList.remove('hidden');
}

export function sitSofa(player) {
  addNeed('energy', 8);
  addNeed('comfort', homeHas('heater') ? 16 : 10);
  addNeed('fun', 6);
  addNeed('hygiene', gameState.home.dirt > 50 ? -3 : 0);
  think('沙发陷下去一块。弹簧还在。');
  fx(player, '坐下', '#34d399');
  showToast(gameState.home.dirt > 60 ? '坐垫上有阿花毛和方便面渣。' : '坐下。窗外有人拖平板车。', 'info');
}

export function watchHomeTv(player) {
  if (!gameState.home.power) {
    showToast('没电。屏幕是黑的，你的脸映在上面。', 'error');
    return;
  }
  applyLifeAction('watchNews', player);
  if (window.DeepGameplay?.watchMorningNews) window.DeepGameplay.watchMorningNews();
  addNeed('comfort', 4);
  if (!gameState.hasMaskOn) addNeed('comfort', 3);
  fx(player, '新闻', '#fde68a');
}

export function lookSkylight(player) {
  addNeed('fun', 4);
  if (gameState.lockdownLevel >= 2) {
    addNeed('sanity', -3);
    addNeed('comfort', 2);
    think('楼下还在喊：做核酸。');
    showToast('天窗玻璃上有一层灰。雾炮车的灯扫过楼道。', 'info');
  } else {
    addNeed('sanity', 4);
    addNeed('comfort', 5);
    showToast('能看见对面晾衣杆。有人在收被子。', 'success');
  }
  fx(player, '看楼下', '#7dd3fc');
}

export function openDesk() {
  const box = document.getElementById('modalDesk');
  const meta = document.getElementById('deskMeta');
  if (meta) {
    meta.innerText = [
      gameState.home.power ? 'Wi-Fi 还在' : '断电网页转圈',
      homeHas('router') ? '百兆' : '旧猫',
      `脏乱 ${Math.round(gameState.home.dirt)} · 潮 ${Math.round(gameState.home.damp)}`
    ].join(' · ');
  }
  if (!box) {
    deskGig(window.player);
    return;
  }
  box.classList.remove('hidden');
}

export function deskChat(player) {
  document.getElementById('modalDesk')?.classList.add('hidden');
  advanceTime(20);
  applyLifeAction('social', player);
  think('业主群又在@所有人。');
  showToast('群里有人问鸡蛋还剩几盒。你回了一句“没有了”。', 'info');
  updateHUD();
}

export function deskCall(player) {
  document.getElementById('modalDesk')?.classList.add('hidden');
  if (!gameState.home.power) {
    showToast('没电。手机只剩 12%。', 'error');
    return;
  }
  advanceTime(25);
  applyLifeAction('social', player);
  addNeed('fun', 6);
  fx(player, '视频', '#a78bfa');
  showToast('网卡。对面还是笑了一下。你把灯关了。', 'success');
  updateHUD();
}

export function deskGig(player) {
  document.getElementById('modalDesk')?.classList.add('hidden');
  if (!gameState.home.power) {
    showToast('没电接不了私活。', 'error');
    return;
  }
  advanceTime(55);
  const pay = (homeHas('router') ? 95 : 55) + Math.round(Math.random() * 40);
  gameState.money += pay;
  addNeed('energy', -16);
  addNeed('fun', -8);
  addNeed('hygiene', -3);
  addNeed('sanity', -4);
  fx(player, `+¥${pay}`, '#fbbf24');
  showToast(`改完三页表格。微信到账 ¥${pay}。腰开始响。`, 'success');
  updateHUD();
}

export function cleanRoom(player) {
  initHome();
  const h = gameState.home;
  if (!h.water && h.dirt > 40) {
    showToast('没水。你只能把袜子踢到床底下。', 'error');
    h.dirt = Math.max(0, h.dirt - 8);
    return;
  }
  h.dirt = Math.max(0, h.dirt - 42);
  h.damp = Math.max(0, h.damp - 8);
  h.trash = Math.min(100, h.trash + 10);
  addNeed('energy', -10);
  addNeed('hygiene', -6);
  addNeed('comfort', 14);
  addNeed('fun', -4);
  addMoodlet('clean', '刚扫过地', 8, 10, '🧹');
  applyLifeAction('clean', player);
  think('垃圾袋满了。先扎上。');
  fx(player, '打扫', '#a3e635');
  showToast('拖完地。阿花立刻走过去留下两排脚印。', 'success');
}

export function useToilet(player) {
  initHome();
  const h = gameState.home;
  advanceTime(4);
  if (h.clog > 78) {
    showToast('堵住了。水面晃，冲不下去。先用搋子。', 'error');
    addNeed('comfort', -6);
    addNeed('hygiene', -4);
    think('隔壁大概也听见了。');
    fx(player, '堵住了', '#94a3b8');
    updateHUD();
    return;
  }
  applyLifeAction('toilet', player);
  h.clog = Math.min(100, h.clog + 10);
  h.dirt = Math.min(100, h.dirt + 2);
  if (!h.water) {
    addNeed('hygiene', -6);
    showToast('停水。你冲不了。盖子赶紧盖上。', 'error');
  } else {
    showToast('冲水声在空楼里特别响。你把窗开了一条缝。', 'info');
  }
  audio.playTone(180, 0.2, 'sine', 0.08);
  fx(player, '舒服了', '#94a3b8');
  updateHUD();
}

export function plungeToilet(player) {
  initHome();
  advanceTime(12);
  gameState.home.clog = Math.max(0, gameState.home.clog - 55);
  addNeed('energy', -8);
  addNeed('hygiene', -10);
  addNeed('fun', -6);
  gameState.home.dirt = Math.min(100, gameState.home.dirt + 6);
  think('搋子拔出来的声音很难听。');
  fx(player, '通了', '#a8a29e');
  showToast('通了。你洗手洗了三遍。', 'success');
  updateHUD();
}

export function washHands(player) {
  initHome();
  document.getElementById('modalBath')?.classList.add('hidden');
  if (!gameState.home.water) {
    showToast('没水。你用了半包湿巾。', 'error');
    addNeed('hygiene', 6);
    return;
  }
  advanceTime(5);
  addNeed('hygiene', homeHas('filter') ? 16 : 10);
  addNeed('comfort', 3);
  think('泡沫还是药店那味。');
  fx(player, '洗手', '#67e8f9');
  showToast('按六步洗手法洗完。镜子上全是水珠。', 'success');
  updateHUD();
}

export function washFace(player) {
  initHome();
  document.getElementById('modalBath')?.classList.add('hidden');
  if (!gameState.home.water) {
    showToast('没水洗脸。口罩勒痕还在。', 'error');
    return;
  }
  advanceTime(8);
  addNeed('hygiene', 8);
  addNeed('comfort', 8);
  addNeed('energy', 4);
  think('冷水拍脸。人醒一点。');
  fx(player, '洗脸', '#7dd3fc');
  showToast('冷水拍完，眼圈还是青的。', 'info');
  updateHUD();
}

export function washClothes(player) {
  initHome();
  document.getElementById('modalBath')?.classList.add('hidden');
  const h = gameState.home;
  if (!h.water) {
    showToast('没水洗衣。外套继续穿。', 'error');
    return;
  }
  advanceTime(35);
  addNeed('energy', -14);
  addNeed('hygiene', -4);
  addNeed('comfort', 6);
  h.laundry = 0;
  h.clothesDirty = false;
  h.drying = 100;
  h.damp = Math.min(100, h.damp + (homeHas('bathfan') ? 4 : 12));
  addMoodlet('laundry', '衣服在晾', 6, 10, '👕');
  think('阳台太小，挂在花洒上。');
  fx(player, '手洗', '#38bdf8');
  showToast('手洗完拧不干。花洒上挂着两件滴水。', 'success');
  updateHUD();
}

export function lookMirror(player) {
  document.getElementById('modalBath')?.classList.add('hidden');
  advanceTime(3);
  addNeed('fun', 2);
  if (gameState.bodyTemp >= 37.4) {
    addNeed('sanity', -4);
    think('镜子里的人比你更像病人。');
    showToast('眼圈、口罩勒痕、还有一点红。你把灯关了。', 'error');
  } else {
    addNeed('sanity', 2);
    showToast('还像自己。胡子该刮了。', 'info');
  }
  fx(player, '照镜子', '#e7e5e4');
  updateHUD();
}

export function openBath() {
  initHome();
  const box = document.getElementById('modalBath');
  const meta = document.getElementById('bathMeta');
  if (meta) {
    const h = gameState.home;
    meta.innerText = [
      h.water ? '有水' : '停水',
      `马桶堵塞 ${Math.round(h.clog)}`,
      h.clothesDirty ? '外套一身地铁味' : '衣服还行',
      homeHas('filter') ? '滤芯在' : '水质发黄'
    ].join(' · ');
  }
  if (!box) {
    washHands(window.player);
    return;
  }
  box.classList.remove('hidden');
}

export function useShower(player) {
  initHome();
  document.getElementById('modalBath')?.classList.add('hidden');
  if (!gameState.home.water) {
    showToast('龙头吐了两口锈水。今天洗不了。', 'error');
    addNeed('hygiene', 4);
    think('用湿巾擦了脖子。');
    return;
  }
  applyLifeAction('shower', player);
  if (homeHas('filter')) addNeed('hygiene', 8);
  gameState.home.damp = Math.min(100, gameState.home.damp + (homeHas('bathfan') ? 6 : 16));
  gameState.home.laundry = Math.max(0, gameState.home.laundry - 8);
  if (gameState.bodyTemp > 37.4) gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - 0.15);
  audio.playTone(520, 0.35, 'sine', 0.08);
  fx(player, '热水', '#22d3ee');
  showToast(homeHas('bathfan') ? '浴霸嗡一声。蒸汽没那么糊。' : '热水冲掉了一天的消毒水和地铁味。小窗全是雾。', 'success');
}

export function takeTrash(player) {
  initHome();
  const h = gameState.home;
  if (h.trash < 12) {
    showToast('袋子还瘪着。再攒攒。', 'info');
    return;
  }
  if (gameState.lockdownLevel >= 3 && Math.random() < 0.45) {
    showToast('楼道门封了条。垃圾袋只能先堆门口。', 'error');
    addNeed('sanity', -4);
    h.dirt = Math.min(100, h.dirt + 8);
    return;
  }
  advanceTime(15);
  addNeed('energy', -6);
  addNeed('hygiene', -4);
  h.trash = 0;
  h.dirt = Math.max(0, h.dirt - 10);
  import('./simsLifeSystem.js').then((m) => m.completeWant('trash', player?.x ?? 220, player?.y ?? 400));
  think('扔进垃圾桶盖子时喷了一点。');
  fx(player, '扔掉了', '#a3e635');
  showToast('下楼扔掉。回来时手上全是消毒液味。', 'success');
  updateHUD();
}

export function scoopLitter(player) {
  initHome();
  const h = gameState.home;
  if (h.litter < 8) {
    showToast('砂盆还干净。阿花刚踩过。', 'info');
    return;
  }
  advanceTime(8);
  addNeed('hygiene', -6);
  addNeed('fun', -4);
  h.litter = 0;
  h.trash = Math.min(100, h.trash + 14);
  import('./dayLoopSystem.js').then((m) => {
    if ((gameState.home.catHunger || 0) < 45) m.markDuty('cat');
  });
  import('./simsLifeSystem.js').then((m) => m.completeWant('litter', player?.x ?? 220, player?.y ?? 400));
  think('结块铲进袋子。阿花立刻踩回去。');
  fx(player, '铲砂', '#e7e5e4');
  showToast('铲完了。味道淡一点。垃圾袋更鼓。', 'success');
  updateHUD();
}

export function useHanger(player) {
  initHome();
  const h = gameState.home;
  if (h.drying > 0) {
    if (h.drying > 25) {
      showToast('还在滴。再等。阁楼地上有一滩。', 'info');
      h.damp = Math.min(100, h.damp + 3);
      return;
    }
    advanceTime(4);
    h.drying = 0;
    h.clothesDirty = false;
    addNeed('comfort', 6);
    showToast('收下来。领口还是硬的。', 'success');
    fx(player, '收衣服', '#cbd5e1');
    updateHUD();
    return;
  }
  if (h.clothesDirty) {
    showToast('先去洗手台手洗，再挂上来。', 'info');
    return;
  }
  showToast('衣架空着。只有一根铁丝和两个衣夹。', 'info');
}

export function openMedkit() {
  const box = document.getElementById('modalMedkit');
  const meta = document.getElementById('medkitMeta');
  if (meta) {
    meta.innerText = `额温 ${gameState.bodyTemp.toFixed(1)}°C · 抗原 ${gameState.antigenKits} 盒 · 退烧药 ${gameState.pillsCount}`;
  }
  if (!box) {
    takeTemp(window.player);
    return;
  }
  box.classList.remove('hidden');
}

export function takeTemp(player) {
  document.getElementById('modalMedkit')?.classList.add('hidden');
  advanceTime(3);
  const t = gameState.bodyTemp.toFixed(1);
  fx(player, `${t}°C`, t >= 37.3 ? '#ef4444' : '#4ade80');
  if (gameState.bodyTemp >= 37.3) {
    addNeed('sanity', -6);
    think('红了。再测一次还是红。');
    showToast(`额温枪 ${t}°C。你把枪翻过来看电池。`, 'error');
  } else {
    addNeed('sanity', 3);
    showToast(`额温枪 ${t}°C。绿灯。你还是不放心。`, 'success');
  }
  updateHUD();
}

export function useAntigen(player) {
  document.getElementById('modalMedkit')?.classList.add('hidden');
  if (gameState.antigenKits < 1) {
    showToast('试剂盒空了。药店限购。', 'error');
    return;
  }
  gameState.antigenKits -= 1;
  advanceTime(18);
  addNeed('hygiene', -2);
  const positive = gameState.viralLoad >= 45 || gameState.bodyTemp >= 38.2;
  const faint = !positive && (gameState.viralLoad >= 28 || gameState.bodyTemp >= 37.4) && Math.random() < 0.35;
  if (positive) {
    gameState.isPositiveKnown = true;
    if (!gameState.quarantineDaysLeft) gameState.quarantineDaysLeft = 7;
    addNeed('sanity', -18);
    addMoodlet('positive', '抗原两条杠', -20, 24, '🔴');
    think('C 和 T 都出来了。');
    showToast('两条杠。你把试剂盒扣在桌上，不敢拍照进群。', 'error');
  } else if (faint) {
    addNeed('sanity', -8);
    showToast('T 线淡淡的。说明书写再测一次。你没有第二盒。', 'error');
  } else {
    addNeed('sanity', 8);
    showToast('一条杠。你对着灯光又看了三十秒。', 'success');
  }
  fx(player, positive ? '阳性' : '阴性', positive ? '#ef4444' : '#4ade80');
  updateHUD();
}

export function feedCat(player) {
  initHome();
  const h = gameState.home;
  if (h.catFood < 1) {
    if (!takeFridgeKind('raw')) {
      showToast('猫粮没了，剩菜也没有。阿花盯着你。', 'error');
      return;
    }
    showToast('你把一点剩菜拨进碗里。阿花还是吃了。', 'info');
  } else {
    h.catFood -= 1;
    showToast('陶瓷碗碰地一声。咕噜。', 'success');
  }
  h.catHunger = Math.max(0, h.catHunger - 55);
  applyLifeAction('petCat', player);
  import('./dayLoopSystem.js').then((m) => {
    if (h.litter < 40) m.markDuty('cat');
  });
  fx(player, '喂猫', '#fb923c');
  updateHUD();
}

export function petHomeCat(player) {
  initHome();
  if (gameState.home.catHunger > 75) {
    showToast('阿花躲开了。先喂。', 'error');
    addNeed('social', -2);
    return;
  }
  applyLifeAction('petCat', player);
  fx(player, 'rua', '#fdba74');
}

export function openUpgrade() {
  const box = document.getElementById('modalHomeUp');
  const list = document.getElementById('homeUpList');
  if (!list || !box) return;
  list.innerHTML = HOME_UPGRADES.map((u) => {
    const owned = homeHas(u.id);
    return `<div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between gap-2">
      <div><b class="text-amber-200">${u.name}</b><span class="block text-[11px] text-zinc-500">${u.desc}</span></div>
      <button data-up="${u.id}" ${owned ? 'disabled' : ''} class="px-2 py-1 rounded text-xs font-bold ${owned ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-600 text-black'}">${owned ? '已有' : '¥' + u.price}</button>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-up]').forEach((b) => {
    b.onclick = () => buyUpgrade(b.dataset.up);
  });
  box.classList.remove('hidden');
}

export function buyUpgrade(id) {
  const u = HOME_UPGRADES.find((x) => x.id === id);
  if (!u || homeHas(id)) return;
  if (gameState.money < u.price) {
    showToast(`不够 ¥${u.price}。闲鱼还要运费。`, 'error');
    return;
  }
  gameState.money -= u.price;
  gameState.home.upgrades[id] = true;
  think(`装上了${u.name}。`);
  showToast(`${u.name}放到位了。房间还是那么小，好一点。`, 'success');
  updateHUD();
  openUpgrade();
}

export function homeStatusLine() {
  initHome();
  const h = gameState.home;
  return `脏乱 ${Math.round(h.dirt)} · 潮 ${Math.round(h.damp)} · ${h.water ? '有水' : '停水'} · ${h.power ? '有电' : '停电'} · 堵塞 ${Math.round(h.clog)} · 阿花饿 ${Math.round(h.catHunger)}`;
}

export function bindHomeModals() {
  document.getElementById('btnCloseSleep')?.addEventListener('click', () => document.getElementById('modalSleep')?.classList.add('hidden'));
  document.getElementById('btnSleepNap')?.addEventListener('click', () => doHomeSleep(2));
  document.getElementById('btnSleep8')?.addEventListener('click', () => doHomeSleep(8));
  document.getElementById('btnSleepDawn')?.addEventListener('click', () => {
    let h = (7 - gameState.hour + 24) % 24;
    if (h < 4) h = 6;
    if (h > 12) h = 8;
    doHomeSleep(h);
  });
  document.getElementById('btnCloseFridge')?.addEventListener('click', () => document.getElementById('modalFridge')?.classList.add('hidden'));
  document.getElementById('btnCloseDesk')?.addEventListener('click', () => document.getElementById('modalDesk')?.classList.add('hidden'));
  document.getElementById('btnDeskChat')?.addEventListener('click', () => deskChat(window.player));
  document.getElementById('btnDeskCall')?.addEventListener('click', () => deskCall(window.player));
  document.getElementById('btnDeskGig')?.addEventListener('click', () => deskGig(window.player));
  document.getElementById('btnDeskUp')?.addEventListener('click', () => {
    document.getElementById('modalDesk')?.classList.add('hidden');
    openUpgrade();
  });
  document.getElementById('btnCloseHomeUp')?.addEventListener('click', () => document.getElementById('modalHomeUp')?.classList.add('hidden'));
  document.getElementById('btnCloseBath')?.addEventListener('click', () => document.getElementById('modalBath')?.classList.add('hidden'));
  document.getElementById('btnWashHands')?.addEventListener('click', () => washHands(window.player));
  document.getElementById('btnWashFace')?.addEventListener('click', () => washFace(window.player));
  document.getElementById('btnWashClothes')?.addEventListener('click', () => washClothes(window.player));
  document.getElementById('btnLookMirror')?.addEventListener('click', () => lookMirror(window.player));
  document.getElementById('btnPlunge')?.addEventListener('click', () => {
    document.getElementById('modalBath')?.classList.add('hidden');
    plungeToilet(window.player);
  });
  document.getElementById('btnBathShower')?.addEventListener('click', () => useShower(window.player));
  document.getElementById('btnCloseMedkit')?.addEventListener('click', () => document.getElementById('modalMedkit')?.classList.add('hidden'));
  document.getElementById('btnTakeTemp')?.addEventListener('click', () => takeTemp(window.player));
  document.getElementById('btnAntigen')?.addEventListener('click', () => useAntigen(window.player));
}
