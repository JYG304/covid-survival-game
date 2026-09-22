import { BUILDING_FILES, SPRITE_ICON, drawIfReplaced } from './atlas.js';

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

function facade(ctx, x, y, w, h, wall, sign, title, icon) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, wall);
  g.addColorStop(1, '#111827');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = sign;
  ctx.fillRect(x, y, w, 36);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px "Noto Sans SC"';
  ctx.fillText(`${icon || ''} ${title}`.trim(), x + 10, y + 24);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 12, y + 48, w - 24, Math.max(40, h - 120));
  ctx.strokeStyle = sign;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 12, y + 48, w - 24, Math.max(40, h - 120));
  const dw = 44;
  const dx = x + w / 2 - dw / 2;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(dx, y + h - 88, dw, 88);
  ctx.fillStyle = 'rgba(103,232,249,0.4)';
  ctx.fillRect(dx + 6, y + h - 78, 14, 48);
  ctx.fillRect(dx + 24, y + h - 78, 14, 48);
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(dx + 36, y + h - 42, 4, 0, Math.PI * 2);
  ctx.fill();
}

function stripes(ctx, x, y, w, c0, c1) {
  for (let i = 0; i < w; i += 16) {
    ctx.fillStyle = (i / 16) % 2 === 0 ? c0 : c1;
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + 16, y);
    ctx.lineTo(x + i + 16, y + 18);
    ctx.lineTo(x + i + 8, y + 26);
    ctx.lineTo(x + i, y + 18);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawBuilding(ctx, id, x, floorY, w, h, title) {
  const top = floorY - h;
  if (drawIfReplaced(ctx, BUILDING_FILES[id], x, top, w, h)) return;
  const icon = SPRITE_ICON[id] || '';
  const fn = DRAWS[id];
  if (fn) fn(ctx, x, top, w, h, floorY, title, icon);
  else facade(ctx, x, top, w, h, '#334155', '#64748b', title || id, icon);
}

const DRAWS = {
  apartment(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#57534e', '#7c2d12', title || '出租屋', icon);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 20, top + 56, 36, 28);
  },
  pharmacy(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#14532d', '#16a34a', title || '大药房', icon);
    stripes(ctx, x + 8, top + 36, w - 16, '#22c55e', '#fff');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Noto Sans SC"';
    ctx.fillText('+', x + w / 2 - 10, top + 100);
  },
  convenience(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#0c4a6e', '#0284c7', title || '便利店', icon);
    stripes(ctx, x + 8, top + 36, w - 16, '#0284c7', '#f97316');
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 18, floorY - 28, 28, 16);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 50, floorY - 28, 28, 16);
  },
  mall(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#1e293b', '#0f172a', title || '商场', icon);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(x + 16, top + 52, w - 32, 8);
  },
  metro(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#134e4a', '#0f766e', title || '地铁站', icon);
    ctx.fillStyle = '#5eead4';
    ctx.fillRect(x + w / 2 - 16, top + 70, 32, 50);
  },
  busStop(ctx, x, top, w, h, floorY, title, icon) {
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(x + 8, top + 20, w - 16, 8);
    ctx.fillRect(x + 12, top + 28, 8, h - 28);
    ctx.fillRect(x + w - 20, top + 28, 8, h - 28);
    ctx.fillStyle = 'rgba(125,211,252,0.2)';
    ctx.fillRect(x + 20, top + 28, w - 40, h - 48);
    ctx.fillStyle = '#fbbf24';
    rr(ctx, x + 18, top + 36, w - 36, 26, 4);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText(`${icon} 公交站`, x + 24, top + 54);
  },
  parlor(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#881337', '#9f1239', title || '推拿馆', icon);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(x + 20, floorY - 22, 40, 10);
    ctx.fillRect(x + 70, floorY - 22, 40, 10);
  },
  club(ctx, x, top, w, h, floorY, title, icon) {
    const pulse = 0.45 + Math.sin(Date.now() / 160) * 0.3;
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = `rgba(244,114,182,${pulse})`;
    ctx.fillRect(x, top, w, 36);
    ctx.fillStyle = '#f5d0fe';
    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.fillText(`${icon} NEON`, x + 16, top + 24);
    ctx.fillStyle = `rgba(34,211,238,${pulse})`;
    ctx.fillRect(x + 16, top + 52, 40, 28);
    ctx.fillStyle = '#581c87';
    ctx.fillRect(x + w / 2 - 18, floorY - 80, 36, 80);
  },
  hospital(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#1e3a8a', '#1d4ed8', title || '医院', icon);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, floorY - 8, w, 8);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px "Noto Sans SC"';
    ctx.fillText('H', x + w / 2 - 10, top + 100);
  },
  hotel(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#44403c', '#b45309', title || '旅馆', icon);
  },
  ktv(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#4c1d95', '#a21caf', title || 'KTV', icon);
  },
  committee(ctx, x, top, w, h, floorY, title, icon) {
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top);
    ctx.lineTo(x + w, top + 36);
    ctx.lineTo(x, top + 36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3f6212';
    ctx.fillRect(x + 8, top + 36, w - 16, h - 36);
    ctx.fillStyle = '#ecfccb';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText(`${icon} 居委会`, x + 12, top + 58);
  },
  office(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#0f172a', '#1e3a8a', title || '写字楼', icon);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = (c + r) % 2 ? '#fde68a' : '#1e293b';
        ctx.fillRect(x + 20 + c * 28, top + 52 + r * 22, 20, 14);
      }
    }
  },
  soy(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#7c2d12', '#b45309', title || '豆浆铺', icon);
  },
  supermarket(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#365314', '#166534', title || '超市', icon);
  },
  clothes(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#1e293b', '#334155', title || '服装店', icon);
  },
  gate(ctx, x, top, w, h, floorY, title, icon) {
    facade(ctx, x, top, w, h, '#1f2937', '#f59e0b', title || '过区口', icon);
  }
};
