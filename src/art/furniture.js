import { FURNITURE_FILES, drawIfReplaced } from './atlas.js';

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r || 6, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fill(ctx, color) {
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawFurniture(ctx, id, x, y, w, h) {
  const floor = y;
  const top = y - h;
  if (drawIfReplaced(ctx, FURNITURE_FILES[id], x, top, w, h)) return;
  const fn = DRAWS[id] || DRAWS.desk;
  fn(ctx, x, floor, w, h, top);
}

const DRAWS = {
  bed(ctx, x, floor, w) {
    ctx.fillStyle = '#292524';
    ctx.fillRect(x + 2, floor - 12, w - 4, 8);
    ctx.fillStyle = '#1e3a8a';
    rr(ctx, x + 8, floor - 36, w - 16, 24, 4);
    fill(ctx, '#1d4ed8');
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(x + 12, floor - 32, w - 24, 8);
    ctx.fillStyle = '#e2e8f0';
    rr(ctx, x + 10, floor - 50, 36, 16, 4);
    fill(ctx, '#e2e8f0');
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x + 6, floor - 8, 8, 8);
    ctx.fillRect(x + w - 14, floor - 8, 8, 8);
  },
  tv(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#18181b';
    rr(ctx, x, top + 6, w, h - 22, 4);
    fill(ctx, '#18181b');
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(x + 6, top + 12, w - 12, h - 36);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 8, top + 14, 16, 10);
    ctx.fillStyle = '#52525b';
    ctx.fillRect(x + w / 2 - 10, floor - 16, 20, 6);
    ctx.fillRect(x + w / 2 - 16, floor - 10, 32, 8);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('电视', x + 8, top + 8);
  },
  stove(ctx, x, floor, w) {
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x, floor - 52, w, 52);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x + 8, floor - 44, w - 16, 20);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(x + w * 0.35, floor - 58, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(x + w * 0.65, floor - 56, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x + 12, floor - 18, 16, 12);
    ctx.fillStyle = '#fdba74';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('灶台', x + 8, floor - 64);
  },
  closet(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x + 5, top + 10, w / 2 - 8, h - 20);
    ctx.fillRect(x + w / 2 + 3, top + 10, w / 2 - 8, h - 20);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(x + w / 2 - 3, top + h * 0.45, 6, 10);
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('衣柜', x + 8, top - 4);
  },
  door(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, top + 8, w - 12, h - 16);
    ctx.fillStyle = 'rgba(103,232,249,0.35)';
    ctx.fillRect(x + 10, top + 14, (w - 24) / 2, h - 40);
    ctx.fillRect(x + w / 2 + 2, top + 14, (w - 24) / 2, h - 40);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x + w - 16, top + h * 0.55, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('门', x + 8, top - 4);
  },
  desk(ctx, x, floor, w) {
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x, floor - 14, w, 8);
    ctx.fillRect(x + 6, floor - 14, 8, 14);
    ctx.fillRect(x + w - 14, floor - 14, 8, 14);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 18, floor - 48, 54, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 22, floor - 44, 46, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('书桌', x, floor - 54);
  },
  chair(ctx, x, floor, w) {
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x + 8, floor - 16, w - 16, 8);
    ctx.fillStyle = '#a8a29e';
    rr(ctx, x + 10, floor - 34, w - 20, 18, 4);
    fill(ctx, '#d6d3d1');
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x + 12, floor - 48, 8, 16);
    ctx.fillRect(x + w - 20, floor - 48, 8, 16);
  },
  sofa(ctx, x, floor, w) {
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x, floor - 18, w, 12);
    ctx.fillStyle = '#a21caf';
    rr(ctx, x + 8, floor - 40, w - 16, 24, 6);
    fill(ctx, '#7e22ce');
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(x + 12, floor - 54, 14, 16);
    ctx.fillRect(x + w - 26, floor - 54, 14, 16);
    ctx.fillStyle = '#f5d0fe';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('沙发', x + 8, floor - 58);
  },
  shower(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#155e75';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = 'rgba(103,232,249,0.35)';
    ctx.fillRect(x + 8, top + 12, w - 16, 40);
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(x + w / 2 - 4, top + 8, 8, 18);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('花洒', x + 4, top - 4);
  },
  rack(ctx, x, floor, w) {
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x, floor - 70, w, 8);
    ctx.fillRect(x, floor - 40, w, 8);
    ctx.fillRect(x + 4, floor - 70, 8, 70);
    ctx.fillRect(x + w - 12, floor - 70, 8, 70);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 16, floor - 62, 28, 16);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 48, floor - 62, 28, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 20, floor - 32, 24, 14);
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('货架', x, floor - 78);
  },
  pole(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + w / 2 - 4, top, 8, h);
    ctx.beginPath();
    ctx.arc(x + w / 2, top + 14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top + 24);
    ctx.quadraticCurveTo(x + w / 2 + 16, top + 50, x + w / 2, top + 80);
    ctx.stroke();
  },
  atm(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#111827';
    rr(ctx, x, top, w, h, 6);
    fill(ctx, '#111827');
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 10, top + 16, w - 20, 28);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px "Noto Sans SC"';
    ctx.fillText('ATM', x + 12, top + 36);
  },
  counter(ctx, x, floor, w) {
    ctx.fillStyle = '#292524';
    ctx.fillRect(x, floor - 46, w, 46);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x + 6, floor - 52, w - 12, 10);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('柜台', x + 8, floor - 58);
  },
  fridge(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 4, top + 8, w - 8, h * 0.4);
    ctx.fillRect(x + 4, top + h * 0.48, w - 8, h * 0.42);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 8, top + 14, w - 16, 16);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('冰柜', x, top - 4);
  }
};
