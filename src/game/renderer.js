/**
 * 渲染系统 - 场景绘制
 * 负责游戏世界的视觉渲染
 */

import { player } from '../game/player.js';
import { FLOOR_Y } from '../data/landmarks.js';
import { getActiveLandmarks, getWorldWidth, getActiveMap } from '../systems/mapSystem.js';
import { gameState } from '../data/gameState.js';
import { livingNpcs } from '../systems/npcInteractSystem.js';
import { getPlumbobColor, getThought, getTimeOfDayPalette } from '../systems/simsLifeSystem.js';
import { getPlayerParlorPose, BEDS } from '../systems/massageParlorSystem.js';

export let cameraX = 0;
export const splashes = [];
export const rainDrops = [];
export const dynamicNPCs = [];

/**
 * 初始化雨滴
 */
export function initRain(canvasWidth, canvasHeight) {
  for (let i = 0; i < 120; i++) {
    rainDrops.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      speed: 8 + Math.random() * 5,
      len: 12 + Math.random() * 8
    });
  }
}

/**
 * 初始化动态NPC
 */
export function initNPCs() {
  // 外卖骑手
  dynamicNPCs.push({
    type: 'scooter',
    brand: 'meituan',
    x: 1200,
    yOffset: -60,
    speed: 4.2,
    dir: 1
  });

  // 防护服工作人员
  dynamicNPCs.push({
    type: 'hazmat',
    x: 1500,
    speed: 0.8,
    dir: 1,
    minX: 1300,
    maxX: 1900,
    shout: '请保持一米线距离'
  });

  // 咳嗽行人
  dynamicNPCs.push({
    type: 'pedestrian',
    x: 2400,
    speed: 1.2,
    dir: -1,
    minX: 2200,
    maxX: 2800,
    coughTimer: 0
  });
}

/**
 * 渲染远景天空
 */
export function renderFarSky(ctx, canvas) {
  const pal = getTimeOfDayPalette();
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (gameState.lockdownLevel >= 3) {
    grad.addColorStop(0, '#130e15');
    grad.addColorStop(0.5, '#1e1b26');
    grad.addColorStop(1, '#2c1920');
  } else {
    grad.addColorStop(0, pal.sky0);
    grad.addColorStop(0.55, pal.sky1);
    grad.addColorStop(1, pal.sky2);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = pal.light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 远处月亮
  ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.75, 75, 45, 0, Math.PI * 2);
  ctx.fill();

  // 视差1：远处高楼剪影 (0.15x)
  const farOffset = cameraX * 0.15;
  ctx.fillStyle = '#10131a';
  for (let bx = -60; bx <= canvas.width + 60; bx += 85) {
    const worldX = bx + farOffset;
    const bHeight = 155 + Math.sin(worldX * 0.005) * 55 + Math.cos(worldX * 0.01) * 35;
    ctx.fillRect(bx, FLOOR_Y - bHeight, 70, bHeight);

    if (Math.floor(worldX / 85) % 2 === 0) {
      ctx.fillStyle = (Date.now() % 1000 > 500) ? '#ef4444' : '#581c1c';
      ctx.fillRect(bx + 33, FLOOR_Y - bHeight - 8, 4, 8);
      ctx.fillStyle = '#10131a';
    }
  }

  // 视差2：中景高架桥 (0.32x)
  const midOffset = cameraX * 0.32;
  ctx.fillStyle = '#181b22';
  for (let mx = -80; mx <= canvas.width + 80; mx += 110) {
    const worldMX = mx + midOffset;
    const mHeight = 90 + Math.sin(worldMX * 0.007) * 30;
    ctx.fillRect(mx, FLOOR_Y - mHeight, 95, mHeight);
  }

  // 封控探照灯
  if (gameState.lockdownLevel >= 2) {
    const t = Date.now() * 0.0012;
    const beamX = (canvas.width * 0.45) + Math.sin(t) * 140;
    const searchLight = ctx.createRadialGradient(beamX, 20, 5, beamX + Math.sin(t) * 90, FLOOR_Y, 220);
    searchLight.addColorStop(0, gameState.lockdownLevel === 3 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(56, 189, 248, 0.12)');
    searchLight.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = searchLight;
    ctx.beginPath();
    ctx.moveTo(beamX, 10);
    ctx.lineTo(beamX - 180 + Math.sin(t) * 70, FLOOR_Y);
    ctx.lineTo(beamX + 180 + Math.sin(t) * 70, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * 渲染中景世界
 */
export function renderMidgroundWorld(ctx, canvas) {
  ctx.save();
  ctx.translate(-cameraX, 0);
  const w = getWorldWidth();
  const theme = getActiveMap().theme;

  if (theme === 'metro') renderMetroInterior(ctx, w);
  else if (theme === 'bus') renderBusInterior(ctx, w);
  else if (theme === 'club') renderClubInterior(ctx, w);
  else if (theme === 'hospital') renderHospitalInterior(ctx, w);
  else if (theme === 'office') renderOfficeInterior(ctx, w);
  else if (theme === 'river') renderRiverInterior(ctx, w);
  else renderStreetGround(ctx, w);

  renderStreetNPCs(ctx);
  renderLandmarks(ctx);
  renderSplashes(ctx);
  renderPlayer(ctx);
  ctx.restore();
}

function renderStreetGround(ctx, w) {
  ctx.fillStyle = '#1c1f26';
  ctx.fillRect(0, FLOOR_Y, w, 140);
  ctx.fillStyle = '#14161d';
  ctx.fillRect(0, FLOOR_Y + 45, w, 95);
  for (let px = 850; px < w; px += 340) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath();
    ctx.ellipse(px + 40, FLOOR_Y + 30, 65, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e2e8f0';
  for (let rx = 30; rx < w; rx += 85) ctx.fillRect(rx, FLOOR_Y + 80, 42, 4);
  renderSceneBuildings(ctx);
}

function renderMetroInterior(ctx, w) {
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 40, w, FLOOR_Y + 140);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 70, w, 28);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(0, 96, w, 3);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, FLOOR_Y, w, 24);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, FLOOR_Y + 24, w, 120);
  for (let x = 20; x < w; x += 240) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, 110, 14, FLOOR_Y - 110);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(x + 7, 150, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 7, 160);
    ctx.lineTo(x + 7, 210);
    ctx.stroke();
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(x + 40, 125, 100, 78);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(x + 48, 133, 84, 62);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 150, FLOOR_Y - 52, 78, 18);
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 156, FLOOR_Y - 70, 66, 20);
  }
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px "Noto Sans SC"';
  ctx.fillText('地铁 10号线  车厢内  ·  下一站：写字楼 / 医院', 160, 88);
}

function renderBusInterior(ctx, w) {
  ctx.fillStyle = '#292017';
  ctx.fillRect(0, 50, w, FLOOR_Y + 140);
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 58, w, 36);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('126路  朝阳里 → 医院 → 江边围挡 → 夜店巷', 150, 82);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(0, FLOOR_Y, w, 18);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, FLOOR_Y + 18, w, 122);
  for (let x = 40; x < w; x += 150) {
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(x, 110, 64, 52);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(x, 110, 64, 52);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(x + 72, FLOOR_Y - 50, 62, 16);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x + 76, FLOOR_Y - 68, 54, 20);
  }
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(240, 100, 70, 90);
  ctx.fillStyle = '#fef3c7';
  ctx.font = '11px "Noto Sans SC"';
  ctx.fillText('司机', 255, 150);
}

function renderClubInterior(ctx, w) {
  const pulse = 0.35 + Math.sin(Date.now() / 180) * 0.2;
  ctx.fillStyle = '#12010c';
  ctx.fillRect(0, 40, w, FLOOR_Y + 140);
  ctx.fillStyle = `rgba(236,72,153,${pulse})`;
  ctx.fillRect(0, 48, w, 22);
  ctx.fillStyle = '#f5d0fe';
  ctx.font = 'bold 20px "Noto Sans SC"';
  ctx.fillText('NEON  午夜俱乐部', 780, 66);
  ctx.fillStyle = `rgba(56,189,248,${0.18 + Math.cos(Date.now() / 140) * 0.12})`;
  ctx.fillRect(720, 100, 380, FLOOR_Y - 110);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? `rgba(244,114,182,${0.15 + pulse * 0.2})` : `rgba(34,211,238,${0.12})`;
    ctx.fillRect(740 + i * 42, FLOOR_Y - 20 - Math.sin(Date.now() / 120 + i) * 18, 18, 18);
  }
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(300, FLOOR_Y - 70, 200, 70);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(310, FLOOR_Y - 62, 180, 24);
  ctx.fillStyle = '#f5d0fe';
  ctx.font = 'bold 13px "Noto Sans SC"';
  ctx.fillText('BAR  吧台', 360, FLOOR_Y - 46);
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, FLOOR_Y, w, 140);
  for (let x = 0; x < w; x += 36) {
    ctx.fillStyle = x % 72 === 0 ? '#1f2937' : '#0a0a0a';
    ctx.fillRect(x, FLOOR_Y, 36, 10);
  }
}

function renderHospitalInterior(ctx, w) {
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(0, 50, w, FLOOR_Y + 140);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(0, 50, w, 36);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('发热门诊走廊  ·  请沿黄线排队  ·  保持一米', 160, 74);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 86, w, FLOOR_Y - 86);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, FLOOR_Y - 8, w, 8);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, FLOOR_Y, w, 140);
  for (let x = 80; x < w; x += 90) {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, FLOOR_Y - 8);
    ctx.lineTo(x + 40, FLOOR_Y - 8);
    ctx.stroke();
  }
  for (let x = 280; x < w; x += 260) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, FLOOR_Y - 44, 56, 44);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 6, FLOOR_Y - 38, 44, 10);
  }
}

function renderOfficeInterior(ctx, w) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 50, w, FLOOR_Y + 140);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 50, w, 32);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px "Noto Sans SC"';
  ctx.fillText('写字楼 23F  市场部  ·  今日全勤打卡', 180, 72);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, FLOOR_Y, w, 140);
  for (let x = 180; x < w - 160; x += 190) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, FLOOR_Y - 78, 168, 78);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(x + 10, FLOOR_Y - 68, 78, 48);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x + 16, FLOOR_Y - 62, 66, 36);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 98, FLOOR_Y - 44, 52, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 108, FLOOR_Y - 72, 28, 18);
  }
}

function renderRiverInterior(ctx, w) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR_Y + 80);
  g.addColorStop(0, '#0b1a2e');
  g.addColorStop(0.45, '#1e3a5f');
  g.addColorStop(1, '#0f172a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, FLOOR_Y + 140);
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(0, FLOOR_Y + 28, w, 90);
  ctx.fillStyle = 'rgba(125,211,252,0.25)';
  ctx.fillRect(0, FLOOR_Y + 20, w, 16);
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, FLOOR_Y, w, 22);
  for (let x = 0; x < w; x += 88) {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x, 118, 72, FLOOR_Y - 150);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(x + 10, 132, 52, 10);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('禁止', x + 18, 210);
    ctx.fillText('聚集', x + 18, 226);
  }
}

/**
 * 渲染场景建筑
 */
function signboard(ctx, x, y, w, bg, fg, text) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, 26);
  ctx.fillStyle = fg;
  ctx.font = 'bold 13px "Noto Sans SC"';
  ctx.fillText(text, x + 8, y + 18);
}

function windowGrid(ctx, x, y, cols, rows, cw, ch, lit) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = lit && ((c + r) % 3 !== 0) ? '#fde68a' : '#0f172a';
      ctx.fillRect(x + c * (cw + 6), y + r * (ch + 6), cw, ch);
    }
  }
}

function renderSceneBuildings(ctx) {
  ctx.fillStyle = '#3f2f28';
  ctx.fillRect(10, 120, 760, FLOOR_Y - 120);
  ctx.fillStyle = '#292524';
  ctx.fillRect(10, 108, 760, 14);
  signboard(ctx, 40, 122, 200, '#7c2d12', '#fed7aa', '出租单间  卧室');
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(40, 165, FLOOR_Y ? 200 : 200, FLOOR_Y - 175);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(50, FLOOR_Y - 55, 110, 18);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(62, FLOOR_Y - 72, 86, 22);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(230, FLOOR_Y - 78, 58, 42);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(236, FLOOR_Y - 72, 46, 30);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(330, FLOOR_Y - 70, 90, 14);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(338, FLOOR_Y - 92, 52, 28);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(344, FLOOR_Y - 86, 40, 18);
  ctx.fillStyle = '#155e75';
  ctx.fillRect(450, 175, 78, FLOOR_Y - 175);
  ctx.fillStyle = '#67e8f9';
  ctx.fillRect(462, 190, 22, 50);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(540, FLOOR_Y - 95, 90, 95);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(552, FLOOR_Y - 70, 66, 18);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(570, FLOOR_Y - 86, 16, 16);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(730, 168, 28, FLOOR_Y - 168);
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(748, 250, 5, 0, Math.PI * 2);
  ctx.fill();
  signboard(ctx, 620, 128, 130, '#44403c', '#fef3c7', '防盗门 →');

  ctx.fillStyle = '#44403c';
  ctx.fillRect(980, FLOOR_Y - 70, 130, 12);
  ctx.fillRect(992, FLOOR_Y - 58, 10, 58);
  ctx.fillRect(1088, FLOOR_Y - 58, 10, 58);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(1004, FLOOR_Y - 58, 28, 18);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(1040, FLOOR_Y - 58, 28, 18);
  signboard(ctx, 980, FLOOR_Y - 96, 130, '#78350f', '#fed7aa', '无接触货架');

  if (gameState.lockdownLevel >= 2) {
    for (let bx = 900; bx <= 960; bx += 30) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, FLOOR_Y - 55, 28, 55);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 4, FLOOR_Y - 40, 20, 6);
      ctx.fillRect(bx + 4, FLOOR_Y - 22, 20, 6);
    }
  }

  ctx.fillStyle = '#134e4a';
  ctx.fillRect(1680, 145, 200, FLOOR_Y - 145);
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(1680, 145, 200, 32);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px "Noto Sans SC"';
  ctx.fillText('地铁 10号线', 1708, 167);
  ctx.fillStyle = '#115e59';
  ctx.fillRect(1755, 200, 50, FLOOR_Y - 200);
  ctx.fillStyle = '#5eead4';
  ctx.fillRect(1763, 230, 34, 50);
  windowGrid(ctx, 1694, 190, 3, 2, 22, 18, true);

  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(1920, 210, 150, FLOOR_Y - 210);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(1920, 210, 150, 10);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(1968, 250, 8, 70);
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(1940, 228, 110, 18);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 12px "Noto Sans SC"';
  ctx.fillText('公交 126路', 1952, 242);

  ctx.fillStyle = '#14532d';
  ctx.fillRect(2140, FLOOR_Y - 28, 110, 28);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(2160, FLOOR_Y - 48, 8, 22);
  ctx.fillRect(2210, FLOOR_Y - 56, 8, 30);
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(2205, FLOOR_Y - 14, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdba74';
  ctx.beginPath();
  ctx.arc(2216, FLOOR_Y - 22, 6, 0, Math.PI * 2);
  ctx.fill();
  signboard(ctx, 2140, FLOOR_Y - 78, 90, '#14532d', '#bbf7d0', '阿花');

  ctx.fillStyle = '#14532d';
  ctx.fillRect(2560, 130, 210, FLOOR_Y - 130);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(2560, 130, 210, 34);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px "Noto Sans SC"';
  ctx.fillText('💊 老百姓大药房', 2578, 153);
  windowGrid(ctx, 2580, 178, 4, 3, 26, 22, true);
  ctx.fillStyle = '#166534';
  ctx.fillRect(2638, 250, 48, FLOOR_Y - 250);

  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(3080, 128, 210, FLOOR_Y - 128);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(3080, 128, 210, 34);
  ctx.fillStyle = '#fff';
  ctx.fillText('🏪 全家 24H', 3118, 151);
  windowGrid(ctx, 3100, 176, 4, 3, 26, 22, true);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(3160, 248, 50, FLOOR_Y - 248);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(3100, FLOOR_Y - 36, 40, 20);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(3148, FLOOR_Y - 36, 40, 20);

  ctx.fillStyle = '#4c0519';
  ctx.fillRect(3380, 118, 540, FLOOR_Y - 118);
  ctx.fillStyle = '#9f1239';
  ctx.fillRect(3380, 118, 540, 36);
  ctx.fillStyle = '#fecdd3';
  ctx.font = 'bold 18px "Noto Sans SC"';
  ctx.fillText('林记推拿馆  MASSAGE', 3525, 143);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(3610, 170, 64, FLOOR_Y - 170);
  for (const bed of BEDS) {
    ctx.fillStyle = '#292524';
    ctx.fillRect(bed.x - 50, FLOOR_Y - 34, 100, 20);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(bed.x - 44, FLOOR_Y - 42, 88, 14);
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(bed.x - 40, FLOOR_Y - 48, 30, 10);
  }

  ctx.fillStyle = '#3b0764';
  ctx.fillRect(3960, 110, 240, FLOOR_Y - 110);
  ctx.fillStyle = '#a21caf';
  ctx.fillRect(3960, 110, 240, 36);
  ctx.fillStyle = '#f5d0fe';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('NEON 夜店后门', 3992, 134);
  const pulse = 0.4 + Math.sin(Date.now() / 160) * 0.3;
  ctx.fillStyle = `rgba(244,114,182,${pulse})`;
  ctx.fillRect(4040, 160, 80, 70);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(4055, 250, 50, FLOOR_Y - 250);

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(4420, 128, 200, FLOOR_Y - 128);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(4420, 128, 200, 32);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px "Noto Sans SC"';
  ctx.fillText('🏥 发热门诊接驳', 4436, 150);
  windowGrid(ctx, 4440, 176, 3, 3, 28, 22, true);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(4420, FLOOR_Y - 10, 200, 6);

  ctx.fillStyle = '#334155';
  ctx.fillRect(4720, FLOOR_Y - 78, 190, 78);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(4768, FLOOR_Y - 118, 70, 42);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(4750, FLOOR_Y - 8, 16, 0, Math.PI * 2);
  ctx.arc(4888, FLOOR_Y - 8, 16, 0, Math.PI * 2);
  ctx.fill();
  signboard(ctx, 4740, FLOOR_Y - 148, 150, '#0e7490', '#e0f2fe', '雾炮消杀车');
}

/**
 * 渲染地标
 */
function drawLandmarkProp(ctx, item, itemY) {
  const id = item.id;
  const x = item.x;
  const w = item.width;
  const h = item.height;
  if (id.includes('door') || id.includes('exit') || id.includes('lift') || id.includes('gate') || id === 'off_stair' || id === 'club_to_metro' || id === 'hosp_to_metro' || id === 'metro_transfer' || id === 'bus_back' || id === 'river_bus' || id === 'river_gate') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, itemY, w, h);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(x + 8, itemY + 20, w - 16, h - 40);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + w - 16, itemY + h / 2, 8, 8);
    return;
  }
  if (id.includes('seat') || id.includes('bench') || id === 'hosp_iv' || id === 'hosp_queue' || id === 'club_vip' || id === 'off_desk') {
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x, FLOOR_Y - 22, w, 14);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x + 8, FLOOR_Y - 38, w - 16, 16);
    return;
  }
  if (id.includes('pole') || id.includes('stand')) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + w / 2 - 4, itemY, 8, h);
    ctx.beginPath();
    ctx.arc(x + w / 2, itemY + 16, 12, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (id === 'home_bed') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, itemY + 25, w, 20);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 10, itemY + 12, w - 20, 20);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 14, itemY + 8, 28, 12);
    return;
  }
  if (id === 'club_bar' || id === 'club_dj' || id === 'off_print' || id === 'metro_screen' || id === 'metro_code' || id === 'bus_driver' || id === 'hosp_triage' || id === 'hosp_pharmacy' || id === 'off_water' || id === 'off_boss' || id === 'river_vendor' || id === 'club_dance') {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, itemY + h * 0.35, w, h * 0.65);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, itemY, w, 18);
  }
}

function renderLandmarks(ctx) {
  getActiveLandmarks().forEach(item => {
    const itemY = FLOOR_Y - item.height;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(item.x + item.width / 2, FLOOR_Y + 2, item.width * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    drawLandmarkProp(ctx, item, itemY);
    const cx = item.x + item.width / 2;
    const near = gameState.nearbyItem === item;
    ctx.textAlign = 'center';
    ctx.font = near ? 'bold 13px "Noto Sans SC"' : 'bold 11px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(cx - 70, itemY - 28, 140, 20);
    ctx.fillStyle = near ? '#fde68a' : '#e2e8f0';
    ctx.fillText(item.name, cx, itemY - 14);
    ctx.textAlign = 'left';
    if (near) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(item.x - 6, itemY - 6, item.width + 12, item.height + 12);
    }
  });
}

/**
 * 渲染NPC
 */
function drawSimBody(ctx, x, y, opt) {
  const f = opt.facing || 1;
  const bob = opt.bob || 0;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  if (opt.pose === 'lie') {
    ctx.fillStyle = opt.pants;
    ctx.fillRect(x - 28, y - 18, 36, 10);
    ctx.fillStyle = opt.shirt;
    ctx.fillRect(x - 8, y - 22, 28, 14);
    ctx.fillStyle = opt.skin;
    ctx.beginPath();
    ctx.arc(x + 24, y - 16, 8, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = opt.pants;
  ctx.fillRect(x - 7, y - 22, 5, 22 + bob);
  ctx.fillRect(x + 2, y - 22, 5, 22 - bob);
  ctx.fillStyle = opt.shirt;
  ctx.fillRect(x - 10, y - 50, 20, 30);
  if (opt.pose === 'work') {
    ctx.fillStyle = opt.skin;
    ctx.fillRect(x + f * 10, y - 42, 14, 5);
  }
  ctx.fillStyle = opt.hair;
  ctx.fillRect(x - 9, y - 68, 18, 8);
  ctx.fillStyle = opt.skin;
  ctx.beginPath();
  ctx.arc(x, y - 56, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.fillRect(x + f * 3 - 1, y - 58, 3, 3);
  if (opt.mask) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + f * 3 - 4, y - 54, 8, 6);
  }
}

function renderStreetNPCs(ctx) {
  dynamicNPCs.forEach(npc => {
    if (npc.type === 'scooter') {
      const sy = FLOOR_Y + npc.yOffset;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(npc.x - 14, sy + 6, 7, 0, Math.PI * 2);
      ctx.arc(npc.x + 14, sy + 6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = npc.brand === 'meituan' ? '#f59e0b' : '#0284c7';
      ctx.fillRect(npc.x - 12, sy - 8, 26, 10);
    }
  });
  livingNpcs.forEach((npc) => {
    const bob = npc.pose === 'walk' ? Math.sin(npc.anim) * 3 : 0;
    drawSimBody(ctx, npc.x, FLOOR_Y, {
      facing: npc.dir,
      bob,
      pose: npc.pose,
      skin: npc.skin,
      hair: npc.hair,
      shirt: npc.shirt,
      pants: npc.pants,
      mask: npc.job === 'official' || npc.job === 'courier'
    });
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, FLOOR_Y - 78);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText(npc.role, npc.x, FLOOR_Y - 66);
    if (npc.bubble && npc.bubbleT > 0) {
      const w = Math.min(160, 20 + npc.bubble.length * 11);
      ctx.fillStyle = '#fff7ed';
      roundRect(ctx, npc.x - w / 2, FLOOR_Y - 118, w, 28, 8);
      ctx.fill();
      ctx.fillStyle = '#7c2d12';
      ctx.font = '11px "Noto Sans SC"';
      ctx.fillText(npc.bubble, npc.x, FLOOR_Y - 100);
    }
    ctx.textAlign = 'left';
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 渲染水花
 */
function renderSplashes(ctx) {
  splashes.forEach(sp => {
    ctx.strokeStyle = `rgba(186, 230, 253, ${sp.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, sp.radius * 1.6, sp.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/**
 * 渲染玩家
 */
function renderPlayer(ctx) {
  const pose = getPlayerParlorPose();
  const px = pose ? pose.room.x + (pose.role === 'masseur' ? 22 : 0) : player.x;
  const py = player.y;
  const bob = player.isMoving && !pose ? Math.sin(player.walkCycle) * 5 : (pose?.role === 'masseur' ? Math.sin(Date.now() / 120) * 3 : 0);
  drawSimBody(ctx, px, py, {
    facing: player.facing,
    bob,
    pose: pose?.role === 'customer' ? 'lie' : (pose?.role === 'masseur' ? 'work' : 'walk'),
    skin: '#f2c29b',
    hair: '#1e293b',
    shirt: pose?.role === 'masseur' ? '#be123c' : (gameState.isPositiveKnown ? '#b91c1c' : '#2563eb'),
    pants: '#111827',
    mask: gameState.hasMaskOn
  });
  const gem = getPlumbobColor();
  const gy = py - 86 + Math.sin(Date.now() / 280) * 3;
  ctx.fillStyle = gem;
  ctx.beginPath();
  ctx.moveTo(px, gy - 10);
  ctx.lineTo(px + 7, gy);
  ctx.lineTo(px, gy + 10);
  ctx.lineTo(px - 7, gy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.stroke();
  const thought = getThought();
  if (thought) {
    ctx.fillStyle = '#fffbeb';
    roundRect(ctx, px - 70, py - 148, 140, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#44403c';
    ctx.font = '11px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText(thought.slice(0, 16), px, py - 127);
    ctx.textAlign = 'left';
  }
  if (pose) {
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(pose.room.x - 40, py + 10, 80 * pose.progress, 5);
  }
  if (gameState.bodyTemp >= 38.0) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.beginPath();
    ctx.arc(px, py - 40, 24, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 更新相机位置
 */
export function updateCamera(canvas) {
  const targetCam = player.x - canvas.width / 2;
  cameraX += (targetCam - cameraX) * 0.08;
  cameraX = Math.max(0, Math.min(getWorldWidth() - canvas.width, cameraX));
  window.cameraX = cameraX;
}

/**
 * 渲染雨滴前景
 */
export function renderRainForeground(ctx, canvas) {
  const theme = getActiveMap().theme;
  if (theme === 'metro' || theme === 'bus' || theme === 'office' || theme === 'hospital') return;
  if (theme === 'club') {
    ctx.fillStyle = `rgba(236,72,153,${0.08 + Math.sin(Date.now() / 200) * 0.05})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  rainDrops.forEach(drop => {
    drop.y += drop.speed;
    drop.x -= 4;
    if (drop.y > canvas.height) {
      drop.y = -20;
      drop.x = Math.random() * canvas.width;
    }
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 3, drop.y + drop.len);
  });
  ctx.stroke();
}
