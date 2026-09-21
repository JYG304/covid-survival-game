import { gameState } from '../data/gameState.js';
import { showToast } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { think } from './simsLifeSystem.js';

export const CATALOG = [
  { id: 'shirt_blue', slot: 'shirt', name: '旧蓝夹克', price: 0, color: '#2563eb' },
  { id: 'shirt_black', slot: 'shirt', name: '黑色工装', price: 128, color: '#111827' },
  { id: 'shirt_white', slot: 'shirt', name: '白衬衫（打卡用）', price: 89, color: '#f8fafc' },
  { id: 'shirt_red', slot: 'shirt', name: '红码隔离服', price: 0, color: '#b91c1c', lock: 'positive' },
  { id: 'shirt_neon', slot: 'shirt', name: '夜店反光衣', price: 260, color: '#a21caf' },
  { id: 'shirt_scrub', slot: 'shirt', name: '一次性隔离衣', price: 45, color: '#e0f2fe' },
  { id: 'pants_dark', slot: 'pants', name: '深灰西裤', price: 0, color: '#111827' },
  { id: 'pants_jean', slot: 'pants', name: '洗白牛仔裤', price: 99, color: '#1e3a5f' },
  { id: 'pants_sport', slot: 'pants', name: '运动裤', price: 79, color: '#365314' },
  { id: 'hair_black', slot: 'hair', name: '短黑发', price: 0, color: '#1e293b' },
  { id: 'hair_brown', slot: 'hair', name: '染棕', price: 68, color: '#78350f' },
  { id: 'hair_gold', slot: 'hair', name: '漂金（夜店）', price: 150, color: '#facc15' },
  { id: 'mask_n95', slot: 'mask', name: 'N95', price: 0, on: true },
  { id: 'mask_off', slot: 'mask', name: '摘口罩', price: 0, on: false },
  { id: 'gender_m', slot: 'gender', name: '男性外观', price: 0, gender: 'm' },
  { id: 'gender_f', slot: 'gender', name: '女性外观', price: 0, gender: 'f' }
];

export function initOutfit() {
  if (!gameState.outfit) {
    gameState.outfit = {
      gender: 'm',
      shirt: 'shirt_blue',
      pants: 'pants_dark',
      hair: 'hair_black',
      owned: ['shirt_blue', 'pants_dark', 'hair_black', 'mask_n95', 'mask_off', 'gender_m', 'gender_f']
    };
  }
}

export function outfitColor(slot) {
  const id = gameState.outfit?.[slot];
  const item = CATALOG.find((c) => c.id === id);
  return item?.color || (slot === 'shirt' ? '#2563eb' : slot === 'pants' ? '#111827' : '#1e293b');
}

export function buyOutfit(id) {
  const item = CATALOG.find((c) => c.id === id);
  if (!item) return;
  if (item.lock === 'positive' && !gameState.isPositiveKnown) {
    showToast('这件只有红码隔离时才会发。', 'error');
    return;
  }
  if (!gameState.outfit.owned.includes(id)) {
    if (gameState.money < item.price) {
      showToast(`不够 ¥${item.price}。试衣间镜子里的人比你有钱。`, 'error');
      return;
    }
    gameState.money -= item.price;
    gameState.outfit.owned.push(id);
    showToast(`小票：${item.name}  ¥${item.price}  不支持七天无理由（防疫物资）。`, 'success');
  }
  equipOutfit(id);
}

export function equipOutfit(id) {
  const item = CATALOG.find((c) => c.id === id);
  if (!item) return;
  if (!gameState.outfit.owned.includes(id)) {
    showToast('还没买。', 'error');
    return;
  }
  if (item.slot === 'mask') {
    gameState.hasMaskOn = item.on;
  } else if (item.slot === 'gender') {
    gameState.outfit.gender = item.gender;
  } else {
    gameState.outfit[item.slot] = id;
  }
  think(`换上了${item.name}。`);
  updateHUD();
}

function itemName(id) {
  return CATALOG.find((c) => c.id === id)?.name || '空';
}

export function openGear() {
  document.getElementById('modalGear')?.classList.remove('hidden');
  renderOutfitShop();
}

export function renderOutfitShop() {
  if (!gameState.outfit) return;
  const paper = document.getElementById('gearPaper');
  if (paper) {
    paper.innerText = `${gameState.outfit.gender === 'f' ? '女性' : '男性'} · 上衣 ${itemName(gameState.outfit.shirt)} · 下装 ${itemName(gameState.outfit.pants)} · 发型 ${itemName(gameState.outfit.hair)} · ${gameState.hasMaskOn ? 'N95' : '未戴口罩'}`;
  }
  const slots = document.getElementById('gearSlots');
  if (slots) {
    const rows = [
      ['上衣', itemName(gameState.outfit.shirt)],
      ['下装', itemName(gameState.outfit.pants)],
      ['发型', itemName(gameState.outfit.hair)],
      ['口罩', gameState.hasMaskOn ? 'N95' : '未戴']
    ];
    slots.innerHTML = rows.map(([k, v]) => `<div class="p-2 rounded-lg bg-zinc-950 border border-zinc-700"><div class="text-zinc-500">${k}</div><div class="text-amber-200 font-bold">${v}</div></div>`).join('');
  }
  const box = document.getElementById('mallCatalog') || document.getElementById('gearCatalog');
  if (!box) return;
  box.innerHTML = CATALOG.filter((c) => c.lock !== 'positive').map((c) => {
    const own = gameState.outfit.owned.includes(c.id);
    const on = c.slot === 'mask' ? (gameState.hasMaskOn === c.on) : (c.slot === 'gender' ? gameState.outfit.gender === c.gender : gameState.outfit[c.slot] === c.id);
    return `<button data-id="${c.id}" class="w-full text-left px-3 py-2 rounded-lg bg-zinc-950 border ${on ? 'border-amber-400' : 'border-zinc-700'} text-xs">
      <b class="text-zinc-100">${c.name}</b>
      <span class="text-zinc-400"> · ${own ? '已拥有' : '¥' + c.price}${on ? ' · 穿着中' : ''}</span>
    </button>`;
  }).join('');
  box.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      buyOutfit(b.dataset.id);
      renderOutfitShop();
    };
  });
}
