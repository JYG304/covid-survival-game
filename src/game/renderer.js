/**
 * 渲染系统 - 场景绘制
 * 负责游戏世界的视觉渲染
 */

import { player } from '../game/player.js';
import { landmarks, FLOOR_Y, WORLD_WIDTH } from '../data/landmarks.js';
import { gameState } from '../data/gameState.js';

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
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (gameState.lockdownLevel >= 3) {
    grad.addColorStop(0, '#130e15');
    grad.addColorStop(0.5, '#1e1b26');
    grad.addColorStop(1, '#2c1920');
  } else {
    grad.addColorStop(0, '#090a0f');
    grad.addColorStop(0.6, '#141824');
    grad.addColorStop(1, '#1e2433');
  }
  ctx.fillStyle = grad;
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

  // 柏油路面
  ctx.fillStyle = '#1c1f26';
  ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, 140);
  ctx.fillStyle = '#14161d';
  ctx.fillRect(0, FLOOR_Y + 45, WORLD_WIDTH, 95);

  // 水坑倒影
  for (let px = 850; px < WORLD_WIDTH; px += 340) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath();
    ctx.ellipse(px + 40, FLOOR_Y + 30, 65, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.fillRect(px + 20, FLOOR_Y + 26, 40, 6);
  }

  // 车道线
  ctx.fillStyle = '#e2e8f0';
  for (let rx = 30; rx < WORLD_WIDTH; rx += 85) {
    ctx.fillRect(rx, FLOOR_Y + 80, 42, 4);
  }

  // 绘制场景建筑
  renderSceneBuildings(ctx);

  // 绘制NPC
  renderStreetNPCs(ctx);

  // 绘制地标物体
  renderLandmarks(ctx);

  // 绘制水花
  renderSplashes(ctx);

  // 绘制玩家
  renderPlayer(ctx);

  ctx.restore();
}

/**
 * 渲染场景建筑
 */
function renderSceneBuildings(ctx) {
  // 出租屋房间
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(20, 150, 720, FLOOR_Y - 150);
  ctx.fillStyle = '#292524';
  ctx.fillRect(20, 140, 720, 10);

  // 窗户
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(230, 185, 75, 60);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.strokeRect(230, 185, 75, 60);

  // 电视
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(245, FLOOR_Y - 80, 50, 40);
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(249, FLOOR_Y - 76, 42, 32);

  // 防盗门
  ctx.fillStyle = '#52525b';
  ctx.fillRect(740, 180, 10, FLOOR_Y - 180);

  // 无接触货架
  ctx.fillStyle = '#78350f';
  ctx.fillRect(1020, FLOOR_Y - 50, 95, 12);
  ctx.fillRect(1030, FLOOR_Y - 38, 8, 38);
  ctx.fillRect(1095, FLOOR_Y - 38, 8, 38);

  // 封控水马
  if (gameState.lockdownLevel >= 2) {
    for (let bx = 900; bx <= 960; bx += 30) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, FLOOR_Y - 55, 28, 55);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 4, FLOOR_Y - 40, 20, 6);
      ctx.fillRect(bx + 4, FLOOR_Y - 22, 20, 6);
    }
  }

  // 地铁入口
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(1700, 190, 180, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Noto Sans SC"';
  ctx.fillText('🚇 地铁10号线 · 商务通勤口', 1715, 207);

  // 流浪猫
  ctx.fillStyle = '#14532d';
  ctx.fillRect(2150, FLOOR_Y - 25, 90, 25);
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.ellipse(2200, FLOOR_Y - 12, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // 药房
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(2580, 160, 180, FLOOR_Y - 160);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(2590, 175, 160, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('💊 老百姓大药房 (绿码通道)', 2600, 192);

  // 便利店
  ctx.fillStyle = '#18181b';
  ctx.fillRect(3100, 160, 180, FLOOR_Y - 160);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(3110, 175, 160, 24);
  ctx.fillText('🏪 全家 24H 实体便利店', 3130, 192);

  // 消杀车
  ctx.fillStyle = '#334155';
  ctx.fillRect(3730, FLOOR_Y - 70, 170, 70);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(3770, FLOOR_Y - 105, 55, 35);
}

/**
 * 渲染地标
 */
function renderLandmarks(ctx) {
  landmarks.forEach(item => {
    const itemY = FLOOR_Y - item.height;

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(item.x + item.width / 2, FLOOR_Y + 2, item.width * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 简化的物体渲染
    if (item.id === 'home_bed') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(item.x, itemY + 25, item.width, 20);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(item.x + 10, itemY + 15, item.width - 20, 18);
    }

    // 高亮附近物体
    if (gameState.nearbyItem === item) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(item.x - 3, itemY - 3, item.width + 6, item.height + 6);
    }
  });
}

/**
 * 渲染NPC
 */
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
  const px = player.x;
  const py = player.y;
  const f = player.facing;
  const bob = player.isMoving ? Math.sin(player.walkCycle) * 6 : 0;

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.ellipse(px, py + 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 裤子
  ctx.fillStyle = '#18181b';
  ctx.fillRect(px - 6, py - 20, 5, 20 + bob);
  ctx.fillRect(px + 1, py - 20, 5, 20 - bob);

  // 夹克
  ctx.fillStyle = gameState.isPositiveKnown ? '#b91c1c' : '#2563eb';
  ctx.fillRect(px - 9, py - 48, 18, 28);

  // 头部
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(px, py - 56, 10, 0, Math.PI * 2);
  ctx.fill();

  // 口罩
  if (gameState.hasMaskOn) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(px + (f * 3) - 4, py - 55, 7, 6);
  }

  // 发热光晕
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
  cameraX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, cameraX));
}

/**
 * 渲染雨滴前景
 */
export function renderRainForeground(ctx, canvas) {
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
