/**
 * 地标物体配置
 * 定义所有可交互的场景物体
 */

export const WORLD_WIDTH = 4400;
export const FLOOR_Y = 415;

export const landmarks = [
  {
    id: 'home_bed',
    name: '单人行军床',
    zone: '出租屋 · 卧室',
    x: 120,
    width: 110,
    height: 70,
    prompt: '盖好被子安睡休息 (快速补精力与退虚汗)',
    timeCostMinutes: 120,
    actionDuration: 2.2,
    action: 'sleep'
  },
  {
    id: 'home_tv',
    name: '二手旧彩电',
    zone: '出租屋 · 起居角',
    x: 245,
    width: 60,
    height: 60,
    prompt: '收看晨间疫情防控新闻快报',
    timeCostMinutes: 15,
    actionDuration: 1.2,
    action: 'watchNews'
  },
  {
    id: 'home_desk',
    name: '工作书桌 & 笔记本电脑',
    zone: '出租屋 · 工作台',
    x: 350,
    width: 90,
    height: 80,
    prompt: '打开电脑接私活兼职 / 查看业主群',
    timeCostMinutes: 5,
    actionDuration: 0.6,
    action: 'openPhone'
  },
  {
    id: 'home_stove',
    name: '简易厨房灶台与食材柜',
    zone: '出租屋 · 烹饪角',
    x: 550,
    width: 85,
    height: 100,
    prompt: '起火烹饪热饭热汤 / 煮红糖姜茶',
    timeCostMinutes: 5,
    actionDuration: 0.6,
    action: 'openKitchen'
  },
  {
    id: 'home_door',
    name: '出租屋防盗铁门',
    zone: '单元防盗出入口',
    x: 740,
    width: 60,
    height: 130,
    prompt: '推开防盗门步入街道',
    timeCostMinutes: 5,
    actionDuration: 0.8,
    action: 'exitHome'
  },
  {
    id: 'contactless_rack',
    name: '小区门口无接触外卖置物架',
    zone: '朝阳里小区出入口',
    x: 1020,
    width: 100,
    height: 90,
    prompt: '翻找自提快递或爱心蔬菜',
    timeCostMinutes: 20,
    actionDuration: 1.8,
    action: 'checkRack'
  },
  {
    id: 'pcr_sampling_booth',
    name: '常态化便民核酸排查采样亭',
    zone: '便民核酸点',
    x: 1320,
    width: 110,
    height: 110,
    prompt: '排队进行咽拭子核酸排查 (维持绿码)',
    timeCostMinutes: 30,
    actionDuration: 2.2,
    action: 'takePCR'
  },
  {
    id: 'subway_entrance',
    name: '地铁10号线出入口 · 商务园区专线',
    zone: '朝阳北大街 · 地铁站',
    x: 1720,
    width: 140,
    height: 120,
    prompt: '选择通勤方式前往公司工位打卡 (赚取全勤日薪)',
    timeCostMinutes: 5,
    actionDuration: 0.6,
    action: 'openCommute'
  },
  {
    id: 'stray_cat_shrine',
    name: '绿化带旁避雨的流浪三花猫 (阿花)',
    zone: '街角花坛',
    x: 2180,
    width: 70,
    height: 50,
    prompt: '蹲下轻轻抚摸小猫咪 (+25 心境)',
    timeCostMinutes: 20,
    actionDuration: 1.8,
    action: 'petCat'
  },
  {
    id: 'street_pharmacy',
    name: '老百姓大药房 (实体店)',
    zone: '商业街 · 药房门市',
    x: 2600,
    width: 140,
    height: 120,
    prompt: '排队线下平价买布洛芬退热药 (¥60/盒)',
    timeCostMinutes: 30,
    actionDuration: 2.0,
    action: 'buyMedicine'
  },
  {
    id: 'street_convenience_store',
    name: '全家 24H 实体便利店',
    zone: '商业街 · 24H便利店',
    x: 3120,
    width: 150,
    height: 120,
    prompt: '购买现热便当与生鲜鸡蛋 (¥35)',
    timeCostMinutes: 20,
    actionDuration: 1.8,
    action: 'buyFood'
  },
  {
    id: 'disinfection_cannon_truck',
    name: '大型防疫雾炮消杀车',
    zone: '主干道消杀段',
    x: 3750,
    width: 160,
    height: 110,
    prompt: '接受含氯喷雾冲刷消毒外衣背包',
    timeCostMinutes: 15,
    actionDuration: 1.8,
    action: 'disinfect'
  }
];
