import { gameState } from '../data/gameState.js';
import { MAPS, getMap, FLOOR_Y } from '../data/maps.js';
import { livingNpcs } from './npcInteractSystem.js';
import { showToast } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { think } from './simsLifeSystem.js';
import { audio } from '../utils/audio.js';

export function initMaps() {
  if (!gameState.mapId) gameState.mapId = 'street';
}

export function getActiveMap() {
  return getMap(gameState.mapId || 'street');
}

export function getActiveLandmarks() {
  return getActiveMap().landmarks;
}

export function getWorldWidth() {
  return getActiveMap().width;
}

export function getFloorY() {
  return FLOOR_Y;
}

export function spawnMapNpcs() {
  const map = getActiveMap();
  livingNpcs.length = 0;
  for (const tpl of map.npcs || []) {
    livingNpcs.push({
      ...tpl,
      mapId: map.id,
      rel: gameState.npcRel?.[tpl.id] ?? 40,
      happiness: 62,
      energy: 80,
      assignedRoom: null,
      pose: 'walk',
      anim: Math.random() * 10,
      bubble: '',
      bubbleT: 0
    });
  }
}

export function travelTo(mapId, spawnX, toast) {
  const map = getMap(mapId);
  if (!map) return;
  if (gameState.isPositiveKnown && (mapId === 'club' || mapId === 'office')) {
    showToast('红码拦在门外。', 'error');
    return;
  }
  if (gameState.lockdownLevel >= 3 && mapId === 'club') {
    showToast('静默管理，夜店卷帘落下来了。你仍可以从巷尾缝里挤——风险自负。', 'info');
  }
  gameState.mapId = mapId;
  const p = window.player;
  if (p) {
    p.x = spawnX ?? 180;
    p.targetX = null;
    p.vx = 0;
  }
  spawnMapNpcs();
  audio.playTone(mapId === 'club' ? 220 : 360, 0.18, 'triangle', 0.08);
  think(`到了：${map.name}`);
  if (toast) showToast(toast, 'info');
  updateHUD();
}

export const TRAVEL = {
  enterMetro: (p) => travelTo('metro', 160, '闸机夹着你的背包进了车厢。广播重复着“请佩戴口罩”。'),
  enterBus: (p) => travelTo('bus', 160, '126路门一开，热气和消毒水一块涌出来。'),
  enterClub: (p) => {
    const night = gameState.hour >= 21 || gameState.hour < 4;
    travelTo('club', 180, night ? '低音从消防通道里漏出来。' : '白天的夜店像没醒，灯却还开着。');
  },
  enterHospital: (p) => travelTo('hospital', 160, '黄线、护目镜、打印纸。走廊里全是鞋套声。'),
  enterOffice: (p) => travelTo('office', 160, '23楼电梯门开，隔板后面键盘声此起彼伏。'),
  enterRiver: (p) => travelTo('river', 160, '江风灌进领口。铁皮围挡上喷着“禁止聚集”。'),
  exitToStreet: (p) => travelTo('street', 1760, '你又站回人行道上。')
};
