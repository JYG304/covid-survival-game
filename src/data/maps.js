export const FLOOR_Y = 415;

const streetLandmarks = [
  { id: 'home_bed', name: '单人行军床', zone: '出租屋 · 卧室', x: 120, width: 110, height: 70, prompt: '盖好被子安睡休息', timeCostMinutes: 120, actionDuration: 2.2, action: 'sleep' },
  { id: 'home_tv', name: '二手旧彩电', zone: '出租屋 · 起居角', x: 245, width: 60, height: 60, prompt: '收看晨间疫情防控新闻快报', timeCostMinutes: 15, actionDuration: 1.2, action: 'watchNews' },
  { id: 'home_desk', name: '工作书桌 & 笔记本电脑', zone: '出租屋 · 工作台', x: 350, width: 90, height: 80, prompt: '打开电脑接私活兼职 / 查看业主群', timeCostMinutes: 5, actionDuration: 0.6, action: 'openPhone' },
  { id: 'home_shower', name: '狭窄卫生间 · 花洒', zone: '出租屋 · 卫生间', x: 455, width: 70, height: 110, prompt: '洗个热水澡', timeCostMinutes: 25, actionDuration: 1.6, action: 'takeShower' },
  { id: 'home_stove', name: '简易厨房灶台', zone: '出租屋 · 烹饪角', x: 550, width: 85, height: 100, prompt: '起火烹饪热饭热汤', timeCostMinutes: 5, actionDuration: 0.6, action: 'openKitchen' },
  { id: 'home_door', name: '出租屋防盗铁门', zone: '单元出入口', x: 740, width: 60, height: 130, prompt: '推开防盗门步入街道', timeCostMinutes: 5, actionDuration: 0.8, action: 'exitHome' },
  { id: 'contactless_rack', name: '无接触外卖置物架', zone: '小区出入口', x: 1020, width: 100, height: 90, prompt: '翻找自提快递或爱心蔬菜', timeCostMinutes: 20, actionDuration: 1.8, action: 'checkRack' },
  { id: 'pcr_sampling_booth', name: '便民核酸采样亭', zone: '便民核酸点', x: 1320, width: 110, height: 110, prompt: '排队咽拭子，维持绿码', timeCostMinutes: 30, actionDuration: 2.2, action: 'takePCR' },
  { id: 'subway_entrance', name: '地铁10号线入口', zone: '朝阳北大街 · 地铁', x: 1720, width: 140, height: 120, prompt: '进站：进入地铁车厢横板', timeCostMinutes: 8, actionDuration: 0.8, action: 'enterMetro' },
  { id: 'bus_stop', name: '公交 126 路站台', zone: '朝阳北大街 · 公交', x: 1960, width: 120, height: 90, prompt: '上车：进入公交车厢横板', timeCostMinutes: 6, actionDuration: 0.7, action: 'enterBus' },
  { id: 'stray_cat_shrine', name: '流浪三花猫 阿花', zone: '街角花坛', x: 2180, width: 70, height: 50, prompt: '蹲下rua阿花 (+心境)', timeCostMinutes: 20, actionDuration: 1.8, action: 'petCat' },
  { id: 'street_pharmacy', name: '老百姓大药房', zone: '商业街 · 药房', x: 2600, width: 140, height: 120, prompt: '买布洛芬 ¥60/盒', timeCostMinutes: 30, actionDuration: 2.0, action: 'buyMedicine' },
  { id: 'street_convenience_store', name: '全家 24H', zone: '商业街 · 便利店', x: 3120, width: 150, height: 120, prompt: '买便当与鸡蛋 ¥35', timeCostMinutes: 20, actionDuration: 1.8, action: 'buyFood' },
  { id: 'massage_parlor', name: '林记推拿馆', zone: '商业街 · 推拿馆', x: 3480, width: 200, height: 140, prompt: '进馆推拿 / 上岗 / 排班', timeCostMinutes: 2, actionDuration: 0.5, action: 'openParlor' },
  { id: 'club_gate', name: '霓虹后门 · 午夜俱乐部', zone: '巷尾夜店', x: 4020, width: 160, height: 140, prompt: '钻进夜店横板（夜间更热闹）', timeCostMinutes: 10, actionDuration: 0.8, action: 'enterClub' },
  { id: 'hospital_gate', name: '发热门诊接驳口', zone: '医院班车点', x: 4480, width: 140, height: 110, prompt: '去医院走廊横板', timeCostMinutes: 12, actionDuration: 0.8, action: 'enterHospital' },
  { id: 'disinfection_cannon_truck', name: '防疫雾炮消杀车', zone: '主干道消杀段', x: 4780, width: 160, height: 110, prompt: '接受喷雾消杀外衣', timeCostMinutes: 15, actionDuration: 1.8, action: 'disinfect' }
];

export const MAPS = {
  street: {
    id: 'street',
    name: '朝阳里街区',
    tag: '🏠 出租屋到商业街',
    width: 5100,
    theme: 'street',
    landmarks: streetLandmarks,
    npcs: [
      { id: 'lin_jie', name: '林姐', role: '推拿馆店长', job: 'masseur', skin: '#e8b895', hair: '#1f2937', shirt: '#be123c', pants: '#111827', x: 3480, homeMin: 3380, homeMax: 3920, speed: 0.7, dir: 1, talk: ['手艺是吃饭的本事。', '馆里缺人，你来不来顶班？'] },
      { id: 'ahua_staff', name: '小周', role: '技师', job: 'masseur', skin: '#f0c7a8', hair: '#78350f', shirt: '#9f1239', pants: '#1f2937', x: 3620, homeMin: 3380, homeMax: 3920, speed: 0.55, dir: -1, talk: ['我手法偏重。', '客人躺下就不爱说话。'] },
      { id: 'uncle_zhao', name: '赵叔', role: '常客', job: 'customer', skin: '#d4a574', hair: '#44403c', shirt: '#1e3a5f', pants: '#292524', x: 2400, homeMin: 2280, homeMax: 2700, speed: 0.45, dir: 1, talk: ['腰椎不行了。', '推拿馆还开着算幸运。'] },
      { id: 'courier_wu', name: '吴骑手', role: '外卖骑手', job: 'courier', skin: '#c98a62', hair: '#111827', shirt: '#f59e0b', pants: '#0f172a', x: 1180, homeMin: 980, homeMax: 1600, speed: 1.6, dir: 1, talk: ['单还在跑。', '门口货架我刚放下两袋。'] },
      { id: 'grid_chen', name: '陈网格员', role: '网格员', job: 'official', skin: '#e2b48a', hair: '#292524', shirt: '#0369a1', pants: '#1e293b', x: 1450, homeMin: 1280, homeMax: 1900, speed: 0.5, dir: -1, talk: ['绿码通行。', '聚集就劝返。'] },
      { id: 'neighbor_li', name: '李姐', role: '对门邻居', job: 'neighbor', skin: '#eab308', hair: '#7c2d12', shirt: '#7c3aed', pants: '#27272a', x: 820, homeMin: 760, homeMax: 1100, speed: 0.4, dir: 1, talk: ['鸡蛋还够吗？', '阿花又在门口蹲着。'] }
    ]
  },

  metro: {
    id: 'metro',
    name: '地铁10号线车厢',
    tag: '🚇 拥挤通勤车厢',
    width: 2800,
    theme: 'metro',
    landmarks: [
      { id: 'metro_door_a', name: '上行车门 · 朝阳里', zone: '地铁', x: 80, width: 90, height: 140, prompt: '下车，回到街区', timeCostMinutes: 4, actionDuration: 0.5, action: 'exitToStreet' },
      { id: 'metro_pole', name: '扶手吊环', zone: '地铁', x: 420, width: 40, height: 160, prompt: '抓住吊环站稳（精力-，感染风险）', timeCostMinutes: 8, actionDuration: 1.2, action: 'metroHold' },
      { id: 'metro_seat', name: '优先座位', zone: '地铁', x: 780, width: 140, height: 50, prompt: '坐下刷手机，躲过站着的咳嗽', timeCostMinutes: 12, actionDuration: 1.4, action: 'metroSit' },
      { id: 'metro_screen', name: '车载防疫屏', zone: '地铁', x: 1180, width: 90, height: 80, prompt: '看滚动字幕：今日风险区', timeCostMinutes: 5, actionDuration: 0.8, action: 'metroNews' },
      { id: 'metro_code', name: '健康码核验闸', zone: '地铁', x: 1580, width: 80, height: 110, prompt: '亮码过闸，刷新48h', timeCostMinutes: 6, actionDuration: 1.0, action: 'metroScan' },
      { id: 'metro_transfer', name: '换乘 · 写字楼站', zone: '地铁', x: 1980, width: 110, height: 120, prompt: '出站去写字楼工位层', timeCostMinutes: 10, actionDuration: 0.7, action: 'enterOffice' },
      { id: 'metro_door_b', name: '下行车门 · 医院/夜店', zone: '地铁', x: 2480, width: 90, height: 140, prompt: '选目的地：医院 / 夜店 / 江边', timeCostMinutes: 4, actionDuration: 0.5, action: 'metroDestinations' }
    ],
    npcs: [
      { id: 'cough_man', name: '口罩下滑男', role: '乘客', job: 'passenger', skin: '#e8c4a8', hair: '#44403c', shirt: '#334155', pants: '#1e293b', x: 500, homeMin: 360, homeMax: 900, speed: 0.25, dir: 1, talk: ['空调太闷了。', '就咳两声。'] },
      { id: 'office_girl', name: '加班女', role: '乘客', job: 'passenger', skin: '#f2c9b0', hair: '#111827', shirt: '#fff1f2', pants: '#1f2937', x: 1100, homeMin: 900, homeMax: 1500, speed: 0.2, dir: -1, talk: ['昨晚四点才走。', ' quant 又崩了。'] },
      { id: 'metro_guard', name: '站务', role: '站务员', job: 'official', skin: '#d4a574', hair: '#1f2937', shirt: '#0f766e', pants: '#134e4a', x: 1600, homeMin: 1500, homeMax: 1750, speed: 0.3, dir: 1, talk: ['请佩戴口罩。', '不要倚靠车门。'] }
    ]
  },

  bus: {
    id: 'bus',
    name: '126路公交车厢',
    tag: '🚌 摇晃的街道巴士',
    width: 2400,
    theme: 'bus',
    landmarks: [
      { id: 'bus_door', name: '中门下车', zone: '公交', x: 70, width: 80, height: 140, prompt: '到站，回到街区站台', timeCostMinutes: 3, actionDuration: 0.5, action: 'exitToStreet' },
      { id: 'bus_driver', name: '驾驶隔板', zone: '公交', x: 280, width: 90, height: 120, prompt: '投币/刷卡 ¥2，跟司机打听路况', timeCostMinutes: 2, actionDuration: 0.7, action: 'busPay' },
      { id: 'bus_seat', name: '靠窗座位', zone: '公交', x: 620, width: 130, height: 55, prompt: '坐下看窗外消杀车', timeCostMinutes: 10, actionDuration: 1.3, action: 'busSit' },
      { id: 'bus_stand', name: '过道拉手', zone: '公交', x: 980, width: 40, height: 150, prompt: '站着挤一站（感染风险高）', timeCostMinutes: 8, actionDuration: 1.1, action: 'busStand' },
      { id: 'bus_stop_hospital', name: '报站：发热门诊', zone: '公交', x: 1400, width: 110, height: 90, prompt: '下一站医院，下车进走廊', timeCostMinutes: 6, actionDuration: 0.6, action: 'enterHospital' },
      { id: 'bus_stop_river', name: '报站：江边围挡', zone: '公交', x: 1780, width: 110, height: 90, prompt: '去江边栈道透气', timeCostMinutes: 6, actionDuration: 0.6, action: 'enterRiver' },
      { id: 'bus_back', name: '后门 · 夜店巷', zone: '公交', x: 2140, width: 80, height: 140, prompt: '末站，钻进夜店', timeCostMinutes: 5, actionDuration: 0.6, action: 'enterClub' }
    ],
    npcs: [
      { id: 'bus_aunt', name: '买菜阿姨', role: '乘客', job: 'passenger', skin: '#e2b48a', hair: '#78716c', shirt: '#fb7185', pants: '#44403c', x: 700, homeMin: 560, homeMax: 900, speed: 0.15, dir: 1, talk: ['鸡蛋又涨了。', '这车太晃。'] },
      { id: 'bus_kid', name: '补课小孩', role: '乘客', job: 'passenger', skin: '#f5d0b0', hair: '#1c1917', shirt: '#38bdf8', pants: '#1e293b', x: 1050, homeMin: 920, homeMax: 1250, speed: 0.4, dir: -1, talk: ['作业没写完。', '口罩勒耳朵。'] }
    ]
  },

  club: {
    id: 'club',
    name: '午夜俱乐部 NEON',
    tag: '🎵 封控缝隙里的夜店',
    width: 3200,
    theme: 'club',
    landmarks: [
      { id: 'club_exit', name: '消防通道出门', zone: '夜店', x: 60, width: 80, height: 140, prompt: '钻回街区巷尾', timeCostMinutes: 8, actionDuration: 0.5, action: 'exitToStreet' },
      { id: 'club_bar', name: '吧台', zone: '夜店', x: 380, width: 160, height: 90, prompt: '买一杯气泡水/劣质洋酒', timeCostMinutes: 15, actionDuration: 1.2, action: 'clubDrink' },
      { id: 'club_dance', name: '舞池', zone: '夜店', x: 820, width: 220, height: 80, prompt: '跟着低音跳舞（娱乐大增，出汗）', timeCostMinutes: 25, actionDuration: 2.0, action: 'clubDance' },
      { id: 'club_dj', name: 'DJ 台', zone: '夜店', x: 1280, width: 120, height: 110, prompt: '顶班打碟赚钱 / 点歌', timeCostMinutes: 40, actionDuration: 2.2, action: 'clubDj' },
      { id: 'club_vip', name: '卡座沙发', zone: '夜店', x: 1720, width: 180, height: 70, prompt: '坐下社交，听八卦', timeCostMinutes: 20, actionDuration: 1.5, action: 'clubVip' },
      { id: 'club_bath', name: '洗手间', zone: '夜店', x: 2160, width: 90, height: 120, prompt: '洗手洗脸，把烟味冲掉', timeCostMinutes: 10, actionDuration: 1.0, action: 'clubWash' },
      { id: 'club_back', name: '后门吸烟区', zone: '夜店', x: 2580, width: 110, height: 90, prompt: '透气，偶遇网格员或黄牛', timeCostMinutes: 12, actionDuration: 1.1, action: 'clubSmoke' },
      { id: 'club_to_metro', name: '凌晨末班地铁口', zone: '夜店', x: 2980, width: 100, height: 120, prompt: '赶末班地铁回家', timeCostMinutes: 8, actionDuration: 0.6, action: 'enterMetro' }
    ],
    npcs: [
      { id: 'dj_neo', name: 'Neo', role: '驻场DJ', job: 'dj', skin: '#c4a484', hair: '#111827', shirt: '#a21caf', pants: '#09090b', x: 1280, homeMin: 1200, homeMax: 1450, speed: 0.2, dir: 1, talk: ['今晚低音往死里砸。', '封控夜更疯。'] },
      { id: 'bar_mia', name: 'Mia', role: '调酒', job: 'bartender', skin: '#e8b4b8', hair: '#3b0764', shirt: '#4c1d95', pants: '#0f172a', x: 400, homeMin: 320, homeMax: 560, speed: 0.35, dir: -1, talk: ['气泡水还是假威士忌？', '别在店里摘口罩。'] },
      { id: 'dancer_kai', name: 'Kai', role: '常客', job: 'dancer', skin: '#d1a78a', hair: '#facc15', shirt: '#22d3ee', pants: '#18181b', x: 900, homeMin: 760, homeMax: 1100, speed: 0.8, dir: 1, talk: ['来不来中间？', '明天还要打卡。'] },
      { id: 'club_boss', name: '老K', role: '场东', job: 'boss', skin: '#b45309', hair: '#1c1917', shirt: '#111827', pants: '#0a0a0a', x: 1750, homeMin: 1650, homeMax: 1900, speed: 0.2, dir: 1, talk: ['缺个兼职。', '别让网格员从后门进来。'] }
    ]
  },

  hospital: {
    id: 'hospital',
    name: '发热门诊走廊',
    tag: '🏥 黄线与护目镜',
    width: 3000,
    theme: 'hospital',
    landmarks: [
      { id: 'hosp_exit', name: '门诊大门', zone: '医院', x: 70, width: 90, height: 140, prompt: '离开，回街区/坐公交', timeCostMinutes: 8, actionDuration: 0.5, action: 'exitToStreet' },
      { id: 'hosp_triage', name: '预检分诊台', zone: '医院', x: 360, width: 130, height: 90, prompt: '量体温、填流调表', timeCostMinutes: 18, actionDuration: 1.4, action: 'hospTriage' },
      { id: 'hosp_queue', name: '黄线排队区', zone: '医院', x: 760, width: 160, height: 60, prompt: '站黄线等叫号（心境-）', timeCostMinutes: 25, actionDuration: 1.8, action: 'hospQueue' },
      { id: 'hosp_iv', name: '输液椅', zone: '医院', x: 1200, width: 140, height: 70, prompt: '挂水退热 ¥120', timeCostMinutes: 50, actionDuration: 2.2, action: 'hospIV' },
      { id: 'hosp_pcr', name: '咽拭子窗口', zone: '医院', x: 1680, width: 110, height: 100, prompt: '院内核酸，结果更权威', timeCostMinutes: 20, actionDuration: 1.6, action: 'takePCR' },
      { id: 'hosp_pharmacy', name: '门诊药房', zone: '医院', x: 2140, width: 130, height: 100, prompt: '凭单取药，比街上便宜', timeCostMinutes: 15, actionDuration: 1.2, action: 'hospMeds' },
      { id: 'hosp_to_metro', name: '地下通道 · 地铁', zone: '医院', x: 2680, width: 100, height: 120, prompt: '坐地铁离开', timeCostMinutes: 7, actionDuration: 0.6, action: 'enterMetro' }
    ],
    npcs: [
      { id: 'nurse_ye', name: '叶护士', role: '预检护士', job: 'nurse', skin: '#f0c7a8', hair: '#1f2937', shirt: '#e0f2fe', pants: '#0369a1', x: 380, homeMin: 300, homeMax: 520, speed: 0.3, dir: 1, talk: ['口罩拉高。', '有没有接触史？'] },
      { id: 'patient_old', name: '候诊大爷', role: '病人', job: 'patient', skin: '#d6b48a', hair: '#a8a29e', shirt: '#fef3c7', pants: '#57534e', x: 800, homeMin: 700, homeMax: 980, speed: 0.12, dir: 1, talk: ['号又往后顺了。', '年轻人别凑近。'] }
    ]
  },

  office: {
    id: 'office',
    name: '写字楼 23F 工位层',
    tag: '💼 隔板、咖啡与KPI',
    width: 2800,
    theme: 'office',
    landmarks: [
      { id: 'off_lift', name: '电梯厅', zone: '写字楼', x: 70, width: 90, height: 140, prompt: '下楼坐地铁回家', timeCostMinutes: 8, actionDuration: 0.5, action: 'enterMetro' },
      { id: 'off_desk', name: '你的工位', zone: '写字楼', x: 420, width: 140, height: 80, prompt: '坐下敲键盘，进入上班流程', timeCostMinutes: 5, actionDuration: 0.7, action: 'openOfficeWork' },
      { id: 'off_water', name: '茶水间', zone: '写字楼', x: 860, width: 100, height: 90, prompt: '接热水、偷听八卦', timeCostMinutes: 10, actionDuration: 1.0, action: 'officeWater' },
      { id: 'off_print', name: '打印机', zone: '写字楼', x: 1220, width: 80, height: 90, prompt: '卡纸了，修它（社交+）', timeCostMinutes: 12, actionDuration: 1.3, action: 'officePrint' },
      { id: 'off_boss', name: '玻璃会议室', zone: '写字楼', x: 1680, width: 160, height: 110, prompt: '被拉去开会（精力-，钱+/-）', timeCostMinutes: 35, actionDuration: 1.8, action: 'officeMeeting' },
      { id: 'off_stair', name: '消防楼梯', zone: '写字楼', x: 2200, width: 80, height: 140, prompt: '走楼梯下到街区后门', timeCostMinutes: 15, actionDuration: 0.8, action: 'exitToStreet' },
      { id: 'off_roof', name: '天台通道', zone: '写字楼', x: 2520, width: 90, height: 120, prompt: '去天台抽烟透气（接江边风）', timeCostMinutes: 8, actionDuration: 0.6, action: 'enterRiver' }
    ],
    npcs: [
      { id: 'colleague_min', name: '小敏', role: '同事', job: 'office', skin: '#f3c6a8', hair: '#78350f', shirt: '#f9a8d4', pants: '#1f2937', x: 500, homeMin: 380, homeMax: 720, speed: 0.35, dir: 1, talk: ['日报别忘了。', '隔壁工位今天没来。'] },
      { id: 'hr_wang', name: '王HR', role: '人事', job: 'office', skin: '#e8c4a0', hair: '#111827', shirt: '#1d4ed8', pants: '#172554', x: 1700, homeMin: 1580, homeMax: 1900, speed: 0.25, dir: -1, talk: ['口罩戴好。', '全勤奖看打卡。'] }
    ]
  },

  river: {
    id: 'river',
    name: '江边围挡栈道',
    tag: '🌊 铁皮、江风与临时灯',
    width: 3400,
    theme: 'river',
    landmarks: [
      { id: 'river_gate', name: '围挡缺口', zone: '江边', x: 70, width: 90, height: 130, prompt: '钻回街区', timeCostMinutes: 10, actionDuration: 0.5, action: 'exitToStreet' },
      { id: 'river_bench', name: '湿木头长椅', zone: '江边', x: 480, width: 140, height: 40, prompt: '坐着看江，心境回血', timeCostMinutes: 20, actionDuration: 1.6, action: 'riverSit' },
      { id: 'river_fence', name: '蓝铁皮围挡', zone: '江边', x: 980, width: 160, height: 110, prompt: '隔着缝看对岸灯', timeCostMinutes: 8, actionDuration: 1.0, action: 'riverPeek' },
      { id: 'river_cat', name: '阿花的亲戚', zone: '江边', x: 1480, width: 70, height: 45, prompt: '又一只猫。rua。', timeCostMinutes: 15, actionDuration: 1.4, action: 'petCat' },
      { id: 'river_vendor', name: '烤冷面摊（打游击）', zone: '江边', x: 1960, width: 120, height: 80, prompt: '买一份热的 ¥18', timeCostMinutes: 10, actionDuration: 1.1, action: 'riverFood' },
      { id: 'river_bus', name: '夜班公交临时站', zone: '江边', x: 2480, width: 110, height: 90, prompt: '拦 126 路', timeCostMinutes: 6, actionDuration: 0.6, action: 'enterBus' },
      { id: 'river_end', name: '禁止通行灯', zone: '江边', x: 3040, width: 80, height: 100, prompt: '前面封了，原路返回或坐公交', timeCostMinutes: 2, actionDuration: 0.4, action: 'riverDeadend' }
    ],
    npcs: [
      { id: 'fisher', name: '夜钓男', role: '钓客', job: 'idle', skin: '#c4a574', hair: '#1c1917', shirt: '#365314', pants: '#171717', x: 600, homeMin: 420, homeMax: 820, speed: 0.1, dir: 1, talk: ['鱼也不咬。', '这里摄像头少。'] },
      { id: 'vendor_liu', name: '刘师傅', role: '摊贩', job: 'vendor', skin: '#e8b895', hair: '#44403c', shirt: '#ea580c', pants: '#1c1917', x: 1980, homeMin: 1880, homeMax: 2140, speed: 0.2, dir: 1, talk: ['趁城管没来。', '加蛋？'] }
    ]
  }
};

export function getMap(id) {
  return MAPS[id] || MAPS.street;
}
