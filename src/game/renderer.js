import { player } from '../game/player.js';
import { FLOOR_Y } from '../data/landmarks.js';
import { getActiveLandmarks, getWorldWidth, getActiveMap } from '../systems/mapSystem.js';
import { gameState } from '../data/gameState.js';
import { livingNpcs } from '../systems/npcInteractSystem.js';
import { getPlumbobColor, getThought, getTimeOfDayPalette } from '../systems/simsLifeSystem.js';
import { outfitColor } from '../systems/outfitSystem.js';
import { getPlayerParlorPose } from '../systems/massageParlorSystem.js';
import {
  paintSkyline,
  paintStreet,
  paintDistrict,
  paintMetro,
  paintBus,
  paintClub,
  paintHospital,
  paintOffice,
  paintRiver,
  paintMall,
  paintShop,
  paintHome,
  paintParlorRoom
} from './sceneArt.js';

export let cameraX = 0;
export const splashes = [];
export const rainDrops = [];
export const dynamicNPCs = [];

export function initRain(canvasWidth, canvasHeight) {
  rainDrops.length = 0;
  for (let i = 0; i < 120; i++) {
    rainDrops.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      speed: 8 + Math.random() * 5,
      len: 12 + Math.random() * 8
    });
  }
}

export function initNPCs() {
  dynamicNPCs.length = 0;
  dynamicNPCs.push({ type: 'scooter', brand: 'meituan', x: 1200, yOffset: -60, speed: 4.2, dir: 1 });
}

export function renderFarSky(ctx, canvas) {
  const pal = getTimeOfDayPalette();
  const theme = getActiveMap().theme;
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (theme === 'metro' || theme === 'bus' || theme === 'office' || theme === 'club' || theme === 'hospital' || theme === 'mall' || theme === 'shop') {
    grad.addColorStop(0, pal.sky0);
    grad.addColorStop(1, pal.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
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
  ctx.fillStyle = 'rgba(254, 240, 138, 0.16)';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.78, 70, 42, 0, Math.PI * 2);
  ctx.fill();
  paintSkyline(ctx, canvas, cameraX, pal, gameState.lockdownLevel);
}

export function renderMidgroundWorld(ctx, canvas) {
  ctx.save();
  ctx.translate(-cameraX, 0);
  const w = getWorldWidth();
  const theme = getActiveMap().theme;
  if (theme === 'metro') paintMetro(ctx, w);
  else if (theme === 'bus') paintBus(ctx, w);
  else if (theme === 'club') paintClub(ctx, w);
  else if (theme === 'hospital') paintHospital(ctx, w);
  else if (theme === 'office') paintOffice(ctx, w);
  else if (theme === 'mall') paintMall(ctx, w);
  else if (theme === 'shop') paintShop(ctx, w);
  else if (theme === 'home') paintHome(ctx, w);
  else if (theme === 'parlor') paintParlorRoom(ctx, w);
  else paintDistrict(ctx, w, theme);

  renderStreetNPCs(ctx);
  renderLandmarks(ctx);
  renderSplashes(ctx);
  renderPlayer(ctx);
  ctx.restore();
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

function landmarkIcon(item) {
  const id = item.id;
  if (id.includes('bed') || id.includes('hotel_bed')) return '🛏️';
  if (id.includes('tv')) return '📺';
  if (id.includes('desk') || id.includes('print')) return '💻';
  if (id.includes('shower') || id.includes('bath') || id.includes('wash') || id.includes('wc')) return '🚿';
  if (id.includes('stove') || id.includes('food') || id.includes('oden') || id.includes('fridge')) return '🍳';
  if (id.includes('door') || id.includes('exit') || id.includes('gate') || id.includes('lift')) return '🚪';
  if (id.includes('metro') || id.includes('transfer')) return '🚇';
  if (id.includes('bus')) return '🚌';
  if (id.includes('mall') || id.includes('shop') || id.includes('clothes') || id.includes('fit')) return '🏬';
  if (id.includes('pharm') || id.includes('pharmacy') || id.includes('med')) return '💊';
  if (id.includes('store') || id.includes('convenience') || id.includes('market')) return '🏪';
  if (id.includes('club') || id.includes('ktv') || id.includes('dj') || id.includes('dance') || id.includes('bar')) return '🎵';
  if (id.includes('parlor') || id.includes('massage')) return '💆';
  if (id.includes('cat')) return '🐱';
  if (id.includes('rack') || id.includes('box')) return '📦';
  if (id.includes('pcr') || id.includes('triage') || id.includes('hosp') || id.includes('hospital')) return '🏥';
  if (id.includes('atm')) return '🏧';
  if (id.includes('window') || id.includes('closet')) return '👔';
  if (id.includes('cannon') || id.includes('disinfect')) return '🚛';
  if (id.includes('committee') || id.includes('comt')) return '⛺';
  if (id.includes('coffee') || id.includes('tea') || id.includes('water')) return '☕';
  return '📍';
}

function drawLandmarkProp(ctx, item, itemY) {
  const id = item.id;
  const x = item.x;
  const w = item.width;
  const h = item.height;
  if (id.includes('bed')) {
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x, FLOOR_Y - 18, w, 10);
    ctx.fillStyle = '#1d4ed8';
    roundRect(ctx, x + 8, FLOOR_Y - 36, w - 16, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 12, FLOOR_Y - 44, 28, 12);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x + 4, FLOOR_Y - 8, 8, 8);
    ctx.fillRect(x + w - 12, FLOOR_Y - 8, 8, 8);
    return;
  }
  if (id.includes('tv') || id.includes('screen')) {
    ctx.fillStyle = '#27272a';
    roundRect(ctx, x, itemY + 8, w, h - 16, 4);
    ctx.fill();
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(x + 6, itemY + 14, w - 12, h - 32);
    ctx.fillStyle = '#52525b';
    ctx.fillRect(x + w / 2 - 8, FLOOR_Y - 12, 16, 12);
    return;
  }
  if (id.includes('stove')) {
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x, FLOOR_Y - 48, w, 48);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 8, FLOOR_Y - 40, w - 16, 18);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(x + w / 2, FLOOR_Y - 52, 10, Math.PI, 0);
    ctx.fill();
    return;
  }
  if (id.includes('closet') || id.includes('wardrobe') || id.includes('fit')) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, itemY, w, h);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x + 4, itemY + 8, w / 2 - 6, h - 16);
    ctx.fillRect(x + w / 2 + 2, itemY + 8, w / 2 - 6, h - 16);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + w / 2 - 3, itemY + h / 2, 6, 6);
    return;
  }
  if (id.includes('door') || id.includes('exit') || id.includes('lift') || id.includes('gate') || id === 'off_stair' || id === 'club_to_metro' || id === 'hosp_to_metro' || id === 'metro_transfer' || id === 'bus_back' || id === 'river_bus' || id === 'river_gate') {
    ctx.fillStyle = '#334155';
    roundRect(ctx, x, itemY, w, h, 6);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x + 10, itemY + 18, (w - 24) / 2, h - 40);
    ctx.fillRect(x + w / 2 + 2, itemY + 18, (w - 24) / 2, h - 40);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x + w - 16, itemY + h * 0.55, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (id.includes('seat') || id.includes('bench') || id.includes('sofa') || id === 'hosp_iv' || id === 'hosp_queue' || id === 'club_vip' || id === 'off_desk') {
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x, FLOOR_Y - 16, w, 10);
    ctx.fillStyle = '#a8a29e';
    roundRect(ctx, x + 6, FLOOR_Y - 34, w - 12, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x + 8, FLOOR_Y - 48, 10, 16);
    ctx.fillRect(x + w - 18, FLOOR_Y - 48, 10, 16);
    return;
  }
  if (id.includes('cat')) {
    drawCat(ctx, x + w / 2, FLOOR_Y, { shirt: '#fb923c', hair: '#9a3412', bob: 0 });
    return;
  }
  if (id.includes('pole') || id.includes('stand')) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + w / 2 - 4, itemY, 8, h);
    ctx.beginPath();
    ctx.arc(x + w / 2, itemY + 16, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderLandmarks(ctx) {
  getActiveLandmarks().forEach((item) => {
    const itemY = FLOOR_Y - item.height;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(item.x + item.width / 2, FLOOR_Y + 2, item.width * 0.42, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    drawLandmarkProp(ctx, item, itemY);
    const cx = item.x + item.width / 2;
    const near = gameState.nearbyItem === item;
    ctx.textAlign = 'center';
    ctx.font = near ? 'bold 13px "Noto Sans SC"' : 'bold 12px "Noto Sans SC"';
    const label = `${landmarkIcon(item)} ${item.name}`;
    const tw = Math.min(240, ctx.measureText(label).width + 18);
    ctx.fillStyle = near ? 'rgba(120,53,15,0.92)' : 'rgba(15,23,42,0.82)';
    roundRect(ctx, cx - tw / 2, itemY - 30, tw, 20, 6);
    ctx.fill();
    ctx.fillStyle = near ? '#fde68a' : '#f8fafc';
    ctx.fillText(label, cx, itemY - 16);
    ctx.textAlign = 'left';
    if (near) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(item.x - 6, itemY - 6, item.width + 12, item.height + 12);
    }
  });
}

function npcKind(npc) {
  if (npc.job === 'cat' || /猫|阿花/.test(npc.name || '')) return 'cat';
  if (npc.gender === 'f' || npc.gender === 'm') return npc.gender;
  if (/姐|女|阿姨|护士|导购|Mia|小敏|小周|林姐|叶护士/.test(`${npc.name}${npc.role}`)) return 'f';
  return 'm';
}

function drawCat(ctx, x, y, opt) {
  const bob = Math.sin(Date.now() / 260) * 1.5;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5d0a6';
  ctx.beginPath();
  ctx.ellipse(x, y - 8 + bob, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(x - 6, y - 9 + bob, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#44403c';
  ctx.beginPath();
  ctx.ellipse(x + 7, y - 6 + bob, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.arc(x + 11, y - 18 + bob, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 22 + bob);
  ctx.lineTo(x + 4, y - 31 + bob);
  ctx.lineTo(x + 11, y - 22 + bob);
  ctx.fill();
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 22 + bob);
  ctx.lineTo(x + 18, y - 31 + bob);
  ctx.lineTo(x + 16, y - 20 + bob);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(x + 13, y - 19 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 8 + bob);
  ctx.quadraticCurveTo(x - 28, y - 24, x - 10, y - 2);
  ctx.stroke();
}

function drawSimBody(ctx, x, y, opt) {
  if (opt.kind === 'cat') {
    drawCat(ctx, x, y, opt);
    return;
  }
  const f = opt.facing || 1;
  const bob = opt.bob || 0;
  const female = opt.kind === 'f';
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (opt.pose === 'lie') {
    ctx.fillStyle = opt.pants;
    ctx.fillRect(x - 36, y - 18, 48, 11);
    ctx.fillStyle = opt.shirt;
    ctx.fillRect(x - 4, y - 24, 40, 14);
    ctx.fillStyle = opt.skin;
    ctx.beginPath();
    ctx.arc(x + 38, y - 18, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = opt.hair;
    ctx.beginPath();
    ctx.arc(x + 36, y - 24, 8, Math.PI, 0);
    ctx.fill();
    return;
  }
  const hip = y - 46;
  const shoulder = y - 86;
  const bw = female ? 10 : 13;
  ctx.fillStyle = opt.pants;
  ctx.fillRect(x - (female ? 7 : 8), hip, female ? 6 : 7, 46 + bob);
  ctx.fillRect(x + 2, hip, female ? 6 : 7, 46 - bob);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 9, y - 5 + bob, 8, 6);
  ctx.fillRect(x + 2, y - 5 - bob, 8, 6);
  ctx.fillStyle = opt.shirt;
  roundRect(ctx, x - bw, shoulder, bw * 2, 40, 5);
  ctx.fill();
  if (female) {
    ctx.beginPath();
    ctx.moveTo(x - 9, shoulder + 22);
    ctx.lineTo(x + 9, shoulder + 22);
    ctx.lineTo(x + 14, hip + 6);
    ctx.lineTo(x - 14, hip + 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = opt.skin;
  ctx.fillRect(x - bw - 4, shoulder + 8, 5, female ? 24 : 28);
  ctx.fillRect(x + bw - 1, shoulder + 8, 5, female ? 24 : 28);
  if (opt.pose === 'work') ctx.fillRect(x + f * 14, shoulder + 16, 18, 5);
  const hx = x;
  const hy = shoulder - 16;
  ctx.fillStyle = opt.hair;
  ctx.beginPath();
  ctx.ellipse(hx, hy - 4, female ? 12 : 11, female ? 10 : 9, 0, Math.PI, 0);
  ctx.fill();
  if (female) {
    ctx.fillRect(hx - 12, hy - 2, 5, 18);
    ctx.fillRect(hx + 7, hy - 2, 5, 18);
  }
  ctx.fillStyle = opt.skin;
  ctx.beginPath();
  ctx.arc(hx, hy, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = opt.hair;
  ctx.fillRect(hx - 10, hy - 6, 6, 10);
  ctx.fillStyle = '#111827';
  ctx.fillRect(hx + f * 3 - 1, hy - 2, 3, 3);
  if (opt.mask) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(hx + f * 3 - 6, hy + 1, 11, 7);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(hx + f * 3 - 6, hy + 1, 11, 7);
  }
}

function renderStreetNPCs(ctx) {
  dynamicNPCs.forEach((npc) => {
    if (npc.type === 'scooter' && (gameState.mapId || 'street') === 'street') {
      const sy = FLOOR_Y + npc.yOffset;
      npc.x += npc.speed * npc.dir;
      if (npc.x > 4800) npc.x = 800;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(npc.x - 14, sy + 8, 8, 0, Math.PI * 2);
      ctx.arc(npc.x + 16, sy + 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(npc.x - 16, sy - 10, 34, 14);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(npc.x + 10, sy - 22, 12, 12);
    }
  });
  livingNpcs.forEach((npc) => {
    const bob = npc.pose === 'walk' ? Math.sin(npc.anim) * 3 : 0;
    drawSimBody(ctx, npc.x, FLOOR_Y, {
      facing: npc.dir,
      bob,
      pose: npc.pose,
      kind: npcKind(npc),
      skin: npc.skin,
      hair: npc.hair,
      shirt: npc.shirt,
      pants: npc.pants,
      mask: npc.job === 'official' || npc.job === 'courier' || npc.job === 'nurse'
    });
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    const tw = 90;
    roundRect(ctx, npc.x - tw / 2, FLOOR_Y - 128, tw, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.fillText(npc.name, npc.x, FLOOR_Y - 114);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText(npc.role, npc.x, FLOOR_Y - 102);
    if (npc.bubble && npc.bubbleT > 0) {
      const bw = Math.min(200, 24 + npc.bubble.length * 12);
      ctx.fillStyle = '#fff7ed';
      roundRect(ctx, npc.x - bw / 2, FLOOR_Y - 164, bw, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#7c2d12';
      ctx.font = '11px "Noto Sans SC"';
      ctx.fillText(npc.bubble.slice(0, 16), npc.x, FLOOR_Y - 144);
    }
    ctx.textAlign = 'left';
  });
}

function renderSplashes(ctx) {
  splashes.forEach((sp) => {
    ctx.strokeStyle = `rgba(186, 230, 253, ${sp.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, sp.radius * 1.6, sp.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function renderPlayer(ctx) {
  const pose = getPlayerParlorPose();
  const px = pose ? pose.room.x + (pose.role === 'masseur' ? 22 : 0) : player.x;
  const py = player.y;
  const bob = player.isMoving && !pose ? Math.sin(player.walkCycle) * 5 : (pose?.role === 'masseur' ? Math.sin(Date.now() / 120) * 3 : 0);
  drawSimBody(ctx, px, py, {
    facing: player.facing,
    bob,
    kind: gameState.outfit?.gender === 'f' ? 'f' : 'm',
    pose: pose?.role === 'customer' ? 'lie' : (pose?.role === 'masseur' ? 'work' : 'walk'),
    skin: '#f2c29b',
    hair: outfitColor('hair'),
    shirt: pose?.role === 'masseur' ? '#be123c' : (gameState.isPositiveKnown ? '#b91c1c' : outfitColor('shirt')),
    pants: outfitColor('pants'),
    mask: gameState.hasMaskOn
  });
  const gem = getPlumbobColor();
  const gy = py - 118 + Math.sin(Date.now() / 280) * 3;
  ctx.fillStyle = gem;
  ctx.beginPath();
  ctx.moveTo(px, gy - 11);
  ctx.lineTo(px + 8, gy);
  ctx.lineTo(px, gy + 11);
  ctx.lineTo(px - 8, gy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.stroke();
  const thought = getThought();
  if (thought) {
    ctx.fillStyle = '#fffbeb';
    roundRect(ctx, px - 74, py - 168, 148, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#44403c';
    ctx.font = '11px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText(thought.slice(0, 16), px, py - 147);
    ctx.textAlign = 'left';
  }
  if (pose) {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(pose.room.x - 40, py + 12, 80, 6);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(pose.room.x - 40, py + 12, 80 * pose.progress, 6);
  }
}

export function updateCamera(canvas) {
  const targetCam = player.x - canvas.width / 2;
  cameraX += (targetCam - cameraX) * 0.08;
  cameraX = Math.max(0, Math.min(getWorldWidth() - canvas.width, cameraX));
  window.cameraX = cameraX;
}

export function renderRainForeground(ctx, canvas) {
  const theme = getActiveMap().theme;
  if (theme === 'metro' || theme === 'bus' || theme === 'office' || theme === 'hospital') return;
  if (theme === 'club') {
    ctx.fillStyle = `rgba(236,72,153,${0.08 + Math.sin(Date.now() / 200) * 0.05})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  rainDrops.forEach((drop) => {
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
