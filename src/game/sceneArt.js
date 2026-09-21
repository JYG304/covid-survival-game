import { FLOOR_Y } from '../data/landmarks.js';
import { gameState } from '../data/gameState.js';
import { BEDS } from '../systems/massageParlorSystem.js';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillRR(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
}

function gradV(ctx, x, y, w, h, c0, c1) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function lamp(ctx, x, top, bot, on) {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - 3, top, 6, bot - top);
  ctx.fillStyle = '#111827';
  ctx.fillRect(x - 14, top, 28, 6);
  if (on) {
    const g = ctx.createRadialGradient(x, top + 18, 2, x, top + 40, 70);
    g.addColorStop(0, 'rgba(253,230,138,0.55)');
    g.addColorStop(1, 'rgba(253,230,138,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 8, top + 8);
    ctx.lineTo(x - 40, bot);
    ctx.lineTo(x + 40, bot);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = on ? '#fde68a' : '#57534e';
  ctx.beginPath();
  ctx.ellipse(x, top + 14, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function windows(ctx, x, y, cols, rows, cw, ch, gapX, gapY, litChance) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = Math.abs(Math.sin((x + c * 17 + r * 9) * 0.4)) > litChance;
      const px = x + c * (cw + gapX);
      const py = y + r * (ch + gapY);
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(px - 2, py - 2, cw + 4, ch + 4);
      ctx.fillStyle = lit ? '#fde68a' : '#152033';
      ctx.fillRect(px, py, cw, ch);
      if (lit) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(px, py, cw / 2, ch / 2);
      }
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, cw, ch);
    }
  }
}

function shopFace(ctx, x, y, w, h, wall, trim, signBg, signFg, title) {
  gradV(ctx, x, y, w, h, wall, '#111827');
  ctx.fillStyle = trim;
  ctx.fillRect(x, y, w, 38);
  ctx.fillStyle = signFg;
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText(title, x + 14, y + 26);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 16, y + 52, w - 32, h - 110);
  ctx.strokeStyle = trim;
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 16, y + 52, w - 32, h - 110);
  const doorW = 48;
  const doorX = x + w / 2 - doorW / 2;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(doorX, y + h - 92, doorW, 92);
  ctx.fillStyle = '#67e8f9';
  ctx.globalAlpha = 0.35;
  ctx.fillRect(doorX + 8, y + h - 80, 14, 50);
  ctx.fillRect(doorX + 26, y + h - 80, 14, 50);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(doorX + 40, y + h - 44, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y + h - 8, w, 8);
}

function awning(ctx, x, y, w, c0, c1) {
  for (let i = 0; i < w; i += 18) {
    ctx.fillStyle = (i / 18) % 2 === 0 ? c0 : c1;
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + 18, y);
    ctx.lineTo(x + i + 18, y + 22);
    ctx.lineTo(x + i + 9, y + 30);
    ctx.lineTo(x + i, y + 22);
    ctx.closePath();
    ctx.fill();
  }
}

export function paintSkyline(ctx, canvas, cameraX, pal, lockdown) {
  const far = cameraX * 0.12;
  for (let i = -2; i < 18; i++) {
    const bx = i * 110 - (far % 110);
    const h = 140 + ((i * 37) % 90);
    gradV(ctx, bx, FLOOR_Y - h - 40, 96, h + 40, '#0b1220', '#020617');
    windows(ctx, bx + 10, FLOOR_Y - h - 20, 3, Math.max(3, Math.floor(h / 28)), 14, 10, 10, 12, 0.35);
    if (i % 3 === 0) {
      ctx.fillStyle = Date.now() % 900 > 450 ? '#ef4444' : '#7f1d1d';
      ctx.fillRect(bx + 44, FLOOR_Y - h - 52, 5, 10);
    }
  }
  const mid = cameraX * 0.28;
  ctx.fillStyle = '#111827';
  ctx.fillRect(-40, FLOOR_Y - 118, canvas.width + 80, 14);
  for (let i = -1; i < 10; i++) {
    const px = i * 220 - (mid % 220);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(px + 40, FLOOR_Y - 118, 16, 70);
  }
  if (lockdown >= 2) {
    const t = Date.now() * 0.001;
    const beamX = canvas.width * 0.5 + Math.sin(t) * 160;
    const g = ctx.createRadialGradient(beamX, 8, 4, beamX, FLOOR_Y, 240);
    g.addColorStop(0, lockdown >= 3 ? 'rgba(239,68,68,0.22)' : 'rgba(125,211,252,0.16)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(beamX, 6);
    ctx.lineTo(beamX - 200, FLOOR_Y);
    ctx.lineTo(beamX + 200, FLOOR_Y);
    ctx.fill();
  }
}

function paintRoad(ctx, w, curb, road) {
  gradV(ctx, 0, FLOOR_Y, w, 28, curb, '#27272a');
  ctx.fillStyle = road;
  ctx.fillRect(0, FLOOR_Y + 28, w, 120);
  ctx.fillStyle = '#52525b';
  ctx.fillRect(0, FLOOR_Y + 26, w, 3);
  for (let x = 20; x < w; x += 78) {
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x, FLOOR_Y + 72, 36, 5);
  }
  for (let x = 400; x < w; x += 420) lamp(ctx, x, 150, FLOOR_Y, gameState.hour >= 18 || gameState.hour < 7);
}

function districtBanner(ctx, text, bg, fg) {
  fillRR(ctx, 40, 78, 280, 28, 6, bg);
  ctx.fillStyle = fg;
  ctx.font = 'bold 15px "Noto Sans SC"';
  ctx.fillText(text, 54, 98);
}

function gate(ctx, x, title, color) {
  shopFace(ctx, x, 140, 150, FLOOR_Y - 140, '#1f2937', color, color, '#fff', title);
}

export function paintStreet(ctx, w) {
  paintDistrict(ctx, w, 'living');
}

export function paintDistrict(ctx, w, theme) {
  if (theme === 'living') {
    paintRoad(ctx, w, '#3f3f46', '#18181b');
    districtBanner(ctx, '生活区 · 朝阳里', '#7c2d12', '#fed7aa');
    paintApartment(ctx);
    paintRack(ctx);
    paintGarden(ctx);
    shopFace(ctx, 1820, 140, 200, FLOOR_Y - 140, '#365314', '#a3e635', '#3f6212', '#ecfccb', '居委会帐篷');
    gate(ctx, 2260, '→ 商业区', '#f59e0b');
    gate(ctx, 2640, '→ 医疗区', '#38bdf8');
    shopFace(ctx, 3060, 128, 200, FLOOR_Y - 128, '#134e4a', '#2dd4bf', '#0f766e', '#fff', '生活区地铁');
    fillRR(ctx, 3340, 210, 140, 28, 4, '#fbbf24');
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px "Noto Sans SC"';
    ctx.fillText('126路 生活区站', 3354, 230);
  } else if (theme === 'commerce') {
    paintRoad(ctx, w, '#44403c', '#1c1917');
    districtBanner(ctx, '商业区 · 北大街', '#0c4a6e', '#e0f2fe');
    gate(ctx, 40, '→ 生活区', '#fb923c');
    shopFace(ctx, 400, 118, 210, FLOOR_Y - 118, '#14532d', '#4ade80', '#16a34a', '#fff', '老百姓大药房');
    awning(ctx, 408, 154, 194, '#22c55e', '#fff');
    shopFace(ctx, 800, 118, 210, FLOOR_Y - 118, '#0c4a6e', '#38bdf8', '#0284c7', '#fff', '全家 24H');
    awning(ctx, 808, 154, 194, '#0284c7', '#f97316');
    shopFace(ctx, 1180, 140, 190, FLOOR_Y - 140, '#7c2d12', '#fdba74', '#b45309', '#fff7ed', '胡记豆浆');
    shopFace(ctx, 1580, 118, 230, FLOOR_Y - 118, '#365314', '#86efac', '#166534', '#fff', '生鲜超市');
    shopFace(ctx, 2040, 128, 200, FLOOR_Y - 128, '#1e293b', '#e2e8f0', '#334155', '#fff', '优衣库');
    gate(ctx, 2460, '→ 办公区', '#60a5fa');
    gate(ctx, 2880, '→ 红灯区', '#f472b6');
    shopFace(ctx, 3280, 128, 200, FLOOR_Y - 128, '#134e4a', '#2dd4bf', '#0f766e', '#fff', '商业区地铁');
  } else if (theme === 'redlight') {
    paintRoad(ctx, w, '#3b0764', '#0a0010');
    districtBanner(ctx, '红灯区 · 夜巷', '#9f1239', '#fecdd3');
    gate(ctx, 40, '→ 商业区', '#fb923c');
    paintParlorAt(ctx, 400);
    shopFace(ctx, 820, 128, 200, FLOOR_Y - 128, '#44403c', '#f59e0b', '#78350f', '#fff7ed', '钟点房');
    paintClubFrontAt(ctx, 1240);
    shopFace(ctx, 1680, 120, 200, FLOOR_Y - 120, '#4c1d95', '#e879f9', '#6b21a8', '#fff', 'KTV');
    fillRR(ctx, 2100, FLOOR_Y - 70, 140, 70, 8, '#1c1917');
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 12px "Noto Sans SC"';
    ctx.fillText('吸烟区', 2136, FLOOR_Y - 40);
    gate(ctx, 2520, '→ 滨江', '#22d3ee');
    gate(ctx, 2960, '→ 生活区', '#fb923c');
  } else if (theme === 'civic') {
    paintRoad(ctx, w, '#1e3a8a', '#0f172a');
    districtBanner(ctx, '政务医疗区', '#0369a1', '#fff');
    gate(ctx, 40, '→ 生活区', '#fb923c');
    shopFace(ctx, 400, 118, 220, FLOOR_Y - 118, '#1e3a8a', '#93c5fd', '#1d4ed8', '#fff', '发热门诊');
    ctx.fillStyle = '#facc15';
    ctx.fillRect(400, FLOOR_Y - 10, 220, 8);
    shopFace(ctx, 780, 150, 180, FLOOR_Y - 150, '#e0f2fe', '#0369a1', '#0284c7', '#fff', '户外预检棚');
    shopFace(ctx, 1140, 160, 150, FLOOR_Y - 160, '#334155', '#fde68a', '#1f2937', '#fff', '公告栏');
    shopFace(ctx, 1540, 150, 160, FLOOR_Y - 150, '#7f1d1d', '#fecaca', '#991b1b', '#fff', '临时卡口');
    paintCannonAt(ctx, 1960);
    gate(ctx, 2440, '→ 办公区', '#60a5fa');
    shopFace(ctx, 2880, 128, 200, FLOOR_Y - 128, '#134e4a', '#2dd4bf', '#0f766e', '#fff', '医院站地铁');
  } else if (theme === 'cbd') {
    paintRoad(ctx, w, '#1e293b', '#020617');
    districtBanner(ctx, '商务办公区', '#1d4ed8', '#dbeafe');
    gate(ctx, 40, '→ 商业区', '#fb923c');
    shopFace(ctx, 400, 100, 230, FLOOR_Y - 100, '#0f172a', '#93c5fd', '#1e3a8a', '#fff', '写字楼大堂');
    windows(ctx, 420, 150, 5, 4, 22, 18, 8, 8, 0.25);
    shopFace(ctx, 780, 170, 160, FLOOR_Y - 170, '#0c4a6e', '#7dd3fc', '#0369a1', '#fff', '瑞幸柜');
    fillRR(ctx, 1140, FLOOR_Y - 60, 130, 60, 8, '#1c1917');
    ctx.fillStyle = '#fde68a';
    ctx.font = '12px "Noto Sans SC"';
    ctx.fillText('吸烟点', 1170, FLOOR_Y - 32);
    gate(ctx, 1540, '→ 医疗区', '#38bdf8');
    gate(ctx, 2040, '→ 滨江', '#22d3ee');
    shopFace(ctx, 2540, 128, 200, FLOOR_Y - 128, '#134e4a', '#2dd4bf', '#0f766e', '#fff', '商务中心站');
  } else if (theme === 'riverside') {
    paintRiver(ctx, w);
    districtBanner(ctx, '滨江工业区', '#0e7490', '#cffafe');
    gate(ctx, 40, '→ 红灯区', '#f472b6');
    gate(ctx, 2120, '→ 办公区', '#60a5fa');
    gate(ctx, 3340, '→ 生活区', '#fb923c');
  } else {
    paintRoad(ctx, w, '#3f3f46', '#18181b');
  }
}

function paintApartment(ctx) {
  gradV(ctx, 8, 108, 770, FLOOR_Y - 108, '#57534e', '#292524');
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(8, 96, 770, 14);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(8, 92, 770, 6);
  fillRR(ctx, 24, 118, 210, 28, 4, '#7c2d12');
  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 15px "Noto Sans SC"';
  ctx.fillText('朝阳里  出租单间', 38, 138);

  ctx.fillStyle = '#44403c';
  ctx.fillRect(36, FLOOR_Y - 58, 120, 16);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(48, FLOOR_Y - 78, 96, 24);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(52, FLOOR_Y - 86, 32, 12);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(36, FLOOR_Y - 42, 8, 42);
  ctx.fillRect(148, FLOOR_Y - 42, 8, 42);

  ctx.fillStyle = '#292524';
  ctx.fillRect(200, 168, 90, 70);
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 3;
  ctx.strokeRect(200, 168, 90, 70);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(208, 176, 74, 54);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(208, 176, 30, 20);

  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(310, FLOOR_Y - 86, 64, 48);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(316, FLOOR_Y - 80, 52, 36);

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(390, FLOOR_Y - 78, 100, 12);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(402, FLOOR_Y - 108, 56, 34);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(408, FLOOR_Y - 102, 44, 22);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(418, FLOOR_Y - 66, 18, 66);

  ctx.fillStyle = '#164e63';
  ctx.fillRect(510, 168, 72, FLOOR_Y - 168);
  ctx.fillStyle = '#67e8f9';
  ctx.globalAlpha = 0.45;
  ctx.fillRect(522, 186, 20, 70);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.fillRect(548, 200, 8, 28);

  ctx.fillStyle = '#44403c';
  ctx.fillRect(600, FLOOR_Y - 100, 96, 100);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(610, FLOOR_Y - 92, 76, 40);
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(648, FLOOR_Y - 78, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(618, FLOOR_Y - 48, 60, 10);
  ctx.fillStyle = '#a8a29e';
  ctx.fillRect(626, FLOOR_Y - 38, 14, 38);

  ctx.fillStyle = '#71717a';
  ctx.fillRect(724, 150, 36, FLOOR_Y - 150);
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(728, 158, 28, FLOOR_Y - 166);
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(750, 250, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 12px "Noto Sans SC"';
  ctx.fillText('出门', 726, 142);
}

function paintRack(ctx) {
  ctx.fillStyle = '#44403c';
  ctx.fillRect(990, FLOOR_Y - 78, 140, 10);
  ctx.fillRect(990, FLOOR_Y - 48, 140, 10);
  ctx.fillRect(998, FLOOR_Y - 78, 8, 78);
  ctx.fillRect(1114, FLOOR_Y - 78, 8, 78);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(1012, FLOOR_Y - 70, 32, 20);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(1050, FLOOR_Y - 70, 32, 20);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(1088, FLOOR_Y - 40, 24, 16);
  fillRR(ctx, 990, FLOOR_Y - 108, 140, 22, 4, '#7c2d12');
  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 12px "Noto Sans SC"';
  ctx.fillText('无接触货架', 1006, FLOOR_Y - 93);
  if (gameState.lockdownLevel >= 2) {
    for (let bx = 880; bx <= 950; bx += 28) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, FLOOR_Y - 58, 24, 58);
      ctx.fillStyle = '#fff';
      ctx.fillRect(bx + 3, FLOOR_Y - 42, 18, 5);
      ctx.fillRect(bx + 3, FLOOR_Y - 24, 18, 5);
    }
  }
}

function paintMetroKiosk(ctx) {
  shopFace(ctx, 1660, 128, 230, FLOOR_Y - 128, '#134e4a', '#2dd4bf', '#0f766e', '#ecfdf5', '地铁 10号线');
  ctx.fillStyle = '#115e59';
  ctx.fillRect(1748, 210, 54, FLOOR_Y - 210);
  ctx.fillStyle = '#5eead4';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(1756, 230, 38, 70);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px "Noto Sans SC"';
  ctx.fillText('进站', 1756, 200);
}

function paintBusStop(ctx) {
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(1928, 188, 156, 8);
  ctx.fillRect(1936, 196, 8, FLOOR_Y - 196);
  ctx.fillRect(2068, 196, 8, FLOOR_Y - 196);
  ctx.fillStyle = 'rgba(125,211,252,0.18)';
  ctx.fillRect(1944, 196, 124, FLOOR_Y - 210);
  fillRR(ctx, 1944, 208, 124, 28, 4, '#fbbf24');
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 13px "Noto Sans SC"';
  ctx.fillText('公交 126路', 1956, 228);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(1968, FLOOR_Y - 46, 70, 8);
}

function paintGarden(ctx) {
  ctx.fillStyle = '#14532d';
  ctx.fillRect(2136, FLOOR_Y - 22, 120, 22);
  ctx.fillStyle = '#166534';
  ctx.fillRect(2144, FLOOR_Y - 32, 104, 12);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(2166, FLOOR_Y - 58, 7, 28);
  ctx.fillRect(2218, FLOOR_Y - 70, 7, 40);
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(2169, FLOOR_Y - 64, 16, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(2221, FLOOR_Y - 78, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(2200, FLOOR_Y - 12, 18, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdba74';
  ctx.beginPath();
  ctx.arc(2214, FLOOR_Y - 22, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9a3412';
  ctx.beginPath();
  ctx.moveTo(2210, FLOOR_Y - 28);
  ctx.lineTo(2204, FLOOR_Y - 38);
  ctx.lineTo(2216, FLOOR_Y - 28);
  ctx.fill();
  fillRR(ctx, 2148, FLOOR_Y - 96, 70, 20, 4, '#14532d');
  ctx.fillStyle = '#bbf7d0';
  ctx.font = 'bold 12px "Noto Sans SC"';
  ctx.fillText('阿花', 2166, FLOOR_Y - 82);
}

function paintPharmacy(ctx) {
  shopFace(ctx, 2548, 118, 230, FLOOR_Y - 118, '#14532d', '#4ade80', '#16a34a', '#fff', '老百姓大药房');
  awning(ctx, 2556, 154, 214, '#22c55e', '#fff');
  windows(ctx, 2572, 196, 4, 2, 28, 24, 10, 10, 0.2);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px "Noto Sans SC"';
  ctx.fillText('+', 2648, 250);
}

function paintConvenience(ctx) {
  shopFace(ctx, 3070, 118, 230, FLOOR_Y - 118, '#0c4a6e', '#38bdf8', '#0284c7', '#fff', '全家 24H');
  awning(ctx, 3078, 154, 214, '#0284c7', '#f97316');
  windows(ctx, 3094, 196, 4, 2, 28, 24, 10, 10, 0.15);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(3094, FLOOR_Y - 38, 36, 22);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(3136, FLOOR_Y - 38, 36, 22);
  ctx.fillStyle = '#fff';
  ctx.font = '10px "Noto Sans SC"';
  ctx.fillText('便当', 3098, FLOOR_Y - 24);
}

function paintParlorAt(ctx, x) {
  gradV(ctx, x, 108, 260, FLOOR_Y - 108, '#881337', '#4c0519');
  ctx.fillStyle = '#9f1239';
  ctx.fillRect(x, 108, 260, 40);
  ctx.fillStyle = '#fecdd3';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('林记推拿馆', x + 48, 136);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x + 100, 168, 54, FLOOR_Y - 168);
  for (const bed of BEDS) {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(bed.x - 28, FLOOR_Y - 28, 56, 12);
    fillRR(ctx, bed.x - 24, FLOOR_Y - 44, 48, 16, 4, '#fda4af');
  }
}

function paintClubFrontAt(ctx, x) {
  gradV(ctx, x, 96, 220, FLOOR_Y - 96, '#3b0764', '#1e0533');
  const pulse = 0.45 + Math.sin(Date.now() / 150) * 0.3;
  ctx.fillStyle = `rgba(244,114,182,${pulse})`;
  ctx.fillRect(x, 96, 220, 38);
  ctx.fillStyle = '#f5d0fe';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('NEON CLUB', x + 48, 122);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(x + 82, 210, 50, FLOOR_Y - 210);
}

function paintCannonAt(ctx, x) {
  fillRR(ctx, x, FLOOR_Y - 70, 196, 70, 8, '#334155');
  fillRR(ctx, x + 50, FLOOR_Y - 118, 78, 50, 8, '#0ea5e9');
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 34, FLOOR_Y - 6, 18, 0, Math.PI * 2);
  ctx.arc(x + 174, FLOOR_Y - 6, 18, 0, Math.PI * 2);
  ctx.fill();
}

function paintHospitalGate(ctx) {
  shopFace(ctx, 4410, 118, 220, FLOOR_Y - 118, '#1e3a8a', '#93c5fd', '#1d4ed8', '#fff', '发热门诊接驳');
  ctx.fillStyle = '#facc15';
  ctx.fillRect(4410, FLOOR_Y - 10, 220, 8);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px "Noto Sans SC"';
  ctx.fillText('H', 4504, 250);
}

function paintCannon(ctx) {
  ctx.fillStyle = '#334155';
  fillRR(ctx, 4720, FLOOR_Y - 70, 196, 70, 8, '#334155');
  ctx.fillStyle = '#0284c7';
  fillRR(ctx, 4770, FLOOR_Y - 118, 78, 50, 8, '#0ea5e9');
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(4754, FLOOR_Y - 6, 18, 0, Math.PI * 2);
  ctx.arc(4894, FLOOR_Y - 6, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(4754, FLOOR_Y - 6, 8, 0, Math.PI * 2);
  ctx.arc(4894, FLOOR_Y - 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(186,230,253,0.35)';
  ctx.beginPath();
  ctx.ellipse(4920, FLOOR_Y - 90, 40, 18, -0.4, 0, Math.PI * 2);
  ctx.fill();
  fillRR(ctx, 4744, FLOOR_Y - 148, 150, 22, 4, '#0e7490');
  ctx.fillStyle = '#e0f2fe';
  ctx.font = 'bold 12px "Noto Sans SC"';
  ctx.fillText('雾炮消杀车', 4764, FLOOR_Y - 133);
}

export function paintMetro(ctx, w) {
  gradV(ctx, 0, 40, w, FLOOR_Y + 100, '#020617', '#0b1220');
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 48, w, 44);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(0, 90, w, 4);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('10号线  车厢  →  下一站 写字楼 / 医院', 140, 76);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, FLOOR_Y, w, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, FLOOR_Y + 18, w, 120);
  for (let x = 30; x < w; x += 250) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, 110, 12, FLOOR_Y - 110);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(x + 6, 148, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, 158);
    ctx.quadraticCurveTo(x + 20, 190, x + 6, 220);
    ctx.stroke();
    ctx.fillStyle = '#0ea5e9';
    fillRR(ctx, x + 40, 118, 108, 86, 6, '#0284c7');
    ctx.fillStyle = '#082f49';
    ctx.fillRect(x + 50, 128, 88, 66);
    const t = (Date.now() / 800 + x) % 1;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 56 + t * 40, 136, 30, 50);
    ctx.fillStyle = '#1e293b';
    fillRR(ctx, x + 160, FLOOR_Y - 58, 82, 20, 6, '#334155');
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 166, FLOOR_Y - 78, 70, 22);
  }
  ctx.fillStyle = 'rgba(56,189,248,0.25)';
  ctx.fillRect(0, FLOOR_Y - 3, w, 3);
}

export function paintBus(ctx, w) {
  gradV(ctx, 0, 40, w, FLOOR_Y + 100, '#431407', '#1c1917');
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 48, w, 42);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 17px "Noto Sans SC"';
  ctx.fillText('126路  朝阳里 → 医院 → 江边 → 夜店巷', 120, 76);
  ctx.fillStyle = '#292524';
  ctx.fillRect(0, FLOOR_Y, w, 16);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, FLOOR_Y + 16, w, 120);
  for (let x = 40; x < w; x += 148) {
    ctx.fillStyle = '#fcd34d';
    fillRR(ctx, x, 108, 70, 56, 6, '#fbbf24');
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(x, 108, 70, 56);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 8, 116, 24, 40);
    ctx.fillStyle = '#7c2d12';
    fillRR(ctx, x + 78, FLOOR_Y - 52, 62, 16, 4, '#9a3412');
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x + 82, FLOOR_Y - 72, 54, 22);
  }
  fillRR(ctx, 230, 100, 78, 96, 8, '#0f172a');
  ctx.fillStyle = '#fef3c7';
  ctx.font = '12px "Noto Sans SC"';
  ctx.fillText('司机窗', 242, 154);
}

export function paintClub(ctx, w) {
  gradV(ctx, 0, 30, w, FLOOR_Y + 110, '#3b0764', '#0a0010');
  const p = 0.4 + Math.sin(Date.now() / 160) * 0.25;
  ctx.fillStyle = `rgba(244,114,182,${p})`;
  ctx.fillRect(0, 40, w, 28);
  ctx.fillStyle = '#f5d0fe';
  ctx.font = 'bold 22px "Noto Sans SC"';
  ctx.fillText('NEON  午夜俱乐部', 760, 62);
  const g = ctx.createRadialGradient(910, 240, 20, 910, 260, 220);
  g.addColorStop(0, `rgba(34,211,238,${0.25 + p * 0.2})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(700, 90, 430, FLOOR_Y - 90);
  for (let i = 0; i < 10; i++) {
    const hx = 740 + i * 38;
    const hy = FLOOR_Y - 24 - Math.abs(Math.sin(Date.now() / 140 + i)) * 26;
    ctx.fillStyle = i % 2 ? '#f472b6' : '#22d3ee';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(hx, hy, 14, 16);
    ctx.globalAlpha = 1;
  }
  fillRR(ctx, 300, FLOOR_Y - 78, 220, 78, 8, '#1c1917');
  ctx.fillStyle = '#6b21a8';
  ctx.fillRect(310, FLOOR_Y - 70, 200, 22);
  ctx.fillStyle = '#f5d0fe';
  ctx.font = 'bold 14px "Noto Sans SC"';
  ctx.fillText('BAR', 392, FLOOR_Y - 54);
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(330, FLOOR_Y - 42, 10, 18);
  ctx.fillStyle = '#67e8f9';
  ctx.fillRect(350, FLOOR_Y - 48, 10, 24);
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(370, FLOOR_Y - 36, 10, 12);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, FLOOR_Y, w, 130);
  for (let x = 0; x < w; x += 32) {
    ctx.fillStyle = x % 64 === 0 ? '#1f2937' : '#111827';
    ctx.fillRect(x, FLOOR_Y, 32, 8);
  }
}

export function paintHospital(ctx, w) {
  gradV(ctx, 0, 40, w, FLOOR_Y + 100, '#e0f2fe', '#cbd5e1');
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(0, 40, w, 40);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px "Noto Sans SC"';
  ctx.fillText('发热门诊走廊  ·  沿黄线排队  ·  一米距离', 120, 66);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 80, w, FLOOR_Y - 80);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, FLOOR_Y - 10, w, 10);
  for (let x = 40; x < w; x += 70) {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x, FLOOR_Y - 10, 36, 10);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, FLOOR_Y, w, 120);
  for (let x = 220; x < w; x += 240) {
    fillRR(ctx, x, FLOOR_Y - 48, 58, 48, 6, '#64748b');
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 8, FLOOR_Y - 40, 42, 8);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x + 200, 110, 10, FLOOR_Y - 110);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 188, 130, 34, 50);
    ctx.strokeStyle = '#0369a1';
    ctx.strokeRect(x + 188, 130, 34, 50);
  }
}

export function paintOffice(ctx, w) {
  gradV(ctx, 0, 40, w, FLOOR_Y + 100, '#1e293b', '#0f172a');
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 40, w, 36);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 16px "Noto Sans SC"';
  ctx.fillText('写字楼 23F  市场部  ·  全勤打卡', 140, 64);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, FLOOR_Y, w, 120);
  for (let x = 160; x < w - 140; x += 200) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, 96, 8, FLOOR_Y - 96);
    fillRR(ctx, x + 12, FLOOR_Y - 86, 170, 86, 6, '#1e293b');
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(x + 22, FLOOR_Y - 74, 86, 52);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x + 28, FLOOR_Y - 68, 74, 40);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 116, FLOOR_Y - 48, 50, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 124, FLOOR_Y - 78, 26, 18);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 128, FLOOR_Y - 92, 18, 14);
  }
}

export function paintRiver(ctx, w) {
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR_Y + 80);
  sky.addColorStop(0, '#0b1a2e');
  sky.addColorStop(0.5, '#1e3a5f');
  sky.addColorStop(1, '#0f172a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, FLOOR_Y + 140);
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(0, FLOOR_Y + 24, w, 100);
  ctx.fillStyle = 'rgba(125,211,252,0.28)';
  ctx.fillRect(0, FLOOR_Y + 18, w, 14);
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, FLOOR_Y, w, 20);
  for (let x = 0; x < w; x += 86) {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x, 108, 70, FLOOR_Y - 128);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(x + 8, 122, 54, 8);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Noto Sans SC"';
    ctx.fillText('禁止', x + 16, 200);
    ctx.fillText('聚集', x + 16, 216);
  }
  ctx.fillStyle = '#14532d';
  ctx.fillRect(1460, FLOOR_Y - 18, 90, 18);
}

export function paintMall(ctx, w) {
  paintRoad(ctx, w, '#e2e8f0', '#cbd5e1');
  districtBanner(ctx, '朝阳汇商场 3F', '#0f172a', '#fde68a');
  gradV(ctx, 0, 90, w, FLOOR_Y - 90, '#f8fafc', '#e2e8f0');
  shopFace(ctx, 340, 140, 160, FLOOR_Y - 140, '#1e293b', '#fde68a', '#111827', '#fff', '试衣间');
  shopFace(ctx, 680, 130, 200, FLOOR_Y - 130, '#0f172a', '#e2e8f0', '#334155', '#fff', '男装');
  shopFace(ctx, 1080, 150, 180, FLOOR_Y - 150, '#7c2d12', '#fdba74', '#b45309', '#fff7ed', '食肆');
  fillRR(ctx, 1480, FLOOR_Y - 80, 90, 80, 8, '#111827');
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 12px "Noto Sans SC"';
  ctx.fillText('ATM', 1504, FLOOR_Y - 40);
  shopFace(ctx, 1840, 160, 140, FLOOR_Y - 160, '#155e75', '#67e8f9', '#0e7490', '#fff', '卫生间');
  shopFace(ctx, 2240, 150, 150, FLOOR_Y - 150, '#1e3a8a', '#93c5fd', '#1d4ed8', '#fff', '保安台');
}

export function paintHome(ctx, w) {
  paintRoad(ctx, w, '#57534e', '#292524');
  districtBanner(ctx, '出租屋室内', '#7c2d12', '#fed7aa');
  gradV(ctx, 0, 90, w, FLOOR_Y - 90, '#44403c', '#1c1917');
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(270, FLOOR_Y - 58, 110, 22);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(278, FLOOR_Y - 70, 36, 14);
  ctx.fillStyle = '#78716c';
  ctx.fillRect(470, 200, 70, FLOOR_Y - 200);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(660, FLOOR_Y - 70, 54, 36);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(890, FLOOR_Y - 90, 70, 40);
  ctx.fillStyle = '#155e75';
  ctx.fillRect(1170, 190, 80, FLOOR_Y - 190);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(1440, FLOOR_Y - 80, 80, 40);
}

export function paintParlorRoom(ctx, w) {
  paintRoad(ctx, w, '#9f1239', '#1c1917');
  districtBanner(ctx, '林记推拿馆内', '#881337', '#fecdd3');
  gradV(ctx, 0, 90, w, FLOOR_Y - 90, '#4c0519', '#1c1917');
  for (const x of [620, 920, 1220]) {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x - 54, FLOOR_Y - 28, 108, 12);
    fillRR(ctx, x - 48, FLOOR_Y - 46, 96, 20, 6, '#fda4af');
  }
}

export function paintShop(ctx, w) {
  paintRoad(ctx, w, '#fef3c7', '#292524');
  districtBanner(ctx, gameState.mapId === 'pharmacyIn' ? '药房店内' : '便利店店内', '#14532d', '#fff');
  gradV(ctx, 0, 100, w, FLOOR_Y - 100, '#fff7ed', '#e7e5e4');
  for (let x = 300; x < w - 80; x += 160) {
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x, FLOOR_Y - 90, 120, 90);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x + 8, FLOOR_Y - 82, 104, 20);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 12, FLOOR_Y - 56, 28, 18);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 48, FLOOR_Y - 56, 28, 18);
  }
}
