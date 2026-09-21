import { gameState } from '../data/gameState.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { applyLifeAction, addNeed, think } from './simsLifeSystem.js';
import { audio } from '../utils/audio.js';
import { DIALOGUES } from '../data/dialogues.js';
import { flagQuest } from './questSystem.js';
import { applyStatEvent, addSkillXp } from './statsSystem.js';

export const livingNpcs = [];

export function initStreetNpcs() {
  if (!gameState.npcRel) gameState.npcRel = {};
}

export function updateStreetNpcs(delta) {
  for (const npc of livingNpcs) {
    npc.anim += delta * 8;
    if (npc.bubbleT > 0) npc.bubbleT -= delta;
    else npc.bubble = '';
    if (npc.pose === 'walk' && !npc.assignedRoom) {
      npc.x += npc.dir * npc.speed;
      if (npc.x > npc.homeMax) npc.dir = -1;
      if (npc.x < npc.homeMin) npc.dir = 1;
    }
  }
}

export function nearestNpc(playerX, range = 70) {
  let best = null;
  let bestD = range;
  for (const npc of livingNpcs) {
    if (npc.pose === 'lie' || npc.pose === 'work') continue;
    const d = Math.abs(npc.x - playerX);
    if (d < bestD) {
      best = npc;
      bestD = d;
    }
  }
  return best;
}

export function npcSay(npc, text, seconds = 3.4) {
  npc.bubble = text;
  npc.bubbleT = seconds;
}

export function talkToNpc(npc, player) {
  if (!npc) return;
  const dlg = DIALOGUES[npc.id];
  if (dlg) {
    openDialogue(npc, player, dlg);
    return;
  }
  const line = npc.talk[Math.floor(Math.random() * npc.talk.length)];
  finishTalk(npc, player, line, 4);
}

function openDialogue(npc, player, dlg) {
  const modal = document.getElementById('modalDialogue');
  const title = document.getElementById('dlgTitle');
  const body = document.getElementById('dlgBody');
  const opts = document.getElementById('dlgOptions');
  if (!modal || !opts) {
    finishTalk(npc, player, dlg.open, 5);
    return;
  }
  title.innerText = `${npc.name} · ${npc.role}`;
  body.innerText = dlg.open;
  opts.innerHTML = dlg.options.map((o, i) =>
    `<button data-i="${i}" class="w-full text-left px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 hover:border-amber-400 text-xs text-zinc-200">${o.t}</button>`
  ).join('');
  opts.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => {
      const o = dlg.options[Number(btn.dataset.i)];
      modal.classList.add('hidden');
      applyDialogueOption(npc, player, o);
    };
  });
  modal.classList.remove('hidden');
}

function applyDialogueOption(npc, player, o) {
  if (o.need?.rawFood && gameState.rawFood < o.need.rawFood) {
    showToast('你没有能分出去的鸡蛋。', 'error');
    finishTalk(npc, player, '……那算了。', -2);
    return;
  }
  if (o.need?.rawFood) gameState.rawFood -= o.need.rawFood;
  if (o.flags) o.flags.forEach((f) => flagQuest(f));
  if (o.skill) addSkillXp(o.skill, 8);
  applyStatEvent('social');
  finishTalk(npc, player, o.line, o.rel ?? 4);
}

function finishTalk(npc, player, line, relDelta) {
  npc.rel = Math.max(0, Math.min(100, (npc.rel || 40) + relDelta));
  gameState.npcRel[npc.id] = npc.rel;
  applyLifeAction('social', player);
  flagQuest('talk', npc.id);
  npcSay(npc, line);
  think(`${npc.name}：${line}`);
  spawnFloatingText(`${npc.name} 好感 ${relDelta >= 0 ? '+' : ''}${relDelta}`, player.x, player.y - 78, relDelta >= 0 ? '#c4b5fd' : '#fb7185');
  audio.playTone(480, 0.12, 'sine', 0.08);
  showToast(`${npc.name}：${line}`, relDelta >= 0 ? 'info' : 'error');
  updateHUD();
}

export function getNpc(id) {
  return livingNpcs.find((n) => n.id === id);
}

export function recruitNpc(npc) {
  if (!npc) return false;
  if (npc.job !== 'masseur' && npc.job !== 'neighbor' && npc.job !== 'customer') {
    showToast(`${npc.name} 不想进馆打工。`, 'error');
    return false;
  }
  if (npc.rel < 35) {
    showToast(`${npc.name} 还不熟，不肯跟你进店。`, 'error');
    return false;
  }
  npc.pose = 'idle';
  npcSay(npc, '那我去馆里等你。');
  showToast(`${npc.name} 答应来推拿馆顶班。`, 'success');
  addNeed('social', 8);
  return true;
}

export function bindDialogueModal() {
  document.getElementById('btnCloseDialogue')?.addEventListener('click', () => {
    document.getElementById('modalDialogue')?.classList.add('hidden');
  });
}
