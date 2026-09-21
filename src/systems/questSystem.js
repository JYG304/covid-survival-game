import { gameState } from '../data/gameState.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { addSkillXp } from './statsSystem.js';
import { updateHUD } from '../ui/hud.js';

function bump(key, n) {
  if (key === 'sanity') gameState.sanity = Math.min(100, gameState.sanity + n);
  else if (gameState.sims && gameState.sims[key] != null) {
    gameState.sims[key] = Math.max(0, Math.min(100, gameState.sims[key] + n));
  }
}

const DEFS = [
  { id: 'rent_ok', title: '活过这个交租日', desc: '账户里留够 ¥450 房租。', check: () => gameState.money >= 450 && gameState.day % 3 !== 0, reward: { money: 20, sanity: 6 }, auto: true },
  { id: 'talk_3', title: '别变成孤岛', desc: '今天和 3 个不同的人把话说完（含选项）。', flag: 'talkedIds', need: 3, reward: { sanity: 8, social: 10 } },
  { id: 'eat_hot', title: '吃一顿热的', desc: '灶台煮面或江边烤冷面。', flag: 'ateHot', reward: { comfort: 8 } },
  { id: 'metro_scan', title: '过一次闸机', desc: '在地铁车厢亮码。', flag: 'metroScanned', reward: { streetwiseXp: 8 } },
  { id: 'club_shift', title: '夜店顶一班', desc: '在 DJ 台打碟或吧台喝酒并和 Mia/Neo 对话。', flag: 'clubWork', reward: { money: 30, fun: 8 } },
  { id: 'parlor_one', title: '按完一轮', desc: '推拿馆里当技师把客人按完。', flag: 'parlorDone', reward: { massageXp: 20, money: 15 } },
  { id: 'hosp_triage', title: '走一趟发热门诊', desc: '完成预检分诊。', flag: 'triaged', reward: { immuneHint: true } },
  { id: 'help_li', title: '李姐的鸡蛋', desc: '和李姐对话并选择把鸡蛋分她。', flag: 'helpedLi', reward: { reputation: 4, charismaXp: 12 } }
];

export function initQuests() {
  if (!gameState.quests) {
    gameState.quests = {
      flags: {},
      talkedIds: [],
      done: [],
      active: DEFS.slice(0, 4).map((d) => d.id)
    };
  }
}

export function flagQuest(key, extra) {
  if (!gameState.quests) return;
  gameState.quests.flags[key] = true;
  if (key === 'talk' && extra) {
    const arr = gameState.quests.talkedIds;
    if (!arr.includes(extra)) arr.push(extra);
  }
  settleQuests();
}

export function settleQuests() {
  if (!gameState.quests) return;
  for (const id of gameState.quests.active) {
    if (gameState.quests.done.includes(id)) continue;
    const def = DEFS.find((d) => d.id === id);
    if (!def) continue;
    let ok = false;
    if (def.check) ok = def.check();
    else if (def.flag === 'talkedIds') ok = (gameState.quests.talkedIds || []).length >= def.need;
    else ok = !!gameState.quests.flags[def.flag];
    if (ok) completeQuest(def);
  }
}

function completeQuest(def) {
  gameState.quests.done.push(def.id);
  const r = def.reward || {};
  if (r.money) gameState.money += r.money;
  if (r.sanity) bump('sanity', r.sanity);
  if (r.reputation) gameState.reputation += r.reputation;
  if (r.social) bump('social', r.social);
  if (r.comfort) bump('comfort', r.comfort);
  if (r.fun) bump('fun', r.fun);
  if (r.massageXp) addSkillXp('massage', r.massageXp);
  if (r.charismaXp) addSkillXp('charisma', r.charismaXp);
  if (r.streetwiseXp) addSkillXp('streetwise', r.streetwiseXp);
  showToast(`任务完成：${def.title}`, 'success');
  spawnFloatingText('任务完成', window.player?.x || 200, (window.player?.y || 400) - 90, '#fde047');
  rotateActive();
  updateHUD();
}

function rotateActive() {
  const q = gameState.quests;
  const next = DEFS.find((d) => !q.done.includes(d.id) && !q.active.includes(d.id));
  q.active = q.active.filter((id) => !q.done.includes(id));
  if (next && q.active.length < 4) q.active.push(next.id);
}

export function getActiveQuests() {
  if (!gameState.quests) return [];
  return gameState.quests.active.map((id) => DEFS.find((d) => d.id === id)).filter(Boolean).map((d) => ({
    ...d,
    done: gameState.quests.done.includes(d.id)
  }));
}

export function onQuestNewDay() {
  if (!gameState.quests) return;
  gameState.quests.talkedIds = [];
  gameState.quests.flags = {};
  const leftover = gameState.quests.active.filter((id) => !gameState.quests.done.includes(id));
  gameState.quests.active = leftover.slice(0, 2);
  for (const d of DEFS) {
    if (gameState.quests.active.length >= 4) break;
    if (!gameState.quests.done.includes(d.id) && !gameState.quests.active.includes(d.id)) {
      gameState.quests.active.push(d.id);
    }
  }
}
