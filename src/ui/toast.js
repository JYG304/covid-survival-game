/**
 * Toast 通知系统
 * 显示游戏内消息提示
 */

/**
 * 显示 Toast 消息
 * @param {string} msg - 消息内容
 * @param {string} type - 消息类型: 'info' | 'success' | 'error'
 */
export function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  let borderClass = 'border-zinc-700 bg-zinc-900/95 text-zinc-200';

  if (type === 'success') {
    borderClass = 'border-emerald-500/60 bg-zinc-900/95 text-emerald-300';
  } else if (type === 'error') {
    borderClass = 'border-rose-500/60 bg-zinc-900/95 text-rose-300';
  }

  toast.className = `absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg border text-xs sm:text-sm font-code shadow-2xl transition-all duration-300 transform -translate-y-3 opacity-0 pointer-events-none flex items-center gap-2 ${borderClass}`;
  toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('-translate-y-3', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/**
 * 显示浮动文字（在游戏世界中）
 */
export const floatingTexts = [];

export function spawnFloatingText(text, x, y, color = '#fbbf24') {
  floatingTexts.push({
    text,
    x,
    y,
    color,
    life: 1.0,
    dy: -1.1
  });
}

/**
 * 更新并渲染浮动文字
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} delta - 帧间隔
 * @param {number} cameraX - 相机位置
 */
export function renderFloatingTexts(ctx, delta, cameraX) {
  ctx.save();
  ctx.translate(-cameraX, 0);

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.life -= delta * 0.85;
    ft.y += ft.dy;

    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }

    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.life);
    ctx.font = 'bold 15px "JetBrains Mono", "Noto Sans SC"';
    ctx.fillText(ft.text, ft.x - 20, ft.y);
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;
}
