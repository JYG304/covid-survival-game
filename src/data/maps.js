export const FLOOR_Y = 415;

export const LOFT_Y = 168;
export const FLOOR_GAP = 247;
export const HOME_STAIR0 = 780;
export const HOME_STAIR1 = 960;

export function yOfFloor(i) {
  return FLOOR_Y - (i || 0) * FLOOR_GAP;
}

function L(id, name, zone, x, w, h, prompt, mins, dur, action, extra) {
  return { id, name, zone, x, width: w, height: h, prompt, timeCostMinutes: mins, actionDuration: dur, action, ...extra };
}
function N(o) { return o; }

export const DISTRICTS = [
  { id: 'living', name: '生活区 · 朝阳里', short: '生活区', icon: '🏠' },
  { id: 'commerce', name: '商业区 · 北大街', short: '商业区', icon: '🏪' },
  { id: 'redlight', name: '红灯区 · 夜巷', short: '红灯区', icon: '🔴' },
  { id: 'civic', name: '政务医疗区', short: '医疗区', icon: '🏥' },
  { id: 'cbd', name: '商务办公区', short: '办公区', icon: '💼' },
  { id: 'riverside', name: '滨江工业区', short: '滨江区', icon: '🌊' }
];

export const MAPS = {
  living: {
    id: 'living',
    name: '生活区 · 朝阳里小区',
    tag: '🏠 出租屋 / 居委会 / 邻里',
    width: 3600,
    theme: 'living',
    district: 'living',
    landmarks: [
      L('living_home', '朝阳里3栋 · 你家', '生活区', 80, 280, 260, '进出租屋', 3, 0.45, 'enterHome'),
      L('contactless_rack', '无接触货架', '单元门口', 420, 110, 90, '领菜/快递', 20, 1.8, 'checkRack'),
      L('pcr_sampling_booth', '核酸亭', '小区广场', 1280, 120, 120, '咽拭子维持绿码', 30, 2.2, 'takePCR'),
      L('stray_cat_shrine', '阿花', '花坛', 1580, 80, 50, 'rua猫', 20, 1.8, 'petCat'),
      L('living_committee', '居委会帐篷', '小区广场', 1880, 140, 110, '进帐篷问物资', 4, 0.5, 'enterCommittee'),
      L('living_to_commerce', '东门 → 商业区', '朝阳里东门', 2300, 130, 130, '去北大街商业区', 8, 0.6, 'enterCommerce'),
      L('living_to_civic', '班车站 → 医疗区', '小区西侧', 2680, 130, 110, '坐班车去医院/政务', 10, 0.7, 'enterCivic'),
      L('living_metro', '地铁口', '生活区站', 3040, 200, 180, '进地铁车厢', 8, 0.7, 'enterMetro'),
      L('living_bus', '126路站', '生活区站', 3340, 160, 140, '上公交', 6, 0.6, 'enterBus')
    ],
    npcs: [
      N({ id: 'neighbor_li', name: '李姐', role: '对门', job: 'neighbor', skin: '#eab308', hair: '#7c2d12', shirt: '#7c3aed', pants: '#27272a', x: 820, homeMin: 760, homeMax: 1100, speed: 0.4, dir: 1, talk: ['鸡蛋还够吗？'] }),
      N({ id: 'courier_wu', name: '吴骑手', role: '外卖', job: 'courier', skin: '#c98a62', hair: '#111827', shirt: '#f59e0b', pants: '#0f172a', x: 1180, homeMin: 900, homeMax: 1600, speed: 1.6, dir: 1, talk: ['单还在跑。'] }),
      N({ id: 'grid_chen', name: '陈网格员', role: '网格员', job: 'official', skin: '#e2b48a', hair: '#292524', shirt: '#0369a1', pants: '#1e293b', x: 1900, homeMin: 1700, homeMax: 2200, speed: 0.5, dir: -1, talk: ['绿码通行。'] }),
      N({ id: 'hua_cat', name: '阿花', role: '三花猫', job: 'cat', skin: '#fb923c', hair: '#9a3412', shirt: '#fdba74', pants: '#7c2d12', x: 1580, homeMin: 1520, homeMax: 1680, speed: 0.22, dir: 1, talk: ['喵。'] })
    ]
  },

  commerce: {
    id: 'commerce',
    name: '商业区 · 朝阳北大街',
    tag: '🏪 药房 / 便利店 / 超市',
    width: 4100,
    theme: 'commerce',
    district: 'commerce',
    landmarks: [
      L('com_from_living', '西口 → 生活区', '北大街西', 80, 120, 120, '回朝阳里', 8, 0.6, 'enterLiving'),
      L('street_pharmacy', '老百姓大药房', '药店', 400, 220, 220, '进店', 4, 0.45, 'enterPharmacy'),
      L('street_convenience_store', '全家 24H', '便利店', 780, 220, 220, '进店', 4, 0.45, 'enterStore'),
      L('com_breakfast', '胡记豆浆', '早点铺', 1160, 180, 160, '进铺', 4, 0.45, 'enterSoy'),
      L('com_market', '生鲜超市', '超市', 1520, 240, 220, '进超市', 4, 0.45, 'enterMarket'),
      L('com_mall', '朝阳汇商场', '商场', 1960, 280, 250, '进商场换装', 5, 0.5, 'enterMall'),
      L('com_clothes', '优衣库', '服装', 2440, 200, 200, '进店试衣', 5, 0.5, 'enterMall'),
      L('com_to_cbd', '北口 → 办公区', '北大街', 2880, 130, 120, '去写字楼商务区', 10, 0.7, 'enterCbd'),
      L('com_to_red', '巷口 → 红灯区', '南巷', 3220, 130, 120, '钻进夜巷', 8, 0.7, 'enterRedlight'),
      L('com_metro', '商业区地铁', '北大街站', 3520, 140, 120, '进地铁', 8, 0.6, 'enterMetro'),
      L('com_bus', '126路', '商业区站', 3780, 120, 90, '上公交', 6, 0.6, 'enterBus')
    ],
    npcs: [
      N({ id: 'uncle_zhao', name: '赵叔', role: '常客', job: 'customer', skin: '#d4a574', hair: '#44403c', shirt: '#1e3a5f', pants: '#292524', x: 500, homeMin: 400, homeMax: 900, speed: 0.4, dir: 1, talk: ['腰椎不行了。'] }),
      N({ id: 'bus_aunt', name: '买菜阿姨', role: '顾客', job: 'passenger', skin: '#e2b48a', hair: '#78716c', shirt: '#fb7185', pants: '#44403c', x: 1680, homeMin: 1500, homeMax: 2000, speed: 0.2, dir: 1, talk: ['鸡蛋又涨了。'] })
    ]
  },

  redlight: {
    id: 'redlight',
    name: '红灯区 · 霓虹夜巷',
    tag: '🔴 推拿 / 夜店 / 小旅馆',
    width: 3600,
    theme: 'redlight',
    district: 'redlight',
    landmarks: [
      L('red_from_com', '巷口 → 商业区', '夜巷北口', 70, 120, 120, '回北大街', 8, 0.6, 'enterCommerce'),
      L('massage_parlor', '林记推拿馆', '夜巷', 400, 240, 200, '进馆', 3, 0.45, 'enterParlor'),
      L('red_hotel', '钟点房', '小旅馆', 820, 200, 190, '进旅馆开房', 4, 0.5, 'enterHotel'),
      L('club_gate', 'NEON 俱乐部', '夜店门', 1220, 240, 210, '进夜店室内', 4, 0.5, 'enterClub'),
      L('red_ktv', 'KTV', '夜巷', 1680, 220, 190, '进包厢', 4, 0.5, 'enterKtv'),
      L('red_smoke', '巷尾吸烟区', '夜巷', 2140, 110, 90, '透气、听八卦', 12, 1.1, 'clubSmoke'),
      L('red_to_river', '围挡 → 滨江', '巷尾', 2560, 130, 120, '去江边工业区', 10, 0.7, 'enterRiverside'),
      L('red_to_living', '抄近道 → 生活区', '夜巷南', 3000, 130, 120, '抄小区后门回家', 12, 0.7, 'enterLiving'),
      L('red_metro', '末班地铁缝', '夜巷', 3340, 120, 120, '赶地铁', 8, 0.6, 'enterMetro')
    ],
    npcs: [
      N({ id: 'lin_jie', name: '林姐', role: '店长', job: 'masseur', skin: '#e8b895', hair: '#1f2937', shirt: '#be123c', pants: '#111827', x: 480, homeMin: 400, homeMax: 700, speed: 0.5, dir: 1, talk: ['手艺是吃饭的本事。'] }),
      N({ id: 'ahua_staff', name: '小周', role: '技师', job: 'masseur', skin: '#f0c7a8', hair: '#78350f', shirt: '#9f1239', pants: '#1f2937', x: 560, homeMin: 420, homeMax: 720, speed: 0.45, dir: -1, talk: ['手法偏重。'] }),
      N({ id: 'club_boss', name: '老K', role: '场东', job: 'boss', skin: '#b45309', hair: '#1c1917', shirt: '#111827', pants: '#0a0a0a', x: 1320, homeMin: 1200, homeMax: 1600, speed: 0.25, dir: 1, talk: ['缺兼职。'] }),
      N({ id: 'dancer_kai', name: 'Kai', role: '常客', job: 'dancer', skin: '#d1a78a', hair: '#facc15', shirt: '#22d3ee', pants: '#18181b', x: 1760, homeMin: 1600, homeMax: 2000, speed: 0.7, dir: 1, talk: ['来不来中间？'] })
    ]
  },

  civic: {
    id: 'civic',
    name: '政务医疗区',
    tag: '🏥 医院 / 预检 / 公告栏',
    width: 3400,
    theme: 'civic',
    district: 'civic',
    landmarks: [
      L('civ_from_living', '班车点 → 生活区', '医疗区西', 70, 120, 120, '回小区', 10, 0.6, 'enterLiving'),
      L('hospital_gate', '市二院发热门诊', '医院外立面', 380, 320, 280, '进门诊大厅', 4, 0.45, 'enterHospital'),
      L('civ_triage_out', '户外预检棚', '医院门前', 820, 140, 110, '先量体温', 15, 1.3, 'hospTriage'),
      L('civ_board', '防疫公告栏', '广场', 1180, 100, 90, '看通告', 8, 0.9, 'metroNews'),
      L('civ_police', '临时卡口', '路口', 1580, 120, 110, '亮码过卡', 6, 1.0, 'metroScan'),
      L('disinfection_cannon_truck', '雾炮车', '主干道', 2000, 170, 110, '消杀外衣', 15, 1.8, 'disinfect'),
      L('civ_to_cbd', '大道 → 办公区', '东口', 2480, 130, 120, '去商务区', 10, 0.7, 'enterCbd'),
      L('civ_metro', '医院站地铁', '医疗区', 2920, 140, 120, '进地铁', 8, 0.6, 'enterMetro'),
      L('civ_bus', '126路', '医院站', 3200, 120, 90, '上公交', 6, 0.6, 'enterBus')
    ],
    npcs: [
      N({ id: 'nurse_ye', name: '叶护士', role: '预检', job: 'nurse', skin: '#f0c7a8', hair: '#1f2937', shirt: '#e0f2fe', pants: '#0369a1', x: 840, homeMin: 700, homeMax: 1000, speed: 0.3, dir: 1, talk: ['口罩拉高。'] }),
      N({ id: 'patient_old', name: '候诊大爷', role: '病人', job: 'patient', skin: '#d6b48a', hair: '#a8a29e', shirt: '#fef3c7', pants: '#57534e', x: 500, homeMin: 400, homeMax: 800, speed: 0.12, dir: 1, talk: ['号又往后顺。'] })
    ]
  },

  cbd: {
    id: 'cbd',
    name: '商务办公区',
    tag: '💼 写字楼 / 咖啡 / 地下通道',
    width: 3400,
    theme: 'cbd',
    district: 'cbd',
    landmarks: [
      L('cbd_from_com', '南口 → 商业区', '商务区', 70, 120, 120, '回北大街', 10, 0.6, 'enterCommerce'),
      L('cbd_tower', '写字楼', '23号楼', 380, 280, 280, '进大堂再上楼', 4, 0.45, 'enterLobby'),
      L('cbd_coffee', '瑞幸外卖柜', '大堂外', 820, 120, 90, '冰美式续命 ¥15', 8, 0.9, 'officeWater'),
      L('cbd_smoke', '楼后吸烟点', '写字楼侧', 1180, 100, 80, '透气被HR看见风险', 10, 1.0, 'clubSmoke'),
      L('cbd_from_civic', '西口 → 医疗区', '商务区', 1580, 120, 120, '去医院', 10, 0.6, 'enterCivic'),
      L('cbd_to_river', '天桥 → 滨江', '商务区东', 2080, 130, 120, '去江边', 10, 0.7, 'enterRiverside'),
      L('cbd_metro', '商务中心站', '地铁', 2580, 140, 120, '进地铁', 8, 0.6, 'enterMetro'),
      L('cbd_bus', '126路', '商务站', 3000, 120, 90, '上公交', 6, 0.6, 'enterBus')
    ],
    npcs: [
      N({ id: 'colleague_min', name: '小敏', role: '同事', job: 'office', skin: '#f3c6a8', hair: '#78350f', shirt: '#f9a8d4', pants: '#1f2937', x: 500, homeMin: 380, homeMax: 900, speed: 0.35, dir: 1, talk: ['日报别忘了。'] }),
      N({ id: 'hr_wang', name: '王HR', role: '人事', job: 'office', skin: '#e8c4a0', hair: '#111827', shirt: '#1d4ed8', pants: '#172554', x: 900, homeMin: 700, homeMax: 1300, speed: 0.25, dir: -1, talk: ['口罩戴好。'] }),
      N({ id: 'office_girl', name: '加班女', role: '通勤', job: 'passenger', skin: '#f2c9b0', hair: '#111827', shirt: '#fff1f2', pants: '#1f2937', x: 2600, homeMin: 2400, homeMax: 2900, speed: 0.3, dir: 1, talk: ['四点才走。'] })
    ]
  },

  riverside: {
    id: 'riverside',
    name: '滨江工业区',
    tag: '🌊 围挡 / 摊贩 / 栈道',
    width: 3600,
    theme: 'riverside',
    district: 'riverside',
    landmarks: [
      L('riv_from_red', '围挡 → 红灯区', '江边西', 70, 120, 120, '回夜巷', 10, 0.6, 'enterRedlight'),
      L('river_bench', '湿木头长椅', '栈道', 420, 140, 40, '坐着看江', 20, 1.6, 'riverSit'),
      L('river_fence', '蓝铁皮围挡', '工地', 860, 160, 110, '隔缝看对岸', 8, 1.0, 'riverPeek'),
      L('river_cat', '阿花亲戚', '花坛', 1280, 80, 50, 'rua猫', 15, 1.4, 'petCat'),
      L('river_vendor', '烤冷面摊', '游击摊', 1720, 130, 90, '热的 ¥18', 10, 1.1, 'riverFood'),
      L('riv_from_cbd', '天桥 → 办公区', '江边', 2160, 130, 120, '回商务区', 10, 0.6, 'enterCbd'),
      L('river_bus', '夜班公交站', '江边', 2600, 120, 90, '拦 126 路', 6, 0.6, 'enterBus'),
      L('river_end', '禁止通行', '尽头', 3100, 90, 100, '前面焊死了', 2, 0.4, 'riverDeadend'),
      L('riv_to_living', '便道 → 生活区', '江边东', 3380, 120, 120, '抄便道回家', 14, 0.7, 'enterLiving')
    ],
    npcs: [
      N({ id: 'fisher', name: '夜钓男', role: '钓客', job: 'idle', skin: '#c4a574', hair: '#1c1917', shirt: '#365314', pants: '#171717', x: 500, homeMin: 380, homeMax: 800, speed: 0.1, dir: 1, talk: ['鱼也不咬。'] }),
      N({ id: 'vendor_liu', name: '刘师傅', role: '摊贩', job: 'vendor', skin: '#e8b895', hair: '#44403c', shirt: '#ea580c', pants: '#1c1917', x: 1740, homeMin: 1600, homeMax: 1900, speed: 0.2, dir: 1, talk: ['趁城管没来。'] })
    ]
  },

  metro: {
    id: 'metro', name: '地铁10号线车厢', tag: '🚇 通勤车厢', width: 2800, theme: 'metro', district: 'transit',
    landmarks: [
      L('metro_door_a', '车门 · 生活区站', '地铁', 80, 90, 140, '下车回生活区', 4, 0.5, 'enterLiving'),
      L('metro_pole', '扶手吊环', '地铁', 420, 40, 160, '抓住吊环', 8, 1.2, 'metroHold'),
      L('metro_seat', '优先座', '地铁', 780, 140, 50, '坐下', 12, 1.4, 'metroSit'),
      L('metro_screen', '防疫屏', '地铁', 1180, 90, 80, '看字幕', 5, 0.8, 'metroNews'),
      L('metro_code', '健康码闸', '地铁', 1580, 80, 110, '亮码', 6, 1.0, 'metroScan'),
      L('metro_transfer', '换乘 · 办公区', '地铁', 1980, 110, 120, '出站去商务区', 10, 0.7, 'enterCbd'),
      L('metro_door_b', '车门 · 选站', '地铁', 2480, 90, 140, '选下车区域', 4, 0.5, 'metroDestinations')
    ],
    npcs: [
      N({ id: 'cough_man', name: '口罩下滑男', role: '乘客', job: 'passenger', skin: '#e8c4a8', hair: '#44403c', shirt: '#334155', pants: '#1e293b', x: 500, homeMin: 360, homeMax: 900, speed: 0.25, dir: 1, talk: ['空调太闷。'] }),
      N({ id: 'metro_guard', name: '站务', role: '站务', job: 'official', skin: '#d4a574', hair: '#1f2937', shirt: '#0f766e', pants: '#134e4a', x: 1600, homeMin: 1500, homeMax: 1750, speed: 0.3, dir: 1, talk: ['请戴口罩。'] })
    ]
  },

  bus: {
    id: 'bus', name: '126路车厢', tag: '🚌 跨区巴士', width: 2400, theme: 'bus', district: 'transit',
    landmarks: [
      L('bus_door', '中门 · 生活区', '公交', 70, 80, 140, '下车回小区', 3, 0.5, 'enterLiving'),
      L('bus_driver', '驾驶隔板', '公交', 280, 90, 120, '投币 ¥2', 2, 0.7, 'busPay'),
      L('bus_seat', '靠窗座', '公交', 620, 130, 55, '坐下', 10, 1.3, 'busSit'),
      L('bus_stand', '过道', '公交', 980, 40, 150, '站着挤', 8, 1.1, 'busStand'),
      L('bus_stop_hospital', '报站：医疗区', '公交', 1400, 110, 90, '去医院', 6, 0.6, 'enterCivic'),
      L('bus_stop_river', '报站：滨江', '公交', 1780, 110, 90, '去江边', 6, 0.6, 'enterRiverside'),
      L('bus_back', '后门 · 红灯区', '公交', 2140, 80, 140, '去夜巷', 5, 0.6, 'enterRedlight')
    ],
    npcs: [
      N({ id: 'bus_kid', name: '补课小孩', role: '乘客', job: 'passenger', skin: '#f5d0b0', hair: '#1c1917', shirt: '#38bdf8', pants: '#1e293b', x: 1050, homeMin: 920, homeMax: 1250, speed: 0.4, dir: -1, talk: ['作业没写完。'] })
    ]
  },

  club: {
    id: 'club', name: '午夜俱乐部', tag: '1F舞池 · 2F卡座', width: 1000, theme: 'club', district: 'redlight',
    floors: { count: 2, names: ['1F 舞池吧台', '2F 卡座DJ'], stair0: 780, stair1: 960 },
    landmarks: [
      L('club_exit', '消防通道', '1F', 30, 70, 145, '回夜巷', 4, 0.4, 'enterRedlight', { floor: 0 }),
      L('club_bar', '吧台', '1F', 150, 150, 90, '买酒', 15, 1.2, 'clubDrink', { floor: 0 }),
      L('club_dance', '舞池', '1F', 360, 200, 75, '跳舞', 25, 2.0, 'clubDance', { floor: 0 }),
      L('club_elev', '楼梯', '右侧', 780, 90, 160, '上2F / 下1F', 1, 0.2, 'openElevator', { floor: 0 }),
      L('club_vip', '卡座', '2F', 50, 160, 65, '社交', 20, 1.5, 'clubVip', { floor: 1 }),
      L('club_dj', 'DJ台', '2F', 280, 120, 100, '打碟赚钱', 40, 2.2, 'clubDj', { floor: 1 }),
      L('club_bath', '洗手间', '2F', 480, 80, 110, '洗脸', 10, 1.0, 'clubWash', { floor: 1 })
    ],
    npcs: [
      N({ id: 'dj_neo', name: 'Neo', role: 'DJ', job: 'dj', skin: '#c4a484', hair: '#111827', shirt: '#a21caf', pants: '#09090b', x: 320, homeMin: 220, homeMax: 520, speed: 0.2, dir: 1, talk: ['低音往死里砸。'], floor: 1 }),
      N({ id: 'bar_mia', name: 'Mia', role: '调酒', job: 'bartender', skin: '#e8b4b8', hair: '#3b0764', shirt: '#4c1d95', pants: '#0f172a', x: 220, homeMin: 140, homeMax: 500, speed: 0.35, dir: -1, talk: ['气泡水还是假酒？'], floor: 0 })
    ]
  },

  hospital: {
    id: 'hospital', name: '市二院', tag: '12层住院楼 · 电梯', width: 1000, theme: 'hospital', district: 'civic',
    floors: { count: 12, names: ['1F 门诊大厅', '2F 检验/核酸', '3F 内科门诊', '4F 输液区', '5F 影像科', '6F 住院部', '7F 住院部', '8F 住院部', '9F 手术室', '10F ICU', '11F 隔离病房', '12F 设备层'], stair0: 780, stair1: 960 },
    landmarks: [
      L('hosp_exit', '门诊大门', '1F', 30, 70, 145, '回到医疗区广场', 4, 0.4, 'enterCivic', { floor: 0 }),
      L('hosp_triage', '分诊台', '1F', 140, 130, 90, '填流调', 18, 1.4, 'hospTriage', { floor: 0 }),
      L('hosp_queue', '黄线候诊', '1F', 340, 150, 55, '排队', 25, 1.8, 'hospQueue', { floor: 0 }),
      L('hosp_pharmacy', '门诊药房', '1F', 540, 130, 100, '取药', 15, 1.2, 'hospMeds', { floor: 0 }),
      L('hosp_elev', '电梯', '右侧', 780, 90, 160, '选楼层 1-12F', 1, 0.2, 'openElevator', { floor: 0 }),
      L('hosp_pcr', '咽拭子窗', '2F', 160, 120, 95, '院内核酸', 20, 1.6, 'takePCR', { floor: 1 }),
      L('hosp_lab', '抽血窗口', '2F', 400, 120, 90, '空腹抽血', 15, 1.2, 'hospTriage', { floor: 1 }),
      L('hosp_clinic', '内科诊室', '3F', 160, 140, 100, '看病', 25, 1.6, 'hospQueue', { floor: 2 }),
      L('hosp_iv', '输液椅', '4F', 140, 150, 70, '挂水 ¥120', 50, 2.2, 'hospIV', { floor: 3 }),
      L('hosp_ct', 'CT 门口', '5F', 180, 110, 110, '预约排到下周', 8, 0.8, 'metroNews', { floor: 4 }),
      L('hosp_ward6', '6F 护士站', '6F', 160, 130, 90, '探视要登记', 6, 0.7, 'metroScan', { floor: 5 }),
      L('hosp_or', '手术室门', '9F', 180, 100, 120, '红灯别进', 3, 0.4, 'ktvNext', { floor: 8 }),
      L('hosp_iso', '隔离病房', '11F', 180, 100, 120, '红灯别进', 3, 0.4, 'ktvNext', { floor: 10 })
    ],
    npcs: [
      N({ id: 'nurse_ye', name: '叶护士', role: '预检', job: 'nurse', skin: '#f0c7a8', hair: '#1f2937', shirt: '#e0f2fe', pants: '#0369a1', x: 280, homeMin: 140, homeMax: 520, speed: 0.2, dir: 1, talk: ['口罩拉高。'], floor: 0 }),
      N({ id: 'patient_old', name: '候诊大爷', role: '病人', job: 'patient', skin: '#d6b48a', hair: '#a8a29e', shirt: '#fef3c7', pants: '#57534e', x: 420, homeMin: 320, homeMax: 620, speed: 0.1, dir: 1, talk: ['号又往后顺。'], floor: 0 })
    ]
  },

  office: {
    id: 'office', name: '朝阳国际 23号楼', tag: '24层写字楼 · 电梯', width: 1000, theme: 'office', district: 'cbd',
    floors: {
      count: 23,
      names: ['1F 大堂', '2F 物业/会议', '3F 空置', '4F 空置', '5F 空置', '6F 空置', '7F 空置', '8F 空置', '9F 空置', '10F 空置', '11F 空置', '12F 市场部工位', '14F 人事', '15F 空置', '16F 空置', '17F 空置', '18F 空置', '19F 空置', '20F 空置', '21F 空置', '22F 空置', '23F 空置', '24F 天台'],
      stair0: 780, stair1: 960
    },
    landmarks: [
      L('off_lift', '旋转门', '1F', 30, 70, 145, '回商务区街道', 4, 0.4, 'enterCbd', { floor: 0 }),
      L('lobby_temp', '测温柱', '1F', 140, 56, 110, '过测温', 4, 0.6, 'hospTriage', { floor: 0 }),
      L('lobby_cafe', '大堂咖啡', '1F', 240, 110, 80, '美式 ¥18', 8, 0.8, 'officeWater', { floor: 0 }),
      L('lobby_sec', '前台', '1F', 400, 130, 90, '访客登记', 8, 0.9, 'metroScan', { floor: 0 }),
      L('off_elev', '电梯', '右侧', 780, 90, 160, '选楼层（无13F）', 1, 0.2, 'openElevator', { floor: 0 }),
      L('off_boss', '会议室', '2F', 120, 160, 110, '开会', 35, 1.8, 'officeMeeting', { floor: 1 }),
      L('off_print', '打印机', '2F', 360, 80, 90, '修卡纸', 12, 1.3, 'officePrint', { floor: 1 }),
      L('off_desk', '你的工位', '12F', 80, 150, 80, '上班打卡', 5, 0.7, 'openOfficeWork', { floor: 11 }),
      L('off_water', '茶水间', '12F', 320, 90, 85, '接热水', 10, 1.0, 'officeWater', { floor: 11 }),
      L('off_hr', '人事办公室', '14F', 140, 140, 100, '找王HR', 8, 0.8, 'metroScan', { floor: 12 }),
      L('off_roof', '天台门', '24F', 160, 90, 120, '去滨江风口', 8, 0.6, 'enterRiverside', { floor: 22 })
    ],
    npcs: [
      N({ id: 'lobby_sec', name: '保安老周', role: '保安', job: 'official', skin: '#c4a574', hair: '#1c1917', shirt: '#1e3a8a', pants: '#111827', x: 480, homeMin: 360, homeMax: 700, speed: 0.15, dir: 1, talk: ['健康码。'], floor: 0 }),
      N({ id: 'colleague_min', name: '小敏', role: '同事', job: 'office', skin: '#f3c6a8', hair: '#78350f', shirt: '#f9a8d4', pants: '#1f2937', x: 200, homeMin: 80, homeMax: 500, speed: 0.2, dir: 1, talk: ['日报别忘了。'], floor: 11 })
    ]
  },

  mall: {
    id: 'mall', name: '朝阳汇商场', tag: 'B1生鲜 · 1F食肆 · 5F连廊', width: 1000, theme: 'mall', district: 'commerce',
    floors: { count: 6, names: ['B1 生鲜超市', '1F 食肆大厅', '2F 男装', '3F 女装家居', '4F 影院电玩', '5F 屋顶连廊'], stair0: 780, stair1: 960 },
    landmarks: [
      L('mall_fresh', '生鲜区', 'B1', 80, 160, 90, '买菜 ¥22', 12, 1.1, 'buyFood', { floor: 0 }),
      L('mall_cold', '冷冻柜', 'B1', 300, 120, 90, '冰柜空了一半', 6, 0.7, 'metroNews', { floor: 0 }),
      L('mall_exit', '商场门', '1F', 30, 70, 145, '回到北大街', 4, 0.4, 'enterCommerce', { floor: 1 }),
      L('mall_guard', '保安台', '1F', 140, 110, 100, '量体温', 6, 0.8, 'hospTriage', { floor: 1 }),
      L('mall_food', '食肆档口', '1F', 300, 150, 95, '盖浇饭 ¥28', 12, 1.1, 'mallEat', { floor: 1 }),
      L('mall_atm', 'ATM', '1F', 520, 80, 90, '查余额', 4, 0.6, 'mallAtm', { floor: 1 }),
      L('mall_elev', '扶梯/电梯', '右侧', 780, 90, 160, '选楼层 B1-5F', 1, 0.2, 'openElevator', { floor: 1 }),
      L('mall_fit', '试衣间', '2F', 80, 110, 115, '换装', 8, 0.8, 'openWardrobe', { floor: 2 }),
      L('mall_shop', '男装柜', '2F', 260, 150, 100, '买衣服', 6, 0.6, 'openWardrobe', { floor: 2 }),
      L('mall_wc', '卫生间', '2F', 480, 80, 110, '洗手', 8, 0.9, 'clubWash', { floor: 2 }),
      L('mall_home', '家居区', '3F', 160, 140, 90, '被子涨价了', 6, 0.7, 'metroNews', { floor: 3 }),
      L('mall_game', '电玩城', '4F', 160, 140, 90, '厅关着', 4, 0.5, 'clubVip', { floor: 4 }),
      L('mall_to_metro', '连廊', '5F', 200, 110, 110, '去地铁', 7, 0.6, 'enterMetro', { floor: 5 })
    ],
    npcs: [
      N({ id: 'mall_clerk', name: '导购小张', role: '导购', job: 'clerk', skin: '#f2c9b0', hair: '#1f2937', shirt: '#f8fafc', pants: '#111827', x: 300, homeMin: 180, homeMax: 560, speed: 0.3, dir: 1, talk: ['这件有现货。口罩别摘。'], floor: 2 })
    ]
  },
  pharmacyIn: {
    id: 'pharmacyIn', name: '老百姓大药房', tag: '街边单层店', width: 1800, theme: 'shop', district: 'commerce',
    landmarks: [
      L('pharm_exit', '店门', '药房', 60, 80, 140, '回到大街', 3, 0.4, 'enterCommerce'),
      L('pharm_counter', '柜台', '药房', 360, 140, 90, '买布洛芬 ¥60', 20, 1.4, 'buyMedicine'),
      L('pharm_queue', '一米线', '药房', 620, 120, 50, '排队', 12, 1.1, 'hospQueue'),
      L('pharm_shelf', '货架', '药房', 900, 140, 100, '翻维生素，没货', 8, 0.9, 'metroNews'),
      L('pharm_cam', '监控', '药房', 1220, 70, 80, '摄像头一直亮', 2, 0.4, 'metroScan'),
      L('pharm_box', '纸箱堆', '药房', 1480, 100, 70, '口罩箱是空的', 4, 0.5, 'checkRack')
    ],
    npcs: [
      N({ id: 'pharm_clerk', name: '药剂师', role: '店员', job: 'clerk', skin: '#e8c4a0', hair: '#1f2937', shirt: '#16a34a', pants: '#14532d', x: 400, homeMin: 280, homeMax: 700, speed: 0.15, dir: 1, talk: ['退热药限购。'] })
    ]
  },
  storeIn: {
    id: 'storeIn', name: '全家 24H', tag: '街边单层店', width: 1800, theme: 'shop', district: 'commerce',
    landmarks: [
      L('store_exit', '自动门', '便利店', 60, 80, 140, '回到大街', 3, 0.4, 'enterCommerce'),
      L('store_fridge', '便当柜', '便利店', 320, 110, 90, '买便当鸡蛋 ¥35', 12, 1.1, 'buyFood'),
      L('store_oden', '关东煮', '便利店', 560, 100, 80, '买一串 ¥8', 8, 0.8, 'storeOden'),
      L('store_atm', 'ATM', '便利店', 820, 70, 80, '查卡', 4, 0.5, 'mallAtm'),
      L('store_mic', '微波台', '便利店', 1080, 90, 70, '加热（店员盯着你）', 6, 0.7, 'eatInstant'),
      L('store_stock', '后仓纸箱', '便利店', 1400, 140, 90, '临期货堆着', 6, 0.7, 'metroNews')
    ],
    npcs: [
      N({ id: 'store_clerk', name: '便利店店员', role: '店员', job: 'clerk', skin: '#e8c4a0', hair: '#1f2937', shirt: '#0284c7', pants: '#111827', x: 500, homeMin: 280, homeMax: 900, speed: 0.25, dir: 1, talk: ['便当五点半折扣。'] })
    ]
  },
  soyIn: {
    id: 'soyIn', name: '胡记豆浆', tag: '骑楼单层铺', width: 1400, theme: 'shop', district: 'commerce',
    landmarks: [
      L('soy_exit', '铺门', '早点铺', 50, 80, 140, '回到大街', 3, 0.4, 'enterCommerce'),
      L('soy_counter', '窗口', '早点铺', 280, 140, 90, '豆浆油条 ¥12', 8, 0.8, 'storeOden'),
      L('soy_seat', '塑料凳', '早点铺', 520, 140, 50, '蹲着喝', 10, 1.0, 'clubVip'),
      L('soy_steam', '蒸笼', '早点铺', 820, 140, 90, '热气糊眼镜', 6, 0.7, 'mallEat'),
      L('soy_pot', '大锅', '早点铺', 1100, 120, 80, '豆浆在滚', 5, 0.6, 'eatInstant')
    ],
    npcs: [
      N({ id: 'soy_boss', name: '胡师傅', role: '老板', job: 'vendor', skin: '#d4a574', hair: '#44403c', shirt: '#ea580c', pants: '#1c1917', x: 360, homeMin: 220, homeMax: 800, speed: 0.2, dir: 1, talk: ['豆浆要现磨。'] })
    ]
  },

  home: {
    id: 'home', name: 'loft 出租屋', tag: '1F起居厨卫 · 2F阁楼', width: 1020, theme: 'home', district: 'living',
    floors: { count: 2, names: ['1F 起居厨卫', '2F 阁楼卧室'], stair0: 780, stair1: 960 },
    landmarks: [
      L('home_exit', '防盗门', '1F', 30, 64, 150, '下楼到小区', 3, 0.4, 'leaveHome', { floor: 0 }),
      L('home_stove', '开放厨房', '1F', 120, 100, 90, '做饭', 5, 0.6, 'openKitchen', { floor: 0 }),
      L('home_fridge', '小冰箱', '1F', 230, 56, 105, '看剩菜/过期', 1, 0.2, 'openFridge', { floor: 0 }),
      L('home_toilet', '马桶', '1F', 300, 54, 70, '上厕所', 4, 0.4, 'useToilet', { floor: 0 }),
      L('home_sink', '洗手台', '1F', 360, 56, 80, '洗手 / 洗脸 / 洗衣', 1, 0.2, 'openBath', { floor: 0 }),
      L('home_shower', '花洒', '1F', 420, 56, 125, '洗澡', 25, 1.5, 'homeShower', { floor: 0 }),
      L('home_sofa', '布沙发', '1F', 500, 120, 65, '坐下歇一会', 12, 1.0, 'sitSofa', { floor: 0 }),
      L('home_tv', '电视柜', '1F', 600, 70, 70, '看新闻/综艺', 15, 1.2, 'watchHomeTv', { floor: 0 }),
      L('home_broom', '拖把', '1F', 750, 36, 90, '打扫房间', 20, 1.4, 'cleanRoom', { floor: 0 }),
      L('home_stairs', '楼梯', '右侧', 780, 160, 250, '走上阁楼', 1, 0.2, 'openElevator', { floor: 0 }),
      L('home_bed', '阁楼床', '2F', 50, 150, 65, '睡觉', 1, 0.2, 'openSleep', { floor: 1 }),
      L('home_closet', '衣柜', '2F', 220, 70, 110, '换衣服', 5, 0.6, 'openWardrobe', { floor: 1 }),
      L('home_desk', '书桌', '2F', 320, 100, 80, '业主群/私活/视频', 1, 0.2, 'openDesk', { floor: 1 }),
      L('home_window', '天窗', '2F', 460, 90, 70, '看楼下封控', 8, 0.9, 'lookSkylight', { floor: 1 }),
      L('home_hanger', '衣架', '2F', 580, 90, 110, '晾衣服', 1, 0.2, 'useHanger', { floor: 1 }),
      L('home_thermo', '额温枪', '2F', 690, 50, 70, '量体温 / 做抗原', 1, 0.2, 'openMedkit', { floor: 1 }),
      L('home_catbowl', '猫碗', '1F', 80, 48, 40, '喂猫 / rua', 5, 0.5, 'feedCat', { floor: 0 }),
      L('home_litter', '砂盆', '1F', 175, 70, 28, '铲猫砂', 8, 0.8, 'scoopLitter', { floor: 0 }),
      L('home_trash', '垃圾袋', '1F', 690, 54, 62, '倒垃圾', 15, 1.0, 'takeTrash', { floor: 0 })
    ],
    npcs: [
      N({ id: 'home_cat', name: '阿花', role: '猫', job: 'cat', skin: '#fb923c', hair: '#9a3412', shirt: '#fdba74', pants: '#7c2d12', x: 480, homeMin: 160, homeMax: 720, speed: 0.28, dir: 1, talk: ['咕噜。'], floor: 0 })
    ]
  },

  parlorIn: {
    id: 'parlorIn', name: '林记推拿馆', tag: '巷内单层三张床', width: 2200, theme: 'parlor', district: 'redlight',
    landmarks: [
      L('parlor_exit', '店门', '推拿馆', 60, 80, 140, '回到夜巷', 3, 0.4, 'enterRedlight'),
      L('parlor_desk', '前台', '推拿馆', 280, 110, 90, '排班/结账', 4, 0.5, 'openParlor'),
      L('parlor_bed1', '1号床', '推拿馆', 620, 140, 50, '这张床', 2, 0.4, 'openParlor'),
      L('parlor_bed2', '2号床', '推拿馆', 920, 140, 50, '这张床', 2, 0.4, 'openParlor'),
      L('parlor_bed3', '3号床', '推拿馆', 1220, 140, 50, '这张床', 2, 0.4, 'openParlor'),
      L('parlor_tea', '茶水桌', '推拿馆', 1540, 90, 70, '喝一口烫的', 6, 0.7, 'storeOden'),
      L('parlor_wash', '洗手池', '推拿馆', 1780, 80, 90, '洗手', 5, 0.6, 'clubWash'),
      L('parlor_locker', '更衣柜', '推拿馆', 1980, 90, 110, '换工服', 5, 0.6, 'openWardrobe')
    ],
    npcs: [
      N({ id: 'lin_jie', name: '林姐', role: '店长', job: 'masseur', skin: '#e8b895', hair: '#1f2937', shirt: '#be123c', pants: '#111827', x: 320, homeMin: 240, homeMax: 520, speed: 0.2, dir: 1, talk: ['手艺是吃饭的本事。'] }),
      N({ id: 'ahua_staff', name: '小周', role: '技师', job: 'masseur', skin: '#f0c7a8', hair: '#78350f', shirt: '#9f1239', pants: '#1f2937', x: 940, homeMin: 700, homeMax: 1300, speed: 0.2, dir: -1, talk: ['手法偏重。'] }),
      N({ id: 'uncle_zhao', name: '赵叔', role: '客人', job: 'customer', skin: '#d4a574', hair: '#44403c', shirt: '#1e3a5f', pants: '#292524', x: 1220, homeMin: 1100, homeMax: 1400, speed: 0.05, dir: 1, talk: ['腰椎不行了。'] })
    ]
  },

  hotel: {
    id: 'hotel', name: '钟点旅馆', tag: '6层小旅馆 · 楼梯', width: 1000, theme: 'hotel', district: 'redlight',
    floors: { count: 6, names: ['1F 前台', '2F 客房', '3F 客房', '4F 客房', '5F 客房', '6F 天台'], stair0: 780, stair1: 960 },
    landmarks: [
      L('hotel_exit', '旅馆门', '1F', 30, 70, 145, '回夜巷', 4, 0.4, 'enterRedlight', { floor: 0 }),
      L('hotel_desk', '前台', '1F', 180, 120, 90, '开房 ¥80', 4, 0.5, 'hotelSleep', { floor: 0 }),
      L('hotel_elev', '楼梯', '右侧', 780, 90, 160, '选楼层 1-6F', 1, 0.2, 'openElevator', { floor: 0 }),
      L('hotel_bed', '硬板床', '2F', 80, 150, 65, '睡觉', 90, 1.8, 'sleep', { floor: 1 }),
      L('hotel_bath', '浴缸', '2F', 280, 90, 100, '冲一下', 15, 1.2, 'takeShower', { floor: 1 }),
      L('hotel_tv', '电视', '2F', 430, 80, 70, '无聊台', 20, 1.0, 'watchNews', { floor: 1 }),
      L('hotel_bed3', '3F空房', '3F', 80, 150, 65, '这间没人', 4, 0.5, 'sleep', { floor: 2 }),
      L('hotel_bed4', '4F空房', '4F', 80, 150, 65, '窗帘拉着', 4, 0.5, 'sleep', { floor: 3 }),
      L('hotel_bed5', '5F空房', '5F', 80, 150, 65, '水龙头滴水', 4, 0.5, 'sleep', { floor: 4 }),
      L('hotel_window', '天台栏杆', '6F', 200, 100, 80, '对面也在拉帘', 5, 0.7, 'riverPeek', { floor: 5 })
    ],
    npcs: [
      N({ id: 'hotel_boss', name: '前台大姐', role: '老板', job: 'clerk', skin: '#e8b895', hair: '#44403c', shirt: '#f59e0b', pants: '#1c1917', x: 200, homeMin: 140, homeMax: 360, speed: 0.15, dir: 1, talk: ['现金。不开发票。'], floor: 0 })
    ]
  },

  ktv: {
    id: 'ktv', name: 'KTV', tag: '4层量贩 · 楼梯', width: 1000, theme: 'club', district: 'redlight',
    floors: { count: 4, names: ['1F 前台大厅', '2F 小包', '3F 中包', '4F 大包'], stair0: 780, stair1: 960 },
    landmarks: [
      L('ktv_exit', '大门', '1F', 30, 70, 145, '回夜巷', 4, 0.4, 'enterRedlight', { floor: 0 }),
      L('ktv_desk', '前台', '1F', 160, 120, 90, '开房唱 ¥60', 8, 0.8, 'mallAtm', { floor: 0 }),
      L('ktv_waitseat', '等候沙发', '1F', 360, 140, 60, '等包厢', 8, 0.8, 'clubVip', { floor: 0 }),
      L('ktv_elev', '楼梯', '右侧', 780, 90, 160, '选楼层 1-4F', 1, 0.2, 'openElevator', { floor: 0 }),
      L('ktv_mic', '点歌台', '2F', 80, 120, 90, '唱两首（娱乐+出汗）', 25, 1.6, 'clubDance', { floor: 1 }),
      L('ktv_sofa', '皮沙发', '2F', 260, 150, 60, '坐下喝酒', 15, 1.2, 'clubVip', { floor: 1 }),
      L('ktv_bath', '包厢卫生间', '2F', 470, 80, 110, '洗手', 8, 0.8, 'clubWash', { floor: 1 }),
      L('ktv_mid', '中包沙发', '3F', 120, 160, 60, '最低消费更高', 15, 1.2, 'clubVip', { floor: 2 }),
      L('ktv_door2', '隔壁包厢', '4F', 160, 90, 120, '有人咳，别进', 3, 0.5, 'ktvNext', { floor: 3 })
    ],
    npcs: [
      N({ id: 'dancer_kai', name: 'Kai', role: '麦霸', job: 'dancer', skin: '#d1a78a', hair: '#facc15', shirt: '#22d3ee', pants: '#18181b', x: 320, homeMin: 220, homeMax: 560, speed: 0.4, dir: 1, talk: ['来不来中间？'], floor: 1 }),
      N({ id: 'ktv_wait', name: '服务员小刘', role: '服务员', job: 'clerk', skin: '#f0c7a8', hair: '#1f2937', shirt: '#f8fafc', pants: '#111827', x: 240, homeMin: 140, homeMax: 500, speed: 0.3, dir: -1, talk: ['果盘最低消费。'], floor: 0 })
    ]
  },

  committee: {
    id: 'committee', name: '居委会帐篷', tag: '⛺ 一层帆布', width: 1000, theme: 'shop', district: 'living',
    landmarks: [
      L('comt_exit', '帐篷门', '居委会', 30, 70, 145, '回小区', 3, 0.4, 'enterLiving'),
      L('comt_desk', '办公桌', '居委会', 180, 140, 80, '听通告 / 领表格', 12, 1.1, 'metroNews'),
      L('comt_box', '物资箱', '居委会', 400, 110, 70, '看还有没有菜', 10, 1.0, 'checkRack'),
      L('comt_board', '名单', '居委会', 580, 90, 90, '密接名单被贴住一角', 8, 0.8, 'metroScan')
    ],
    npcs: [
      N({ id: 'grid_chen', name: '陈网格员', role: '网格员', job: 'official', skin: '#e2b48a', hair: '#292524', shirt: '#0369a1', pants: '#1e293b', x: 260, homeMin: 160, homeMax: 520, speed: 0.2, dir: 1, talk: ['绿码通行。'] }),
      N({ id: 'comt_aunt', name: '张阿姨', role: '志愿者', job: 'neighbor', skin: '#e2b48a', hair: '#78716c', shirt: '#dc2626', pants: '#1c1917', x: 460, homeMin: 360, homeMax: 700, speed: 0.2, dir: -1, talk: ['菜下午才到。'] })
    ]
  }
};

MAPS.street = MAPS.living;
MAPS.lobby = MAPS.office;

(function applyFloorY() {
  for (const m of Object.values(MAPS)) {
    if (!m?.landmarks) continue;
    for (const lm of m.landmarks) {
      if (lm.floor != null) lm.baseY = yOfFloor(lm.floor);
    }
  }
})();

export function getMap(id) {
  if (id === 'street') return MAPS.living;
  if (id === 'lobby') return MAPS.office;
  return MAPS[id] || MAPS.living;
}
