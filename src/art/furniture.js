import { FURNITURE_FILES, drawIfReplaced } from './atlas.js';
import { gameState } from '../data/gameState.js';

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
  toilet(ctx, x, floor, w) {
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(x + w * 0.28, floor - 42, w * 0.44, 28);
    ctx.fillRect(x + w * 0.18, floor - 18, w * 0.64, 18);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x + w * 0.32, floor - 58, w * 0.36, 16);
    ctx.fillStyle = '#67e8f9';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, floor - 28, w * 0.16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('马桶', x, floor - 64);
  },
  sink(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x, floor - 46, w, 46);
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(x + 6, floor - 40, w - 12, 16);
    ctx.fillStyle = '#67e8f9';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x + 10, floor - 36, w - 20, 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x + w / 2 - 3, floor - 52, 6, 12);
    ctx.fillRect(x + w / 2 - 10, floor - 56, 20, 5);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x + w - 22, top + 8, 16, 28);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('洗手', x, floor - 60);
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
  },
  trash(ctx, x, floor, w, h) {
    const fillAmt = Math.min(1, (gameState.home?.trash || 20) / 100);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 8, floor - 52, w - 16, 52);
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.moveTo(x + 4, floor - 52);
    ctx.lineTo(x + w - 4, floor - 52);
    ctx.lineTo(x + w - 10, floor - 64);
    ctx.lineTo(x + 10, floor - 64);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = fillAmt > 0.7 ? '#854d0e' : '#4d7c0f';
    ctx.fillRect(x + 12, floor - 12 - fillAmt * 36, w - 24, fillAmt * 36);
    if (fillAmt > 0.55) {
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(x + 16, floor - 58, 8, 6);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(x + w - 24, floor - 50, 10, 7);
    }
    ctx.fillStyle = '#d9f99d';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText(fillAmt > 0.8 ? '满了' : '垃圾袋', x, floor - 70);
  },
  litter(ctx, x, floor, w) {
    const dirt = Math.min(1, (gameState.home?.litter || 10) / 100);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x, floor - 14, w, 14);
    ctx.fillStyle = dirt > 0.6 ? '#78716c' : '#e7e5e4';
    ctx.fillRect(x + 4, floor - 20, w - 8, 10);
    if (dirt > 0.35) {
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(x + 10, floor - 18, 6, 4);
      ctx.fillRect(x + w - 18, floor - 17, 8, 3);
    }
    if (dirt > 0.7) {
      ctx.fillStyle = 'rgba(132,204,22,0.35)';
      ctx.fillRect(x - 4, floor - 8, w + 8, 8);
    }
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('砂盆', x, floor - 26);
  },
  hanger(ctx, x, floor, w, h, top) {
    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, top + 8);
    ctx.lineTo(x + w - 6, top + 8);
    ctx.stroke();
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x + 4, top, 6, h);
    ctx.fillRect(x + w - 10, top, 6, h);
    const wet = gameState.home?.drying > 0;
    const colors = wet ? ['#1e3a8a', '#9f1239', '#365314'] : ['#64748b', '#a8a29e'];
    const n = wet ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const cx = x + 16 + i * 22;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(cx, top + 10, 16, 28);
      if (wet) {
        ctx.fillStyle = 'rgba(125,211,252,0.55)';
        ctx.fillRect(cx + 6, top + 40, 3, 10);
      }
    }
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText(wet ? '在滴水' : '衣架', x, top - 4);
  },
  thermo(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 6, top + 8, w - 12, h - 16);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 10, top + 14, w - 20, 22);
    ctx.fillStyle = '#052e16';
    ctx.font = 'bold 10px "Noto Sans SC"';
    ctx.fillText(`${(gameState.bodyTemp || 36.6).toFixed(1)}`, x + 12, top + 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + w / 2 - 4, floor - 18, 8, 14);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('额温枪', x, top - 2);
  },
  catbowl(ctx, x, floor, w) {
    const hungry = (gameState.home?.catHunger || 0) > 55;
    ctx.fillStyle = homeHasSafe('catBowl') ? '#e7e5e4' : '#78716c';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, floor - 8, w * 0.42, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hungry ? '#44403c' : '#b45309';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, floor - 10, w * 0.28, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText(hungry ? '空碗' : '猫粮', x, floor - 22);
  },
  broom(ctx, x, floor, w, h, top) {
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x + w / 2 - 3, top + 8, 6, h - 24);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 6, floor - 22, w - 12, 16);
    ctx.fillStyle = '#ca8a04';
    for (let i = 0; i < 6; i++) ctx.fillRect(x + 8 + i * 5, floor - 10, 3, 10);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('拖把', x, top - 2);
  }
};

function homeHasSafe(id) {
  return !!gameState.home?.upgrades?.[id];
}
