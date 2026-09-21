export const DIALOGUES = {
  store_clerk: {
    open: '店员把关东煮汤撇了一下：便当五点半折扣。口罩拉好。',
    options: [
      { t: '微波怎么用。', rel: 2, line: '自己按。别把汤溅到机器上。' },
      { t: '有口罩卖吗？', rel: 3, line: '断货三天了。' }
    ]
  },
  hotel_boss: {
    open: '前台大姐敲了敲抽屉：现金。不开发票。钟点四小时。',
    options: [
      { t: '开一间。', rel: 3, line: '二楼右手。窗帘自己拉。' },
      { t: '太贵了。', rel: 0, line: '那你走。' }
    ]
  },
  ktv_wait: {
    open: '服务员把果盘单递过来：最低消费。麦套……将就用。',
    options: [
      { t: '先点啤酒。', rel: 4, line: '十分钟。别把麦摔了。' },
      { t: '有消毒湿巾吗？', rel: 5, line: '前台有，自己拿。' }
    ]
  },
  comt_aunt: {
    open: '张阿姨把口罩带子勒在耳朵后：菜下午才到。别挤。',
    options: [
      { t: '李姐那袋在吗？', rel: 6, line: '货架上，写了名字。' },
      { t: '我来当志愿者。', rel: 8, line: '先填表。陈网格员说了算。', skill: 'charisma' }
    ]
  },
  lobby_sec: {
    open: '保安老周指测温柱：健康码。帽子摘了。',
    options: [
      { t: '亮码。', rel: 2, flags: ['metroScanned'], line: '过。电梯靠右。' },
      { t: '我忘带工卡了。', rel: -1, line: '前台登记。别堵闸机。' }
    ]
  },
  mall_clerk: {
    open: '导购把口罩往上提了提：这件有现货。更衣室要扫场所码。',
    options: [
      { t: '我试试黑工装。', rel: 4, line: '试衣间在左边。口罩别摘太久。' },
      { t: '有便宜的吗？', rel: 2, line: '折扣区在角落。 pleats 是原价。' },
      { t: '我就看看。', rel: 1, line: '好。别挡着镜子。' }
    ]
  },
  lin_jie: {
    open: '手还没散。馆里两张床空着，你是来躺，还是来顶班？',
    options: [
      { t: '我想学手法，今天跟你上岗。', rel: 8, flags: ['parlorInvite'], line: '行。别偷懒，客人躺下就不爱说话。', skill: 'massage' },
      { t: '肩太硬了，求你按一次。', rel: 5, line: '八十。按完走路会轻。' },
      { t: '只是路过打个招呼。', rel: 2, line: '嗯。门口消杀味别带进来。' }
    ]
  },
  ahua_staff: {
    open: '小周把毛巾叠好，没抬头：今天手法偏重，酸爽那种。',
    options: [
      { t: '重一点也行，我扛得住。', rel: 6, line: '那你趴好。别中途喊停。' },
      { t: '教我两下？', rel: 10, flags: ['parlorInvite'], line: '拇指别死顶。用体重。', skill: 'massage' },
      { t: '你看起来很累。', rel: 7, line: '连续按了六个。下班想喝热汤。' }
    ]
  },
  uncle_zhao: {
    open: '赵叔按着腰：腰椎不行了。年轻人，别老驼着。',
    options: [
      { t: '我扶你去推拿馆。', rel: 12, flags: ['seatZhao'], line: '……那就麻烦你了。', skill: 'charisma' },
      { t: '药店那盒药你买了吗？', rel: 4, line: '排队到一半号没了。' },
      { t: '天气这样，少出门。', rel: 3, line: '在家更疼。' }
    ]
  },
  courier_wu: {
    open: '吴骑手摘下头盔又戴上：单还在跑。口罩起雾看不清门牌。',
    options: [
      { t: '货架那两袋是你放的？', rel: 5, line: '对。李姐那袋别拿错。' },
      { t: '要不要上楼歇会儿。', rel: 8, line: '超时要扣。谢了。', skill: 'charisma' },
      { t: '江边那条路通吗？', rel: 4, line: '围挡缺口能钻。城管七点后才来。' }
    ]
  },
  grid_chen: {
    open: '陈网格员举起喇叭又放下：绿码通行。聚集就劝返。',
    options: [
      { t: '夜店巷有人聚集，我看见了。', rel: -6, flags: ['snitch'], line: '记下了。你回去。', skill: 'streetwise' },
      { t: '我们只是买药。', rel: 3, line: '口罩拉高。别逗留。' },
      { t: '居委会鸡蛋还有吗？', rel: 2, line: '明天早上货架。别挤。' }
    ]
  },
  neighbor_li: {
    open: '李姐探出防盗门：鸡蛋还够吗？晚上别太吵。阿花又在门口蹲着。',
    options: [
      { t: '我分你两个鸡蛋。', rel: 14, need: { rawFood: 1 }, flags: ['helpedLi'], line: '……那我明天还你挂面。', skill: 'charisma' },
      { t: '有多余的退热药吗？', rel: 4, line: '就一板，自己也怕。' },
      { t: '我去夜店，会轻手轻脚回来。', rel: -2, line: '门禁十一点后要登记。' }
    ]
  },
  cough_man: {
    open: '他口罩挂在下巴上，咳了一声：空调太闷了。',
    options: [
      { t: '把口罩拉上去。', rel: -4, line: '你管得还挺宽。', skill: 'streetwise' },
      { t: '换我站这边，你靠窗。', rel: 5, line: '……谢了。车门缝有风。' },
      { t: '沉默地拉开一米。', rel: 0, line: '他没再看你。' }
    ]
  },
  office_girl: {
    open: '加班女盯着手机：昨晚四点才走。报表又崩了。',
    options: [
      { t: '23楼也是这样。要不要茶水间见。', rel: 8, flags: ['officeAlly'], line: '行。别让王HR看见。', skill: 'office' },
      { t: '今晚别熬了。', rel: 5, line: '全勤奖看着呢。' },
      { t: '你也去夜店散散？', rel: 6, line: '末班地铁前必须走。' }
    ]
  },
  metro_guard: {
    open: '站务把闸机敲了一下：请佩戴口罩。不要倚靠车门。',
    options: [
      { t: '亮码。', rel: 2, flags: ['metroScanned'], line: '过。' },
      { t: '后面那人没戴好。', rel: 1, line: '我看见了。' }
    ]
  },
  bus_aunt: {
    open: '买菜阿姨把袋子护住：鸡蛋又涨了。这车太晃。',
    options: [
      { t: '我帮你扶着。', rel: 7, line: '好孩子。医院那站要挤。', skill: 'charisma' },
      { t: '江边摊还便宜。', rel: 4, line: '城管来了就没。' }
    ]
  },
  bus_kid: {
    open: '小孩把口罩勒出红印：作业没写完。',
    options: [
      { t: '口罩松一点，别勒。', rel: 5, line: '妈说不能摘。' },
      { t: '你作业哪道？', rel: 3, line: '应用题。我不会。' }
    ]
  },
  dj_neo: {
    open: 'Neo 把耳机掀起一边：今晚低音往死里砸。封控夜更疯。',
    options: [
      { t: '让我顶两首。', rel: 10, flags: ['clubWork'], line: '别切到广播体操。', skill: 'streetwise' },
      { t: '音量小一点，网格员在后门。', rel: 4, line: '……知道了。' },
      { t: '只喝酒。', rel: 2, line: '去找 Mia。' }
    ]
  },
  bar_mia: {
    open: 'Mia 擦杯子：气泡水还是假威士忌？别在店里摘口罩。',
    options: [
      { t: '气泡水。再问一句今晚缺人吗。', rel: 8, flags: ['clubWork'], line: '缺。老K在卡座。', skill: 'charisma' },
      { t: '假威士忌。', rel: 3, line: '冰块够多就不会想吐。' },
      { t: '你看起来不像怕封控。', rel: 6, line: '怕。所以才开灯。' }
    ]
  },
  dancer_kai: {
    open: 'Kai 已经出汗：来不来中间？明天还要打卡。',
    options: [
      { t: '来。', rel: 8, flags: ['dancedWithKai'], line: '别踩我鞋。', skill: 'fitness' },
      { t: '我看着就行。', rel: 2, line: '那你靠边，别挡灯。' }
    ]
  },
  club_boss: {
    open: '老K靠在卡座：缺个兼职。别让网格员从后门进来。',
    options: [
      { t: '我可以看门，也可以打碟。', rel: 9, flags: ['clubWork'], line: '今晚先看门。红包现金。', skill: 'streetwise' },
      { t: '陈网格员我认识。', rel: 5, line: '那就别让他进来。' },
      { t: '我只坐一会儿。', rel: 1, line: '最低消费自己问 Mia。' }
    ]
  },
  nurse_ye: {
    open: '叶护士不抬头：口罩拉高。有没有接触史？',
    options: [
      { t: '如实说：地铁里有人咳。', rel: 4, flags: ['triaged'], line: '去黄线。别碰扶手。' },
      { t: '没有。我来开药。', rel: 1, flags: ['triaged'], line: '预检条拿着。' },
      { t: '体温我自己量过，正常。', rel: -2, line: '这里重新量。' }
    ]
  },
  patient_old: {
    open: '候诊大爷把号纸捏皱：号又往后顺了。年轻人别凑近。',
    options: [
      { t: '我站远一点。要不要水。', rel: 6, line: '不用。你也是发热？' },
      { t: '窗口在喊你了。', rel: 4, line: '……我耳朵不好。' }
    ]
  },
  colleague_min: {
    open: '小敏从隔板探头：日报别忘了。隔壁工位今天没来。',
    options: [
      { t: '我帮你对一下表。', rel: 8, flags: ['officeAlly'], line: '谢。茶水间说。', skill: 'office' },
      { t: '没来的人……阳了？', rel: 3, line: 'HR 不让传。' },
      { t: '下班去夜店。', rel: 5, line: '末班前我得走。' }
    ]
  },
  hr_wang: {
    open: '王HR夹着文件夹：口罩戴好。全勤奖看打卡。',
    options: [
      { t: '我已经在工位了。', rel: 2, line: 'KPI 别掉。' },
      { t: '小敏隔壁那人怎么办。', rel: -3, line: '你做好自己的。' }
    ]
  },
  fisher: {
    open: '夜钓男盯着水面：鱼也不咬。这里摄像头少。',
    options: [
      { t: '借你旁边坐坐。', rel: 5, line: '别踩竿。' },
      { t: '城管从哪边来。', rel: 4, line: '围挡东口。七点后。', skill: 'streetwise' }
    ]
  },
  vendor_liu: {
    open: '刘师傅掀开盖：趁城管没来。加蛋？',
    options: [
      { t: '加蛋。再问李姐鸡蛋你进得着吗。', rel: 6, line: '明天早市。别告诉网格员。', skill: 'streetwise' },
      { t: '不买，看看就走。', rel: -1, line: '那就让让，别挡炉子。' }
    ]
  }
};
