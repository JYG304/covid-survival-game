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
    const g = ctx.createLinearGradient(x, top, x, floorY);
    g.addColorStop(0, '#d6d3d1');
    g.addColorStop(0.15, '#a8a29e');
    g.addColorStop(1, '#57534e');
    ctx.fillStyle = g;
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x - 6, top, w + 12, 14);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(x + 16, top + 18, Math.min(w - 32, 160), 22);
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText('朝阳里 3栋', x + 24, top + 34);
    const cols = Math.max(3, Math.floor((w - 24) / 36));
    const rows = Math.max(3, Math.floor((h - 120) / 32));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = (c + r * 3) % 4 !== 0;
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x + 14 + c * 36, top + 48 + r * 32, 26, 22);
        ctx.fillStyle = lit ? '#fde68a' : '#1e293b';
        ctx.fillRect(x + 16 + c * 36, top + 50 + r * 32, 22, 18);
        ctx.strokeStyle = '#78716c';
        ctx.strokeRect(x + 16 + c * 36, top + 50 + r * 32, 22, 18);
      }
    }
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x + w / 2 - 22, floorY - 78, 44, 78);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x + w / 2 + 12, floorY - 40, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x + 10, floorY - 28, 36, 16);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('单元门', x + w / 2 - 20, floorY - 84);
  },
  pharmacy(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(x, top + 28, w, h - 28);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x, top, w, 32);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillText('老百姓大药房', x + 10, top + 22);
    stripes(ctx, x + 6, top + 32, w - 12, '#22c55e', '#fff');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px "Noto Sans SC"';
    ctx.fillText('+', x + w / 2 - 10, top + 90);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(x + 14, top + 100, w - 28, 40);
    ctx.strokeStyle = '#166534';
    ctx.strokeRect(x + 14, top + 100, w - 28, 40);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(x + w / 2 - 20, floorY - 64, 40, 64);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText('绿码通道', x + 12, floorY - 70);
  },
  convenience(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, top, w, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.fillText('FamilyMart', x + 10, top + 22);
    stripes(ctx, x + 4, top + 30, w - 8, '#0284c7', '#f97316');
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(x + 12, top + 58, w - 24, 50);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 16, floorY - 36, 26, 20);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 46, floorY - 36, 26, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '9px "Noto Sans SC"';
    ctx.fillText('便当', x + 18, floorY - 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + w - 40, floorY - 70, 28, 70);
  },
  mall(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, top + 24, w, h - 24);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, top, w, 28);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px "Noto Sans SC"';
    ctx.fillText('朝阳汇', x + 16, top + 20);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < Math.max(3, Math.floor((w - 20) / 32)); c++) {
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(x + 12 + c * 32, top + 40 + r * 28, 24, 18);
      }
    }
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + w / 2 - 24, floorY - 80, 48, 80);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 8, floorY - 14, w - 16, 8);
  },
  metro(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#115e59';
    ctx.fillRect(x, top + 40, w, h - 40);
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(x - 8, top, w + 16, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillText('地铁 10号线', x + 12, top + 26);
    ctx.fillStyle = '#5eead4';
    ctx.fillRect(x + 16, top + 56, 28, 36);
    ctx.fillRect(x + 52, top + 56, 28, 36);
    ctx.fillStyle = '#134e4a';
    ctx.fillRect(x + w / 2 - 18, floorY - 72, 36, 72);
    ctx.fillStyle = '#99f6e4';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText('进站', x + w / 2 - 12, floorY - 78);
  },
  busStop(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(x + 6, top + 8, w - 12, 10);
    ctx.fillRect(x + 10, top + 18, 10, h - 18);
    ctx.fillRect(x + w - 20, top + 18, 10, h - 18);
    ctx.fillStyle = 'rgba(186,230,253,0.22)';
    ctx.fillRect(x + 20, top + 18, w - 40, h - 40);
    ctx.fillStyle = '#fbbf24';
    rr(ctx, x + 16, top + 28, w - 32, 32, 4);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText('126路', x + 24, top + 50);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 28, floorY - 18, w - 56, 6);
  },
  parlor(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(x, top + 32, w, h - 32);
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(x, top, w, 36);
    ctx.fillStyle = '#fecdd3';
    ctx.font = 'bold 15px "Noto Sans SC"';
    ctx.fillText('林记推拿', x + 12, top + 24);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(x + 16, floorY - 28, 48, 12);
    ctx.fillRect(x + 72, floorY - 28, 48, 12);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(x + w / 2 - 16, floorY - 70, 32, 70);
    ctx.fillStyle = '#fff1f2';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText('艾草味', x + 12, top + 52);
  },
  club(ctx, x, top, w, h, floorY, title) {
    const pulse = 0.4 + Math.sin(Date.now() / 150) * 0.3;
    ctx.fillStyle = '#1e0533';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = `rgba(244,114,182,${pulse})`;
    ctx.fillRect(x, top, w, 34);
    ctx.fillStyle = '#f5d0fe';
    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.fillText('NEON', x + 16, top + 24);
    ctx.fillStyle = `rgba(34,211,238,${pulse})`;
    ctx.fillRect(x + 12, top + 48, 36, 24);
    ctx.fillStyle = `rgba(250,204,21,${pulse})`;
    ctx.fillRect(x + 56, top + 48, 36, 24);
    ctx.fillStyle = '#581c87';
    ctx.fillRect(x + w / 2 - 18, floorY - 78, 36, 78);
  },
  hospital(ctx, x, top, w, h, floorY, title, icon) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, top + 36, w, h - 36);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, top, w, 40);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + w / 2 - 18, top + 6, 12, 28);
    ctx.fillRect(x + w / 2 - 30, top + 14, 36, 12);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.fillText('市第二人民医院', x + 12, top + 26);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, top + 40, w, 22);
    ctx.fillStyle = '#7f1d1d';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText('发热门诊  FEVER CLINIC  请沿黄线', x + 10, top + 56);
    const cols = Math.max(4, Math.floor((w - 20) / 28));
    const rows = Math.max(3, Math.floor((h - 140) / 26));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(x + 12 + c * 28, top + 72 + r * 26, 22, 16);
        ctx.strokeStyle = '#0369a1';
        ctx.strokeRect(x + 12 + c * 28, top + 72 + r * 26, 22, 16);
      }
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 8, floorY - 36, 70, 12);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + w / 2 - 28, floorY - 70, 56, 70);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "Noto Sans SC"';
    ctx.fillText('门诊入口', x + w / 2 - 26, floorY - 76);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, floorY - 8, w, 8);
  },
  hotel(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x, top + 24, w, h - 24);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, top, w, 28);
    ctx.fillStyle = '#fff7ed';
    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillText('钟点房', x + 12, top + 20);
    for (let r = 0; r < 3; r++) {
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x + 14, top + 40 + r * 28, 22, 16);
      ctx.fillRect(x + 44, top + 40 + r * 28, 22, 16);
    }
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x + w / 2 - 16, floorY - 60, 32, 60);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 8, floorY - 18, 28, 10);
  },
  ktv(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#a21caf';
    ctx.fillRect(x, top, w, 30);
    ctx.fillStyle = '#f5d0fe';
    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.fillText('KTV', x + 16, top + 22);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(x + 14, top + 44, 18, 40);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(x + 40, top + 52, 18, 32);
    ctx.fillStyle = '#581c87';
    ctx.fillRect(x + w / 2 - 16, floorY - 64, 32, 64);
  },
  committee(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#4d7c0f';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top);
    ctx.lineTo(x + w + 8, top + 40);
    ctx.lineTo(x - 8, top + 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3f6212';
    ctx.fillRect(x + 6, top + 40, w - 12, h - 40);
    ctx.fillStyle = '#ecfccb';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText('居委会', x + 16, top + 62);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 16, top + 72, w - 32, 16);
    ctx.fillStyle = '#7f1d1d';
    ctx.font = '10px "Noto Sans SC"';
    ctx.fillText('核酸/物资', x + 20, top + 84);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + w / 2 - 14, floorY - 40, 28, 40);
  },
  office(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, top, w, 22);
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 13px "Noto Sans SC"';
    ctx.fillText('写字楼', x + 12, top + 16);
    const cols = Math.max(3, Math.floor((w - 16) / 26));
    const rows = Math.max(4, Math.floor((h - 100) / 22));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (c + r) % 3 ? '#fde68a' : '#334155';
        ctx.fillRect(x + 10 + c * 26, top + 30 + r * 22, 20, 14);
      }
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + w / 2 - 22, floorY - 70, 44, 70);
  },
  soy(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x, top + 26, w, h - 26);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, top, w, 28);
    ctx.fillStyle = '#fff7ed';
    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillText('胡记豆浆', x + 10, top + 20);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x + 12, top + 48, w - 24, 36);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 16, floorY - 22, 22, 14);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(x + w - 36, floorY - 56, 24, 56);
  },
  supermarket(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#166534';
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x, top, w, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px "Noto Sans SC"';
    ctx.fillText('生鲜超市', x + 12, top + 22);
    ctx.fillStyle = '#bbf7d0';
    ctx.fillRect(x + 12, top + 48, w - 24, 44);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 16, floorY - 24, 20, 14);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 40, floorY - 24, 20, 14);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(x + w / 2 - 18, floorY - 58, 36, 58);
  },
  clothes(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, top + 28, w, h - 28);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, top, w, 28);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillText('优衣库', x + 12, top + 20);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(x + 12, top + 44, w - 24, 50);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 20, top + 52, 16, 28);
    ctx.fillRect(x + 44, top + 52, 16, 28);
    ctx.fillRect(x + w / 2 - 16, floorY - 60, 32, 60);
  },
  gate(ctx, x, top, w, h, floorY, title) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 8, top + 20, 16, h - 20);
    ctx.fillRect(x + w - 24, top + 20, 16, h - 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, top, w, 24);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 12px "Noto Sans SC"';
    const t = (title || '过区').slice(0, 8);
    ctx.fillText(t, x + 8, top + 17);
    ctx.fillStyle = 'rgba(251,191,36,0.2)';
    ctx.fillRect(x + 24, top + 24, w - 48, h - 40);
  },
  pcr(ctx, x, top, w, h, floorY) {
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 8, top + 26, w - 16, h - 26);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, top, w, 28);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Noto Sans SC"';
    ctx.fillText('核酸采样亭', x + 8, top + 19);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(x + 16, top + 42, w - 32, 32);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 20, top + 48, w - 40, 8);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x + w / 2 - 14, floorY - 44, 28, 44);
  }
};
