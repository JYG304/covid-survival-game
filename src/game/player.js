/**
 * 玩家控制系统
 * 处理玩家移动、输入和交互
 */

import { gameState } from '../data/gameState.js';
import { FLOOR_Y } from '../data/landmarks.js';
import { getActiveLandmarks, getWorldWidth } from '../systems/mapSystem.js';
import { actionHandlers } from '../systems/actionSystem.js';
import { advanceTime } from '../systems/timeSystem.js';
import { updateHUD } from '../ui/hud.js';
import { nearestNpc } from '../systems/npcInteractSystem.js';

export const player = {
  x: 220,
  y: FLOOR_Y,
  vx: 0,
  speed: 3.5,
  facing: 1,
  isMoving: false,
  walkCycle: 0,
  targetX: null,
  pendingTarget: null
};

export const keys = {
  left: false,
  right: false,
  interact: false
};

/**
 * 初始化输入控制
 */
export function initControls() {
  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      keys.interact = true;
      tryInteract();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') keys.interact = false;
  });

  // 移动端触摸控制
  const btnLeft = document.getElementById('btnMobileLeft');
  const btnRight = document.getElementById('btnMobileRight');
  const btnAction = document.getElementById('btnMobileAction');

  if (btnLeft) {
    btnLeft.addEventListener('touchstart', () => keys.left = true);
    btnLeft.addEventListener('touchend', () => keys.left = false);
  }

  if (btnRight) {
    btnRight.addEventListener('touchstart', () => keys.right = true);
    btnRight.addEventListener('touchend', () => keys.right = false);
  }

  if (btnAction) {
    btnAction.addEventListener('click', tryInteract);
  }

  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cam = window.cameraX || 0;
      const worldX = (e.clientX - rect.left) * scaleX + cam;
      const worldY = (e.clientY - rect.top) * scaleY;
      handleWorldClick(worldX, worldY);
    });
  }
}

function handleWorldClick(worldX, worldY) {
  if (gameState.activeAction) return;
  const npc = nearestNpc(worldX, 48);
  if (npc && Math.abs(npc.x - worldX) < 48 && worldY > FLOOR_Y - 110) {
    if (Math.abs(player.x - npc.x) < 40) {
      window.DeepGameplay?.talkNearbyNpc(player);
      return;
    }
    player.targetX = npc.x;
    player.pendingTarget = { type: 'npc', npc };
    return;
  }
  for (const item of getActiveLandmarks()) {
    const left = item.x - 8;
    const right = item.x + item.width + 8;
    const top = FLOOR_Y - item.height - 24;
    if (worldX >= left && worldX <= right && worldY >= top && worldY <= FLOOR_Y + 24) {
      const cx = item.x + item.width / 2;
      if (Math.abs(player.x - cx) < 50) {
        startActivity(item);
        return;
      }
      player.targetX = cx;
      player.pendingTarget = { type: 'landmark', landmark: item };
      return;
    }
  }
  player.pendingTarget = null;
  player.targetX = worldX;
}

/**
 * 尝试与附近物体交互
 */
export function tryInteract() {
  if (gameState.activeAction) return;
  const npc = nearestNpc(player.x, 70);
  if (npc && (!gameState.nearbyItem || Math.abs(npc.x - player.x) < 55)) {
    window.DeepGameplay?.talkNearbyNpc(player);
    return;
  }
  if (!gameState.nearbyItem) return;
  startActivity(gameState.nearbyItem);
}

/**
 * 开始执行活动
 */
export function startActivity(landmark) {
  if (!landmark) return;

  gameState.activeAction = {
    landmark,
    elapsed: 0,
    duration: landmark.actionDuration
  };

  // 显示进度条
  const overlay = document.getElementById('actionProgressOverlay');
  const title = document.getElementById('actionProgressTitle');
  const timeLabel = document.getElementById('actionTimeLabel');

  if (overlay) overlay.classList.remove('hidden');
  if (title) title.innerText = `正在 ${landmark.name}...`;
  if (timeLabel) timeLabel.innerText = `耗时 ${landmark.timeCostMinutes} 分钟`;
}

/**
 * 完成活动
 */
export function completeActivity(action) {
  const overlay = document.getElementById('actionProgressOverlay');
  if (overlay) overlay.classList.add('hidden');

  // 推进时间
  advanceTime(action.landmark.timeCostMinutes);

  // 执行动作
  const handler = actionHandlers[action.landmark.action];
  if (handler) {
    handler(player);
  }

  // 如果动作是打开模态框，需要特殊处理
  if (action.landmark.action === 'openPhone') {
    const modal = document.getElementById('modalPhone');
    if (modal) modal.classList.remove('hidden');
  } else if (action.landmark.action === 'openKitchen') {
    const modal = document.getElementById('modalKitchen');
    if (modal) modal.classList.remove('hidden');
  } else if (action.landmark.action === 'openCommute') {
    openCommuteModal();
  }

  gameState.activeAction = null;
  updateHUD();
}

/**
 * 打开通勤选择模态框
 */
function openCommuteModal() {
  // 动态导入以避免循环依赖
  import('../ui/toast.js').then(({ showToast }) => {
    if (gameState.isPositiveKnown) {
      showToast('健康码红码！门禁与公共交通均已拦截，无法通勤！', 'error');
      return;
    }
    if (gameState.lockdownLevel >= 3) {
      showToast('全区启动静态管理，公司写字楼关闭，地铁停运！', 'error');
      return;
    }
    if (gameState.hasWorkedToday) {
      showToast('今天已经在工位上打过卡完成工作了，明天再去吧！', 'info');
      return;
    }
    const modal = document.getElementById('modalCommute');
    if (modal) modal.classList.remove('hidden');
  });
}

/**
 * 更新玩家状态
 * @param {number} delta - 帧间隔时间
 */
export function updatePlayer(delta) {
  // 处理正在进行的动作
  if (gameState.activeAction) {
    gameState.activeAction.elapsed += delta;
    const progress = Math.min(1, gameState.activeAction.elapsed / gameState.activeAction.duration);
    const fillBar = document.getElementById('actionFillBar');
    if (fillBar) fillBar.style.width = `${progress * 100}%`;

    if (progress >= 1) {
      completeActivity(gameState.activeAction);
    }
    return;
  }

  // 移动逻辑
  let moving = false;
  if (keys.left) {
    player.vx = -player.speed;
    player.facing = -1;
    player.targetX = null;
    moving = true;
  } else if (keys.right) {
    player.vx = player.speed;
    player.facing = 1;
    player.targetX = null;
    moving = true;
  } else if (player.targetX !== null) {
    const dx = player.targetX - player.x;
    if (Math.abs(dx) > 6) {
      player.vx = Math.sign(dx) * player.speed;
      player.facing = Math.sign(dx);
      moving = true;
    } else {
      player.vx = 0;
      player.x = player.targetX;
      player.targetX = null;
      if (player.pendingTarget) {
        const t = player.pendingTarget;
        player.pendingTarget = null;
        if (t.type === 'npc') window.DeepGameplay?.talkNearbyNpc(player);
        else if (t.landmark) startActivity(t.landmark);
      }
    }
  } else {
    player.vx = 0;
  }

  player.x += player.vx;
  player.x = Math.max(50, Math.min(getWorldWidth() - 50, player.x));
  player.isMoving = moving;

  if (moving) {
    player.walkCycle += delta * 11;
  }

  updateNearbyLandmark();
}

/**
 * 检测附近的地标物体
 */
function updateNearbyLandmark() {
  let nearest = null;
  let minDistance = 80;

  for (const item of getActiveLandmarks()) {
    const cx = item.x + item.width / 2;
    const dist = Math.abs(player.x - cx);
    if (dist < minDistance) {
      nearest = item;
      minDistance = dist;
    }
  }

  gameState.nearbyItem = nearest;
  const npc = nearestNpc(player.x, 70);
  gameState.nearbyNpc = npc || null;

  const prompt = document.getElementById('interactPrompt');
  const promptLabel = document.getElementById('promptActionLabel');

  if (gameState.activeAction) {
    if (prompt) prompt.classList.add('hidden');
    return;
  }
  if (npc && (!nearest || Math.abs(npc.x - player.x) < 55)) {
    if (prompt) prompt.classList.remove('hidden');
    if (promptLabel) promptLabel.innerText = `${npc.name}（${npc.role}）：聊天 / 拉去推拿馆`;
    return;
  }
  if (nearest) {
    if (prompt) prompt.classList.remove('hidden');
    if (promptLabel) promptLabel.innerText = `${nearest.name}: ${nearest.prompt}`;
  } else if (prompt) {
    prompt.classList.add('hidden');
  }
}
