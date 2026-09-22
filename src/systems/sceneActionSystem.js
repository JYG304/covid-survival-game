import { gameState } from '../data/gameState.js';
import { showToast, spawnFloatingText } from '../ui/toast.js';
import { addNeed, addMoodlet, think, applyLifeAction } from './simsLifeSystem.js';
import { audio } from '../utils/audio.js';
import { updateHUD } from '../ui/hud.js';
import { TRAVEL, travelTo, getActiveMap } from './mapSystem.js';
import { startOfficeWork } from './officeWorkSystem.js';
import { flagQuest } from './questSystem.js';
import { applyStatEvent } from './statsSystem.js';
import { yOfFloor } from '../data/maps.js';

function fx(player, text, color) {
  spawnFloatingText(text, player?.x ?? 200, (player?.y ?? 400) - 70, color);
}

export const sceneActions = {
  ...TRAVEL,

  metroDestinations() {
    const box = document.getElementById('modalMapPick');
    const list = document.getElementById('mapPickList');
    if (!box || !list) {
      travelTo('hospital', 160, '你跟着人流出了医院站。');
      return;
    }
    list.innerHTML = [
      ['living', '🏠 生活区', '朝阳里小区'],
      ['commerce', '🏪 商业区', '北大街店铺'],
      ['redlight', '🔴 红灯区', '夜巷推拿夜店'],
      ['civic', '🏥 医疗区', '医院卡口'],
      ['cbd', '💼 办公区', '写字楼'],
      ['riverside', '🌊 滨江区', '围挡栈道'],
      ['mall', '🏬 商场', '试衣间']
    ].map(([id, n, d]) => `<button data-map="${id}" class="w-full text-left px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 hover:border-amber-400">
      <b class="text-amber-200">${n}</b><span class="block text-[11px] text-zinc-400">${d}</span></button>`).join('');
    list.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        box.classList.add('hidden');
        const fn = {
          living: TRAVEL.enterLiving,
          commerce: TRAVEL.enterCommerce,
          redlight: TRAVEL.enterRedlight,
          civic: TRAVEL.enterCivic,
          cbd: TRAVEL.enterCbd,
          riverside: TRAVEL.enterRiverside,
          mall: TRAVEL.enterMall
        }[b.dataset.map];
        if (fn) fn();
      };
    });
    box.classList.remove('hidden');
  },

  metroHold(player) {
    applyStatEvent('crowd');
    addNeed('energy', -6);
    addNeed('hygiene', -3);
    if (!gameState.hasMaskOn) gameState.viralLoad = Math.min(100, gameState.viralLoad + 4);
    fx(player, '吊环凉得发抖', '#94a3b8');
    think('车厢一晃，有人贴上来。');
    showToast('你抓住吊环。广播里循环播放防疫口诀。', 'info');
  },
  metroSit(player) {
    addNeed('energy', 8);
    addNeed('comfort', 10);
    addNeed('fun', 4);
    fx(player, '终于坐下', '#38bdf8');
    showToast('优先座空着。你坐下刷新闻，躲过过道里的咳嗽。', 'success');
  },
  metroNews(player) {
    addNeed('fun', 3);
    think('字幕：部分线路抽检。');
    showToast('车载屏滚动：请扫场所码，有症状者勿乘坐公共交通。', 'info');
  },
  metroScan(player) {
    if (gameState.isPositiveKnown) {
      showToast('红码。闸机拒识。', 'error');
      return;
    }
    flagQuest('metroScanned');
    addNeed('social', -2);
    fx(player, '绿码通过', '#4ade80');
    showToast('健康码刷新。摄像头亮了一下。', 'success');
  },

  busPay(player) {
    if (gameState.money < 2) {
      showToast('零钱都没有。司机盯了你一眼，还是让你上来了。', 'error');
      addNeed('sanity', -4);
      return;
    }
    gameState.money -= 2;
    think('投币口黏糊糊的。');
    fx(player, '-¥2', '#fbbf24');
    showToast('司机：前面医院站封了一条道，可能绕行。', 'info');
  },
  busSit(player) {
    addNeed('comfort', 8);
    addNeed('energy', 5);
    addNeed('fun', 5);
    fx(player, '窗外雾炮车', '#7dd3fc');
    showToast('座位在抖。窗外雾炮车喷过，树叶全白了。', 'info');
  },
  busStand(player) {
    applyStatEvent('crowd');
    addNeed('energy', -8);
    addNeed('hygiene', -4);
    if (!gameState.hasMaskOn) gameState.viralLoad = Math.min(100, gameState.viralLoad + 5);
    addMoodlet('crowded', '被挤在车厢里', -8, 3, '🚌');
    showToast('过道里全是购物袋。有人压到你的脚。', 'info');
  },

  clubDrink(player) {
    if (gameState.money < 38) {
      showToast('吧台最低 ¥38。', 'error');
      return;
    }
    gameState.money -= 38;
    addNeed('fun', 16);
    addNeed('social', 8);
    addNeed('hunger', -4);
    addNeed('hygiene', -2);
    applyLifeAction('social', player);
    fx(player, '气泡水上头', '#e879f9');
    think('冰块撞杯，像没封城。');
    showToast('Mia 给你倒了一杯几乎没酒的东西。低音从地板爬上来。', 'success');
  },
  clubDance(player) {
    applyStatEvent('dance');
    addNeed('fun', 28);
    addNeed('energy', -14);
    addNeed('hygiene', -10);
    addNeed('social', 12);
    addNeed('comfort', -6);
    addMoodlet('neon', '霓虹里出了一身汗', 12, 8, '🎵');
    if (!gameState.hasMaskOn) gameState.viralLoad = Math.min(100, gameState.viralLoad + 8);
    fx(player, '舞池', '#f472b6');
    showToast('你被卷进舞池。口罩边缘全是湿的。', 'success');
  },
  clubDj(player) {
    flagQuest('clubWork');
    gameState.money += 90;
    addNeed('energy', -16);
    addNeed('fun', 18);
    addNeed('social', 10);
    applyLifeAction('work', player);
    fx(player, '打碟 +¥90', '#fde68a');
    showToast('Neo 把耳机扔给你。两首歌的钱进账。', 'success');
    audio.playCash?.();
  },
  clubVip(player) {
    addNeed('comfort', 14);
    addNeed('social', 16);
    addNeed('fun', 10);
    applyLifeAction('social', player);
    think('卡座里有人讲谁阳了。');
    showToast('老K让你坐下。话题在薪水和核酸之间来回跳。', 'info');
  },
  clubWash(player) {
    addNeed('hygiene', 22);
    addNeed('comfort', 6);
    showToast('洗手台只剩冷水。镜子里瞳孔被粉紫灯照得不像自己。', 'info');
  },
  clubSmoke(player) {
    addNeed('fun', 6);
    addNeed('sanity', 4);
    addNeed('hygiene', -6);
    addNeed('social', 8);
    showToast('后门过道里有人抽烟。网格员手电筒扫过又走了。', 'info');
  },

  hospTriage(player) {
    flagQuest('triaged');
    addNeed('energy', -4);
    addNeed('sanity', -3);
    if (gameState.bodyTemp >= 37.3) {
      showToast('预检：体温偏高，被分到发热通道。', 'error');
      addMoodlet('triage', '进了发热通道', -10, 6, '🌡️');
    } else {
      showToast('预检：体温正常。叶护士让你去黄线等。', 'success');
    }
  },
  hospQueue(player) {
    addNeed('sanity', -8);
    addNeed('energy', -6);
    addNeed('comfort', -10);
    addNeed('fun', -6);
    think('号码牌：184。现在叫 126。');
    showToast('黄线上的人都不说话。广播重复叫号。', 'info');
  },
  hospIV(player) {
    if (gameState.money < 120) {
      showToast('输液 ¥120，钱不够。', 'error');
      return;
    }
    gameState.money -= 120;
    gameState.bodyTemp = Math.max(36.6, gameState.bodyTemp - 0.6);
    addNeed('energy', 10);
    addNeed('comfort', -8);
    addNeed('sanity', 6);
    fx(player, '退热', '#38bdf8');
    showToast('盐水凉凉地进手背。窗外是停车场的消毒水。', 'success');
  },
  hospMeds(player) {
    if (gameState.money < 45) {
      showToast('门诊药 ¥45。', 'error');
      return;
    }
    gameState.money -= 45;
    gameState.pillsCount += 2;
    fx(player, '+2 退热药', '#fb7185');
    showToast('药房窗口把药扔进袋子，比街上便宜。', 'success');
  },

  openOfficeWork(player) {
    if (gameState.hasWorkedToday) {
      showToast('今天的工位已经坐过了。', 'info');
      return;
    }
    startOfficeWork('写字楼工位', 0, 20, 0.08);
  },
  officeWater(player) {
    addNeed('comfort', 6);
    addNeed('social', 10);
    addNeed('fun', 4);
    applyLifeAction('social', player);
    showToast('茶水间：有人说隔壁组两个人没来。饮水机咕嘟一声。', 'info');
  },
  officePrint(player) {
    addNeed('social', 8);
    addNeed('fun', -2);
    addNeed('energy', -3);
    showToast('你把手伸进打印机肚子里拽出一张皱纸。小敏说谢谢。', 'success');
  },
  officeMeeting(player) {
    addNeed('energy', -12);
    addNeed('fun', -10);
    addNeed('social', 6);
    const bonus = Math.random() > 0.5 ? 40 : 0;
    if (bonus) {
      gameState.money += bonus;
      fx(player, `被点名 +¥${bonus}`, '#fde68a');
      showToast('会上被点名汇报。HR 记下了你的全勤。', 'success');
    } else {
      addNeed('sanity', -6);
      showToast('会议在“协同”和“颗粒度”里循环了三十五分钟。', 'info');
    }
  },

  riverSit(player) {
    addNeed('sanity', 16);
    addNeed('comfort', 10);
    addNeed('fun', 8);
    addNeed('energy', 4);
    addMoodlet('wind', '江风灌进来', 10, 8, '🌊');
    think('对岸还亮着。');
    showToast('木头椅子是湿的。江声盖过了远处的雾炮。', 'success');
  },
  riverPeek(player) {
    addNeed('fun', 6);
    addNeed('sanity', 4);
    showToast('铁皮缝里漏出对岸的灯。有人在缝另一边抽烟。', 'info');
  },
  riverFood(player) {
    flagQuest('ateHot');
    if (gameState.money < 18) {
      showToast('烤冷面 ¥18。', 'error');
      return;
    }
    gameState.money -= 18;
    addNeed('hunger', 22);
    addNeed('fun', 10);
    addNeed('comfort', 6);
    fx(player, '热乎的', '#fb923c');
    showToast('酱汁烫手。刘师傅让你躲到围挡后面吃。', 'success');
  },
  riverDeadend(player) {
    think('红灯一直转。');
    showToast('前面焊死了。江风更大。你只能往回走。', 'info');
  },

  loftHint() {
    sceneActions.openElevator();
  },
  openElevator() {
    openElevatorUi();
  },
  openWardrobe() {
    import('./outfitSystem.js').then((m) => m.openGear());
  },
  mallEat(player) {
    if (gameState.money < 28) { showToast('盖浇饭 ¥28，不够。', 'error'); return; }
    gameState.money -= 28;
    addNeed('hunger', 32);
    addNeed('fun', 4);
    applyStatEvent('eat');
    flagQuest('ateHot');
    fx(player, '盖浇饭', '#fb923c');
    showToast('饭是热的，塑料盒是软的。中央空调把葱花味吹走。', 'success');
  },
  mallAtm() {
    showToast(`余额 ¥${gameState.money}。ATM 还要收跨行费，你没取。`, 'info');
  },
  eatInstant(player) {
    if (gameState.instantFood < 1) {
      showToast('你没带便当，微波台空转。', 'error');
      return;
    }
    gameState.instantFood -= 1;
    addNeed('hunger', 40);
    applyStatEvent('eat');
    showToast('叮。盒盖起雾。店员看了你一眼。', 'success');
  },
  storeOden(player) {
    if (gameState.money < 8) { showToast('一串 ¥8。', 'error'); return; }
    gameState.money -= 8;
    addNeed('hunger', 10);
    addNeed('comfort', 4);
    fx(player, '关东煮', '#fdba74');
    showToast('萝卜吸饱了汤。店员用夹子指了指口罩。', 'success');
  },
  hotelSleep(player) {
    if (gameState.money < 80) { showToast('钟点房 ¥80 现金。', 'error'); return; }
    gameState.money -= 80;
    addNeed('energy', 30);
    addNeed('comfort', -6);
    addNeed('hygiene', -8);
    applyStatEvent('sleep');
    showToast('窗帘拉不严。对面窗户也亮着。你还是睡着了。', 'info');
  },
  ktvNext() {
    if (!gameState.hasMaskOn) gameState.viralLoad = Math.min(100, gameState.viralLoad + 6);
    addNeed('fun', 4);
    addNeed('sanity', -4);
    showToast('隔壁有人咳。你把门带上了。', 'error');
  }
};

export function openElevatorUi() {
  const map = getActiveMap();
  const floors = map?.floors;
  const p = window.player;
  if (!floors?.count || floors.count < 2) {
    showToast('这层没有楼梯。', 'info');
    return;
  }
  const box = document.getElementById('modalElevator');
  const list = document.getElementById('elevatorList');
  if (!box || !list) {
    const next = ((p?.floor || 0) + 1) % floors.count;
    goFloor(next);
    return;
  }
  const cur = p?.floor || 0;
  const grid = floors.count > 8;
  list.className = grid ? 'grid grid-cols-3 gap-2' : 'space-y-2';
  list.innerHTML = floors.names.map((n, i) =>
    `<button data-f="${i}" class="text-left px-3 py-2 rounded-lg bg-zinc-950 border ${i === cur ? 'border-amber-400' : 'border-zinc-700 hover:border-amber-400'}">
      <b class="text-amber-200 text-sm">${n}</b>${i === cur ? '<span class="text-[11px] text-zinc-400 ml-1">当前</span>' : ''}</button>`
  ).join('');
  list.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      box.classList.add('hidden');
      goFloor(Number(b.dataset.f));
    };
  });
  box.classList.remove('hidden');
}

function goFloor(i) {
  const map = getActiveMap();
  const floors = map?.floors;
  const p = window.player;
  if (!p || !floors) return;
  const f = Math.max(0, Math.min(floors.count - 1, i));
  p.floor = f;
  p.y = yOfFloor(f);
  p.x = Math.min(p.x, (floors.stair0 || 780) - 8);
  p.targetX = null;
  think(`到了 ${floors.names[f] || (f + 1) + 'F'}`);
  showToast(floors.names[f] || `${f + 1}F`, 'info');
}

export function bindMapPickModal() {
  document.getElementById('btnCloseMapPick')?.addEventListener('click', () => {
    document.getElementById('modalMapPick')?.classList.add('hidden');
  });
  document.getElementById('btnCloseElevator')?.addEventListener('click', () => {
    document.getElementById('modalElevator')?.classList.add('hidden');
  });
}
