/**
 * HUD 界面更新
 * 更新顶部状态栏显示
 */

import { gameState } from '../data/gameState.js';
import { NEED_KEYS, NEED_META, getNeed, getMoodScore } from '../systems/simsLifeSystem.js';
import { getActiveQuests } from '../systems/questSystem.js';
import { getStatsLines } from '../systems/statsSystem.js';

/**
 * 更新所有 HUD 元素
 */
export function updateHUD() {
  updateClock();
  updateResources();
  updateVitals();
  updateMaskState();
  updateHealthCode();
  updateZoneTag();
  updateSimsPanel();
}

/**
 * 更新时钟显示
 */
function updateClock() {
  const clockDisplay = document.getElementById('clockDisplay');
  if (!clockDisplay) return;

  const mm = gameState.minute < 10 ? `0${gameState.minute}` : gameState.minute;
  const hh = gameState.hour < 10 ? `0${gameState.hour}` : gameState.hour;
  clockDisplay.innerText = `第 ${gameState.day} 天 · ${hh}:${mm}`;
}

/**
 * 更新资源显示
 */
function updateResources() {
  const elements = {
    resMoney: gameState.money.toLocaleString(),
    resRawFood: gameState.rawFood,
    resInstantFood: gameState.instantFood,
    resPills: gameState.pillsCount,
    resKits: gameState.antigenKits,
    resReputation: gameState.reputation
  };

  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  });
}

/**
 * 更新生理指标显示
 */
function updateVitals() {
  const vitals = {
    barHunger: `${Math.round(gameState.hunger)}%`,
    barEnergy: `${Math.round(gameState.energy)}%`,
    barSanity: `${Math.round(gameState.sanity)}%`,
    barTemp: `${gameState.bodyTemp.toFixed(1)}°C`
  };

  Object.entries(vitals).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  });

  // 根据理智值更新颜色和动画
  updateSanityColor();
}

/**
 * 根据理智值更新显示颜色
 */
function updateSanityColor() {
  const sanityBar = document.getElementById('barSanity');
  if (!sanityBar) return;

  const sanity = gameState.sanity;
  let colorClass = 'text-blue-400'; // 默认正常

  if (sanity < 10) {
    colorClass = 'text-red-500 animate-pulse'; // 崩溃
  } else if (sanity < 30) {
    colorClass = 'text-orange-500'; // 濒临崩溃
  } else if (sanity < 50) {
    colorClass = 'text-yellow-500'; // 焦虑
  } else if (sanity >= 80) {
    colorClass = 'text-green-400'; // 良好
  }

  sanityBar.className = `text-xs font-code font-bold ${colorClass}`;
}

/**
 * 更新口罩状态显示
 */
function updateMaskState() {
  const txtMaskState = document.getElementById('txtMaskState');
  const btnToggleMask = document.getElementById('btnToggleMask');

  if (txtMaskState) {
    txtMaskState.innerText = gameState.hasMaskOn ? '已戴 N95' : '未佩戴口罩';
  }

  if (btnToggleMask) {
    btnToggleMask.className = gameState.hasMaskOn
      ? 'px-2 py-0.5 rounded text-xs font-bold border border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 flex items-center gap-1 transition'
      : 'px-2 py-0.5 rounded text-xs font-bold border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 flex items-center gap-1 transition animate-pulse';
  }
}

/**
 * 更新健康码显示
 */
function updateHealthCode() {
  const badge = document.getElementById('badgeCovidStatus');
  const txt = document.getElementById('txtCovid');
  const dot = document.getElementById('statusDot');
  const feverFX = document.getElementById('feverFX');

  if (gameState.isPositiveKnown) {
    if (badge) {
      badge.className = 'px-2 py-0.5 rounded text-xs font-bold border border-rose-500/60 bg-rose-950/60 text-rose-300 flex items-center gap-1 animate-pulse';
    }
    if (txt) {
      txt.innerText = `🔴 红码隔离 (${gameState.quarantineDaysLeft}天)`;
    }
    if (dot) {
      dot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping';
    }
  } else {
    if (badge) {
      badge.className = 'px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 flex items-center gap-1';
    }
    if (txt) {
      txt.innerText = '🟢 48h绿码';
    }
    if (dot) {
      dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
    }
  }

  // 高烧视觉效果
  if (feverFX) {
    if (gameState.bodyTemp >= 38.5) {
      feverFX.classList.remove('hidden');
    } else {
      feverFX.classList.add('hidden');
    }
  }
}

/**
 * 更新区域标签
 */
function updateZoneTag() {
  const zTitle = document.getElementById('zoneTitle');
  if (!zTitle) return;
  const id = gameState.mapId || 'street';
  const names = {
    living: '🏠 生活区 · 朝阳里',
    street: '🏠 生活区 · 朝阳里',
    commerce: '🏪 商业区 · 北大街',
    redlight: '🔴 红灯区 · 夜巷',
    civic: '🏥 政务医疗区',
    cbd: '💼 商务办公区',
    riverside: '🌊 滨江工业区',
    metro: '🚇 地铁车厢',
    bus: '🚌 126路车厢',
    club: '🎵 夜店室内',
    hospital: '🏥 发热门诊走廊',
    office: '💼 写字楼 23F',
    mall: '🏬 朝阳汇商场',
    pharmacyIn: '💊 药房店内',
    storeIn: '🏪 全家店内',
    home: '🛏️ 出租屋室内',
    parlorIn: '💆 推拿馆内',
    hotel: '🏨 钟点房',
    ktv: '🎤 KTV包厢',
    committee: '⛺ 居委会帐篷',
    lobby: '🏢 写字楼大堂'
  };
  zTitle.innerText = names[id] || names.street;
  const nearby = gameState.nearbyItem;
  if (nearby?.zone) zTitle.innerText = `${names[id] || ''} · ${nearby.zone}`;
}

/**
 * 更新时钟速度按钮状态
 */
function updateSimsPanel() {
  const bars = document.getElementById('needBars');
  const moodEl = document.getElementById('moodScoreLabel');
  const wantsEl = document.getElementById('wantList');
  const moodletsEl = document.getElementById('moodletRow');
  if (!bars || !gameState.sims) return;

  const mood = Math.round(getMoodScore());
  if (moodEl) moodEl.innerText = `心情 ${mood}`;

  bars.innerHTML = NEED_KEYS.map((key) => {
    const meta = NEED_META[key];
    const val = Math.round(getNeed(key));
    const color = val < 25 ? '#f43f5e' : val < 50 ? '#f59e0b' : meta.color;
    return `<div class="flex items-center gap-1.5">
      <span class="w-8 shrink-0">${meta.icon}</span>
      <div class="need-bar flex-1"><i style="width:${val}%;background:${color}"></i></div>
      <span class="w-7 text-right font-code">${val}</span>
    </div>`;
  }).join('');

  if (wantsEl) {
    const wants = gameState.sims.wants || [];
    wantsEl.innerHTML = wants.length
      ? wants.map((w) => `<li>${w.done ? '✅' : '💎'} ${w.text}</li>`).join('')
      : '<li>今天没有特别想做的事</li>';
  }

  if (moodletsEl) {
    moodletsEl.innerHTML = (gameState.sims.moodlets || []).slice(0, 4).map((m) =>
      `<span class="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[9px]">${m.icon} ${m.label}</span>`
    ).join('');
  }
  const qEl = document.getElementById('questList');
  if (qEl) {
    const qs = getActiveQuests();
    qEl.innerHTML = qs.length ? qs.map((q) => `<li>${q.done ? '✅' : '☐'} ${q.title}</li>`).join('') : '<li>暂无</li>';
  }
  const st = document.getElementById('statsMini');
  if (st) st.innerText = getStatsLines().slice(0, 6).join(' · ');
}

export function updateClockButtons() {
  const buttons = {
    btnPauseTime: gameState.timeSpeed === 0,
    btnSpeed1: gameState.timeSpeed === 1,
    btnSpeed2: gameState.timeSpeed === 3
  };

  Object.entries(buttons).forEach(([id, isActive]) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    if (id === 'btnPauseTime') {
      btn.className = isActive
        ? 'px-1.5 py-0.5 bg-amber-600 text-black font-bold rounded'
        : 'px-1.5 py-0.5 hover:bg-zinc-700 rounded text-zinc-300 font-bold';
    } else {
      btn.className = isActive
        ? 'px-2 py-0.5 bg-amber-600 text-black font-bold rounded'
        : 'px-2 py-0.5 hover:bg-zinc-700 rounded text-zinc-300 font-bold';
    }
  });
}
