import { gameState } from '../data/gameState.js';
import { MAPS, getMap, FLOOR_Y } from '../data/maps.js';
import { livingNpcs } from './npcInteractSystem.js';
import { showToast } from '../ui/toast.js';
import { updateHUD } from '../ui/hud.js';
import { think } from './simsLifeSystem.js';
import { audio } from '../utils/audio.js';

export function initMaps() {
  if (!gameState.mapId || gameState.mapId === 'street' || gameState.mapId === 'river') {
    gameState.mapId = 'living';
  }
}

export function getActiveMap() {
  return getMap(gameState.mapId || 'living');
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
  if (gameState.isPositiveKnown && (mapId === 'club' || mapId === 'office' || mapId === 'redlight' || mapId === 'cbd')) {
    showToast('红码拦在门外。', 'error');
    return;
  }
  if (gameState.lockdownLevel >= 3 && (mapId === 'club' || mapId === 'redlight')) {
    showToast('静默管理，红灯区卷帘落了一半。你仍可以从巷缝挤进去。', 'info');
  }
  gameState.mapId = mapId;
  const p = window.player;
  if (p) {
    p.x = spawnX ?? 180;
    p.targetX = null;
    p.vx = 0;
    p.loft = false;
  }
  spawnMapNpcs();
  audio.playTone(mapId === 'club' ? 220 : 360, 0.18, 'triangle', 0.08);
  think(`到了：${map.name}`);
  if (toast) showToast(toast, 'info');
  updateHUD();
}

export const TRAVEL = {
  enterLiving: () => travelTo('living', 900, '回到朝阳里生活区。单元楼、核酸亭、居委会帐篷。'),
  enterCommerce: () => travelTo('commerce', 200, '北大街商业区。药房、全家、超市连成一条街。'),
  enterRedlight: () => travelTo('redlight', 200, '霓虹夜巷。推拿馆、KTV、夜店挤在一条巷里。'),
  enterCivic: () => travelTo('civic', 200, '政务医疗区。黄线、卡口、雾炮车。'),
  enterCbd: () => travelTo('cbd', 200, '商务办公区。玻璃幕墙和瑞幸柜子。'),
  enterRiverside: () => travelTo('riverside', 200, '滨江工业区。铁皮围挡和江风。'),
  enterMetro: () => travelTo('metro', 160, '闸机夹着背包。广播重复请佩戴口罩。'),
  enterBus: () => travelTo('bus', 160, '126路门一开，热气和消毒水涌出来。'),
  enterClub: () => travelTo('club', 180, gameState.hour >= 21 || gameState.hour < 4 ? '低音从消防通道漏出来。' : '白天的夜店像没醒。'),
  enterHospital: () => travelTo('hospital', 160, '走廊里全是鞋套声。'),
  enterOffice: () => travelTo('office', 160, '23楼电梯门开。'),
  enterRiver: () => travelTo('riverside', 200, '江风灌进领口。'),
  exitToStreet: () => travelTo('living', 900, '你又站回生活区人行道。'),
  enterMall: () => travelTo('mall', 180, '中央空调一灌，口罩内侧全是水汽。安检让你亮码。'),
  enterPharmacy: () => travelTo('pharmacyIn', 160, '绿码通道。柜台玻璃上贴着“退热药限购”。'),
  enterStore: () => travelTo('storeIn', 160, '门铃叮一声。关东煮在咕嘟。'),
  enterSoy: () => travelTo('storeIn', 160, '豆浆铺太小，先在全家热一下。'),
  enterMarket: () => travelTo('mall', 1120, '生鲜区连着商场负一层。'),
  enterHome: () => travelTo('home', 200, '防盗门一关，消毒水味淡了，潮味上来了。'),
  enterParlor: () => travelTo('parlorIn', 200, '艾草和红花油。林姐没抬头。'),
  enterHotel: () => travelTo('hotel', 180, '前台只要现金。床单有折痕。'),
  enterKtv: () => travelTo('ktv', 180, '麦套没换。包厢灯是紫的。'),
  enterCommittee: () => travelTo('committee', 180, '帐篷里的电风扇对着表格吹。'),
  enterLobby: () => travelTo('lobby', 180, '测温柱滴了一声。闸机等你刷卡。')
};
