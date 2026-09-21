/**
 * 增强渲染系统
 * 提升游戏视觉效果：粒子效果、后处理、特效
 */

import { gameState } from '../data/gameState.js';

// 粒子系统
const particles = [];

/**
 * 粒子类
 */
class Particle {
  constructor(x, y, vx, vy, color, life, size = 2) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.alpha = 1;
  }

  update(delta) {
    this.x += this.vx * delta * 60;
    this.y += this.vy * delta * 60;
    this.vy += 0.2 * delta * 60; // 重力
    this.life -= delta;
    this.alpha = this.life / this.maxLife;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

/**
 * 创建粒子爆发效果
 */
export function createParticleBurst(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 2; // 向上偏移
    const life = 0.5 + Math.random() * 0.5;
    const size = 2 + Math.random() * 2;
    particles.push(new Particle(x, y, vx, vy, color, life, size));
  }
}

/**
 * 更新所有粒子
 */
export function updateParticles(delta) {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(delta);
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

/**
 * 渲染所有粒子（在世界坐标系中）
 */
export function renderParticles(ctx) {
  particles.forEach(p => p.draw(ctx));
}

/**
 * 渲染后处理效果（屏幕空间）
 */
export function renderPostProcessing(ctx, canvas) {
  // 发烧时红色脉冲
  if (gameState.bodyTemp >= 38.5) {
    const feverIntensity = Math.min((gameState.bodyTemp - 38.5) / 2, 1);
    const pulse = Math.sin(Date.now() / 500) * 0.5 + 0.5;
    ctx.save();
    ctx.globalAlpha = feverIntensity * pulse * 0.2;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // 理智低时边缘暗化 + 扭曲效果
  if (gameState.sanity < 50) {
    const sanityEffect = (50 - gameState.sanity) / 50;

    // 暗角效果
    ctx.save();
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 100,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${sanityEffect * 0.7})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 噪点效果
    if (gameState.sanity < 20) {
      ctx.save();
      ctx.globalAlpha = (20 - gameState.sanity) / 20 * 0.15;
      for (let i = 0; i < 100; i++) {
        const nx = Math.random() * canvas.width;
        const ny = Math.random() * canvas.height;
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(nx, ny, 2, 2);
      }
      ctx.restore();
    }
  }

  // 饥饿时画面边缘泛白
  if (gameState.hunger < 20) {
    const hungerEffect = (20 - gameState.hunger) / 20;
    ctx.save();
    ctx.globalAlpha = hungerEffect * 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, 20);
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillRect(0, 0, 20, canvas.height);
    ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
    ctx.restore();
  }
}

/**
 * 屏幕震动效果
 */
let shakeIntensity = 0;
let shakeDecay = 0;

export function triggerScreenShake(intensity, duration = 0.5) {
  shakeIntensity = intensity;
  shakeDecay = intensity / duration;
}

export function updateScreenShake(delta) {
  if (shakeIntensity > 0) {
    shakeIntensity -= shakeDecay * delta;
    if (shakeIntensity < 0) shakeIntensity = 0;
  }
}

export function getShakeOffset() {
  if (shakeIntensity <= 0) return { x: 0, y: 0 };

  return {
    x: (Math.random() - 0.5) * shakeIntensity * 2,
    y: (Math.random() - 0.5) * shakeIntensity * 2
  };
}

/**
 * 绘制交互提示光晕
 */
export function renderInteractionHint(ctx, x, y, label) {
  const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
  const alpha = 0.4 + pulse * 0.3;

  // 光晕圆圈
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 25 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 提示文字
  ctx.save();
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(label, x - ctx.measureText(label).width / 2 + 1, y + 45 + 1);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(label, x - ctx.measureText(label).width / 2, y + 45);
  ctx.restore();
}

/**
 * 绘制状态指示器（世界空间）
 */
export function renderStatusIndicator(ctx, x, y, status, color) {
  ctx.save();
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  ctx.fillText(status, x + 1, y - 70 + 1);
  ctx.fillStyle = color;
  ctx.fillText(status, x, y - 70);
  ctx.restore();
}

/**
 * 清理粒子系统
 */
export function clearParticles() {
  particles.length = 0;
}
