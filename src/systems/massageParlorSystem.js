import { gameState } from '../data/gameState.js';
import { livingNpcs, getNpc, npcSay } from './npcInteractSystem.js';
import { addNeed, addMoodlet, think, applyLifeAction } from './simsLifeSystem.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { audio } from '../utils/audio.js';
import { advanceTime } from './timeSystem.js';

export const PARLOR_X = 300;
export const PARLOR_W = 1700;
export const BEDS = [
  { id: 'bed1', x: 620, yOff: 58 },
  { id: 'bed2', x: 920, yOff: 58 },
  { id: 'bed3', x: 1220, yOff: 58 }
];

export function initMassageParlor() {
  if (!gameState.parlor) {
    gameState.parlor = {
      moneyToday: 0,
      served: 0,
      skill: 1,
      rooms: BEDS.map((b) => ({
        id: b.id,
        x: b.x,
        staffId: b.id === 'bed1' ? 'ahua_staff' : null,
        customerId: null,
        playerRole: null,
        progress: 0,
        session: 0
      }))
    };
  }
}

export function isInParlor(x) {
  return x >= PARLOR_X && x <= PARLOR_X + PARLOR_W;
}

export function openParlorMenu() {
  const modal = document.getElementById('modalParlor');
  if (modal) modal.classList.remove('hidden');
  refreshParlorMenu();
}

export function closeParlorMenu() {
  document.getElementById('modalParlor')?.classList.add('hidden');
}

export function refreshParlorMenu() {
  const box = document.getElementById('parlorRoomList');
  const stats = document.getElementById('parlorStats');
  if (!gameState.parlor) return;
  if (stats) {
    stats.innerText = `今日营收 ¥${gameState.parlor.moneyToday} · 服务 ${gameState.parlor.served} 人 · 手法 Lv.${gameState.parlor.skill.toFixed(1)}`;
  }
  if (!box) return;
  box.innerHTML = gameState.parlor.rooms.map((r) => {
    const staff = r.staffId === 'player' ? '你' : (getNpc(r.staffId)?.name || '空岗');
    const cust = r.customerId === 'player' ? '你(客人)' : (getNpc(r.customerId)?.name || '空床');
    const pct = Math.round(r.progress * 100);
    return `<div class="p-2.5 bg-zinc-950 border border-rose-900/40 rounded-xl text-xs flex flex-col gap-1.5">
      <div class="flex justify-between"><b class="text-rose-300">${r.id.toUpperCase()}</b><span class="text-zinc-400">${pct}%</span></div>
      <div class="text-zinc-300">技师：${staff}　客人：${cust}</div>
      <div class="flex gap-1.5 flex-wrap">
        <button data-act="work" data-room="${r.id}" class="px-2 py-1 rounded bg-rose-700 text-white font-bold">你去按</button>
        <button data-act="receive" data-room="${r.id}" class="px-2 py-1 rounded bg-amber-600 text-black font-bold">你去躺</button>
        <button data-act="assign" data-room="${r.id}" class="px-2 py-1 rounded bg-zinc-700 text-zinc-100">叫人上岗</button>
        <button data-act="seat" data-room="${r.id}" class="px-2 py-1 rounded bg-zinc-700 text-zinc-100">请来客</button>
      </div>
    </div>`;
  }).join('');
  box.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => handleParlorAction(btn.dataset.act, btn.dataset.room);
  });
}

function getRoom(id) {
  return gameState.parlor.rooms.find((r) => r.id === id);
}

export function handleParlorAction(act, roomId) {
  const room = getRoom(roomId);
  if (!room) return;
  const player = window.player;
  if (act === 'work') startPlayerWork(room, player);
  if (act === 'receive') startPlayerReceive(room, player);
  if (act === 'assign') assignStaff(room);
  if (act === 'seat') seatCustomer(room);
  refreshParlorMenu();
}

function startPlayerWork(room, player) {
  if (room.playerRole === 'customer') {
    showToast('你正躺着被按，先起来。', 'error');
    return;
  }
  clearPlayerFromRooms();
  room.staffId = 'player';
  room.playerRole = 'masseur';
  if (!room.customerId) seatCustomer(room);
  if (player) player.x = room.x + 18;
  think('手要稳，别按到骨头。');
  showToast('你换上工装，站到床边开始推拿。', 'success');
  closeParlorMenu();
}

function startPlayerReceive(room, player) {
  if (gameState.money < 80) {
    showToast('一次推拿 ¥80，钱不够。', 'error');
    return;
  }
  clearPlayerFromRooms();
  room.customerId = 'player';
  room.playerRole = 'customer';
  if (!room.staffId || room.staffId === 'player') {
    const staff = livingNpcs.find((n) => n.job === 'masseur' && !gameState.parlor.rooms.some((r) => r.staffId === n.id));
    if (staff) {
      room.staffId = staff.id;
      staff.pose = 'work';
      staff.x = room.x + 22;
    } else {
      room.staffId = 'lin_jie';
      const lin = getNpc('lin_jie');
      if (lin) { lin.pose = 'work'; lin.x = room.x + 22; }
    }
  }
  gameState.money -= 80;
  if (player) player.x = room.x;
  think('肩终于贴到床上了。');
  showToast('你趴上床，林姐她们开始松你的肩颈。', 'info');
  closeParlorMenu();
}

function assignStaff(room) {
  const free = livingNpcs.find((n) => (n.job === 'masseur' || n.rel >= 50) && !gameState.parlor.rooms.some((r) => r.staffId === n.id));
  if (!free) {
    showToast('街上没人肯上岗。先去跟技师/邻居聊天涨好感。', 'error');
    return;
  }
  room.staffId = free.id;
  free.pose = 'work';
  free.x = room.x + 22;
  npcSay(free, '我来这张床。');
  showToast(`${free.name} 上岗：${room.id}`, 'success');
}

function seatCustomer(room) {
  if (room.customerId) return;
  const cust = livingNpcs.find((n) => n.job === 'customer' || (n.job !== 'masseur' && n.pose === 'walk'));
  const pick = cust || livingNpcs.find((n) => n.id === 'uncle_zhao');
  if (!pick) return;
  room.customerId = pick.id;
  pick.pose = 'lie';
  pick.x = room.x;
  npcSay(pick, '按重点……');
}

function clearPlayerFromRooms() {
  for (const r of gameState.parlor.rooms) {
    if (r.staffId === 'player') r.staffId = null;
    if (r.customerId === 'player') r.customerId = null;
    if (r.playerRole) r.playerRole = null;
  }
}

export function updateMassageParlor(delta) {
  if (!gameState.parlor) return;
  for (const room of gameState.parlor.rooms) {
    const working = room.staffId && room.customerId;
    if (!working) continue;
    room.progress += delta * (0.07 + gameState.parlor.skill * 0.01);
    room.session += delta;

    const staffNpc = room.staffId !== 'player' ? getNpc(room.staffId) : null;
    const custNpc = room.customerId !== 'player' ? getNpc(room.customerId) : null;
    if (staffNpc) { staffNpc.pose = 'work'; staffNpc.x = room.x + 22; staffNpc.anim += delta * 10; }
    if (custNpc) { custNpc.pose = 'lie'; custNpc.x = room.x; }

    if (room.progress >= 1) finishSession(room);
  }
}

function finishSession(room) {
  room.progress = 0;
  const pay = 90 + Math.floor(gameState.parlor.skill * 12);
  const player = window.player;

  if (room.playerRole === 'masseur') {
    gameState.money += pay;
    gameState.parlor.moneyToday += pay;
    gameState.parlor.served += 1;
    gameState.parlor.skill = Math.min(10, gameState.parlor.skill + 0.08);
    addNeed('energy', -8);
    addNeed('fun', 4);
    addNeed('social', 6);
    addNeed('hygiene', -4);
    applyLifeAction('work', player);
    import('./statsSystem.js').then(({ applyStatEvent }) => applyStatEvent('massageWork'));
    import('./questSystem.js').then(({ flagQuest }) => flagQuest('parlorDone'));
    spawnFloatingText(`推拿完工 +¥${pay}`, room.x, 330, '#fde68a');
    showToast(`你把客人按完一轮，入账 ¥${pay}。手法更熟了。`, 'success');
    audio.playCash?.();
    const cust = getNpc(room.customerId);
    if (cust) {
      cust.pose = 'walk';
      cust.rel = Math.min(100, cust.rel + 8);
      npcSay(cust, '松多了，谢了。');
    }
    room.customerId = null;
    seatCustomer(room);
  } else if (room.playerRole === 'customer') {
    addNeed('energy', 16);
    addNeed('comfort', 28);
    addNeed('fun', 10);
    addNeed('sanity', 12);
    addNeed('social', 4);
    addMoodlet('massage', '肩颈被松开了', 16, 12, '💆');
    think('骨头缝里的酸终于散了。');
    spawnFloatingText('舒适大增', room.x, 330, '#fb7185');
    showToast('一次正经推拿结束。走路都轻了。', 'success');
    advanceTime(40);
    room.customerId = null;
    room.playerRole = null;
    const staff = getNpc(room.staffId);
    if (staff && staff.id !== 'ahua_staff' && staff.id !== 'lin_jie') staff.pose = 'walk';
  } else {
    gameState.parlor.moneyToday += 40;
    gameState.parlor.served += 1;
    const cust = getNpc(room.customerId);
    if (cust) { cust.pose = 'walk'; npcSay(cust, '下次还来。'); }
    room.customerId = null;
  }
  updateHUD();
}

export function getPlayerParlorPose() {
  if (!gameState.parlor) return null;
  const room = gameState.parlor.rooms.find((r) => r.playerRole);
  if (!room) return null;
  return { room, role: room.playerRole, progress: room.progress };
}

export function openParlorFromStreet() {
  if (gameState.lockdownLevel >= 3) {
    showToast('静默管理，推拿馆只开侧门做预约单。', 'info');
  }
  openParlorMenu();
}
