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
  paintShop
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

function drawLandmarkProp(ctx, item, itemY) {
  const id = item.id;
  const x = item.x;
  const w = item.width;
  const h = item.height;
  if (id.includes('door') || id.includes('exit') || id.includes('lift') || id.includes('gate') || id === 'off_stair' || id === 'club_to_metro' || id === 'hosp_to_metro' || id === 'metro_transfer' || id === 'bus_back' || id === 'river_bus' || id === 'river_gate') {
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x, itemY, w, h, 6);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x + 10, itemY + 18, w - 20, h - 36);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x + w - 14, itemY + h * 0.55, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (id.includes('seat') || id.includes('bench') || id === 'hosp_iv' || id === 'hosp_queue' || id === 'club_vip' || id === 'off_desk') {
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x, FLOOR_Y - 20, w, 12);
    ctx.fillStyle = '#a8a29e';
    roundRect(ctx, x + 6, FLOOR_Y - 38, w - 12, 18, 4);
    ctx.fill();
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
    const label = item.name;
    const tw = Math.min(220, ctx.measureText(label).width + 16);
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

function drawSimBody(ctx, x, y, opt) {
  const f = opt.facing || 1;
  const bob = opt.bob || 0;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (opt.pose === 'lie') {
    ctx.fillStyle = opt.pants;
    ctx.fillRect(x - 30, y - 20, 40, 12);
    ctx.fillStyle = opt.shirt;
    ctx.fillRect(x - 6, y - 26, 32, 16);
    ctx.fillStyle = opt.skin;
    ctx.beginPath();
    ctx.arc(x + 28, y - 18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = opt.hair;
    ctx.fillRect(x + 20, y - 28, 16, 8);
    return;
  }
  ctx.fillStyle = opt.pants;
  ctx.fillRect(x - 8, y - 24, 6, 24 + bob);
  ctx.fillRect(x + 2, y - 24, 6, 24 - bob);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 8, y - 4 + bob, 6, 5);
  ctx.fillRect(x + 2, y - 4 - bob, 6, 5);
  ctx.fillStyle = opt.shirt;
  roundRect(ctx, x - 12, y - 54, 24, 32, 4);
  ctx.fill();
  ctx.fillStyle = opt.skin;
  ctx.fillRect(x - 16, y - 48, 6, 16);
  ctx.fillRect(x + 10, y - 48, 6, 16);
  if (opt.pose === 'work') {
    ctx.fillRect(x + f * 12, y - 44, 16, 6);
  }
  ctx.fillStyle = opt.hair;
  ctx.beginPath();
  ctx.arc(x, y - 64, 11, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = opt.skin;
  ctx.beginPath();
  ctx.arc(x, y - 58, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.fillRect(x + f * 3 - 1, y - 60, 3, 3);
  if (opt.mask) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + f * 3 - 5, y - 56, 10, 7);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(x + f * 3 - 5, y - 56, 10, 7);
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
    roundRect(ctx, npc.x - tw / 2, FLOOR_Y - 96, tw, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.fillText(npc.name, npc.x, FLOOR_Y - 82);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText(npc.role, npc.x, FLOOR_Y - 70);
    if (npc.bubble && npc.bubbleT > 0) {
      const bw = Math.min(200, 24 + npc.bubble.length * 12);
      ctx.fillStyle = '#fff7ed';
      roundRect(ctx, npc.x - bw / 2, FLOOR_Y - 132, bw, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#7c2d12';
      ctx.font = '11px "Noto Sans SC"';
      ctx.fillText(npc.bubble.slice(0, 16), npc.x, FLOOR_Y - 112);
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
    pose: pose?.role === 'customer' ? 'lie' : (pose?.role === 'masseur' ? 'work' : 'walk'),
    skin: '#f2c29b',
    hair: outfitColor('hair'),
    shirt: pose?.role === 'masseur' ? '#be123c' : (gameState.isPositiveKnown ? '#b91c1c' : outfitColor('shirt')),
    pants: outfitColor('pants'),
    mask: gameState.hasMaskOn
  });
  const gem = getPlumbobColor();
  const gy = py - 90 + Math.sin(Date.now() / 280) * 3;
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
    roundRect(ctx, px - 74, py - 152, 148, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#44403c';
    ctx.font = '11px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText(thought.slice(0, 16), px, py - 131);
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
