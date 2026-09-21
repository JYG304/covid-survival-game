# 🏗️ 游戏架构文档

## 📋 目录

1. [架构概览](#架构概览)
2. [目录结构](#目录结构)
3. [核心系统](#核心系统)
4. [数据流](#数据流)
5. [扩展指南](#扩展指南)

---

## 架构概览

本游戏采用**模块化架构**，将代码按功能职责划分为多个独立模块，每个模块专注于单一功能领域。

### 设计原则

- **单一职责原则**：每个模块只负责一个功能领域
- **依赖注入**：通过ES6模块系统管理依赖
- **事件驱动**：使用回调系统实现模块间通信
- **数据驱动**：通过配置文件管理游戏内容

### 技术栈

- **JavaScript ES6+**：现代JavaScript特性
- **Canvas 2D API**：图形渲染
- **Web Audio API**：音效合成
- **HTML5**：游戏容器

---

## 目录结构

```
横板模拟经营/
├── index.html              # 游戏入口页面
├── src/                    # 源代码目录
│   ├── main.js            # 🎮 游戏主循环和初始化
│   ├── DEVGUIDE.js        # 📖 开发者指南
│   │
│   ├── data/              # 📊 数据层
│   │   ├── gameState.js   # 游戏状态管理（单一数据源）
│   │   └── landmarks.js   # 地标物体配置
│   │
│   ├── game/              # 🎯 游戏核心
│   │   ├── player.js      # 玩家控制系统
│   │   ├── renderer.js    # 场景渲染系统
│   │   └── enhancedRenderer.js  # 增强视觉效果
│   │
│   ├── systems/           # ⚙️ 游戏系统
│   │   ├── timeSystem.js  # 时间流逝系统
│   │   ├── actionSystem.js # 交互动作系统
│   │   └── deepGameplayIntegration.js  # 深度玩法系统
│   │
│   ├── ui/                # 🖼️ 用户界面
│   │   ├── hud.js         # 状态栏更新
│   │   └── toast.js       # 消息通知系统
│   │
│   └── utils/             # 🛠️ 工具函数
│       └── audio.js       # 音频合成器
│
├── assets/                # 🎨 资源文件（预留）
│   ├── audio/
│   └── images/
│
├── README.md              # 项目说明
├── CHANGELOG.md           # 更新日志
├── ARCHITECTURE.md        # 本文件
└── package.json           # 项目配置
```

---

## 核心系统

### 1. 主循环系统 (`main.js`)

**职责**：统筹所有系统，驱动游戏运行

```javascript
function gameLoop(currentTime) {
  const delta = (currentTime - lastTime) / 1000;
  
  // 更新阶段
  updateTimeFlow(delta);        // 时间推进
  updatePlayer(delta);          // 玩家逻辑
  updateDeepGameplay(delta);    // 深度玩法
  updateCamera(canvas);         // 相机跟随
  updateParticles(delta);       // 粒子效果
  updateScreenShake(delta);     // 屏幕震动
  
  // 渲染阶段
  renderFarSky(ctx, canvas);           // 背景层
  renderMidgroundWorld(ctx, canvas);   // 世界层
  renderRainForeground(ctx, canvas);   // 前景层
  renderFloatingTexts(ctx, delta);     // UI层
  renderPostProcessing(ctx, canvas);   // 后处理
  
  requestAnimationFrame(gameLoop);
}
```

**关键特性**：
- 固定时间步长更新
- 分层渲染（背景 → 世界 → 前景 → UI）
- 后处理效果独立于游戏世界

---

### 2. 数据层 (`data/`)

#### `gameState.js` - 游戏状态管理

**职责**：存储所有游戏运行时数据，作为单一数据源（Single Source of Truth）

```javascript
export const gameState = {
  // 时间系统
  day: 1,
  hour: 8,
  minute: 0,
  timeSpeed: 1,
  
  // 玩家属性
  hunger: 80,
  energy: 90,
  health: 100,
  bodyTemp: 36.5,
  sanity: 100,
  money: 50,
  
  // 状态标志
  hasMaskOn: true,
  isPositiveKnown: false,
  nearbyItem: null,
  
  // 深度玩法
  relationships: new Map(),
  skills: new Map(),
  // ...更多状态
};
```

#### `landmarks.js` - 地标物体配置

**职责**：定义游戏世界中的所有可交互物体

```javascript
export const landmarks = [
  {
    id: 'home_bed',
    label: '床铺',
    icon: '🛏️',
    x: 150,
    y: FLOOR_Y,
    width: 80,
    height: 45
  },
  // ...更多地标
];
```

---

### 3. 游戏核心 (`game/`)

#### `player.js` - 玩家控制系统

**职责**：处理玩家输入和移动逻辑

```javascript
export const player = {
  x: 400,
  y: FLOOR_Y,
  speed: 220,
  facing: 1,
  isMoving: false,
  walkCycle: 0
};

export function updatePlayer(delta) {
  // 键盘输入处理
  // 移动逻辑
  // 碰撞检测
  // 动画更新
}
```

#### `renderer.js` - 场景渲染系统

**职责**：绘制游戏世界的所有视觉元素

**渲染管线**：
1. 远景天空 + 视差建筑
2. 中景地面 + 道路纹理
3. 场景建筑 + 装饰物
4. 地标物体 + 阴影
5. NPC + 动态元素
6. 玩家角色
7. 雨滴前景

#### `enhancedRenderer.js` - 增强视觉效果

**职责**：提供高级视觉效果

**特效系统**：
- **粒子系统**：爆发、烟雾、火花
- **后处理**：发烧红屏、理智暗角、饥饿泛白
- **屏幕震动**：战斗、爆炸、重击反馈
- **交互提示**：光晕、脉冲、高亮

---

### 4. 游戏系统 (`systems/`)

#### `timeSystem.js` - 时间流逝系统

**职责**：管理游戏时间推进和时间事件

```javascript
export function updateTimeFlow(delta) {
  if (gameState.timeSpeed === 0) return;
  
  minuteAccumulator += delta * gameState.timeSpeed;
  
  if (minuteAccumulator >= 60 / MINUTES_PER_HOUR) {
    advanceTime();
  }
}

function advanceTime() {
  gameState.minute += 1;
  
  if (gameState.minute >= 60) {
    gameState.hour += 1;
    onHourPassed();  // 触发每小时事件
  }
  
  if (gameState.hour >= 24) {
    gameState.day += 1;
    onDayPassed();   // 触发每日事件
  }
}
```

**回调系统**：
- `registerHourCallback(fn)` - 注册每小时回调
- `registerDayCallback(fn)` - 注册每日回调

#### `actionSystem.js` - 交互动作系统

**职责**：处理玩家与世界的交互

```javascript
export function performAction(actionType, ...args) {
  switch (actionType) {
    case 'sleep':
      return sleepAction();
    case 'cook':
      return cookAction(args[0]);
    case 'buy':
      return buyAction(args[0], args[1]);
    // ...更多动作
  }
}
```

#### `deepGameplayIntegration.js` - 深度玩法系统

**职责**：整合高级游戏机制

**子系统**：
1. **关系系统**：NPC好感度、社交互动
2. **技能系统**：技能升级、解锁新能力
3. **任务系统**：主线/支线任务追踪
4. **经济系统**：市场波动、价格变化
5. **天气系统**：天气影响玩法

---

### 5. 用户界面 (`ui/`)

#### `hud.js` - 状态栏更新

**职责**：更新屏幕上的UI显示

```javascript
export function updateHUD() {
  updateElement('spanDay', `第 ${gameState.day} 天`);
  updateElement('spanHour', formatTime());
  updateProgressBar('barHunger', gameState.hunger);
  updateProgressBar('barEnergy', gameState.energy);
  // ...更多UI更新
}
```

#### `toast.js` - 消息通知系统

**职责**：显示游戏内消息和漂浮文字

```javascript
export function showToast(message, type = 'info') {
  // 在屏幕顶部显示通知
}

export function spawnFloatingText(text, x, y, color) {
  // 在世界坐标显示漂浮文字（伤害数字、提示等）
}
```

---

## 数据流

### 输入流

```
用户输入 (键盘/鼠标)
    ↓
player.js (处理输入)
    ↓
gameState 更新
    ↓
系统响应 (actionSystem, timeSystem等)
    ↓
UI更新 (hud.js, toast.js)
```

### 渲染流

```
gameLoop 开始
    ↓
各系统 update()
    ↓
gameState 更新
    ↓
renderer 读取 gameState
    ↓
Canvas 绘制
    ↓
requestAnimationFrame 下一帧
```

### 事件流

```
时间推进 (timeSystem)
    ↓
触发回调 (onHourPassed / onDayPassed)
    ↓
深度玩法系统响应
    ↓
gameState 更新
    ↓
UI反馈
```

---

## 扩展指南

### 添加新地标物体

**步骤**：

1. 在 `src/data/landmarks.js` 中添加配置：

```javascript
{
  id: 'new_landmark',
  label: '新地标',
  icon: '🏢',
  x: 1000,
  y: FLOOR_Y,
  width: 60,
  height: 80,
  color: '#3b82f6'
}
```

2. （可选）在 `src/systems/actionSystem.js` 中添加交互逻辑：

```javascript
export function interactNewLandmark() {
  gameState.money -= 10;
  showToast('与新地标互动！');
}
```

### 添加新技能

**步骤**：

1. 在 `src/systems/deepGameplayIntegration.js` 中注册技能：

```javascript
DeepGameplay.skillSystem.addSkill('cooking', {
  name: '烹饪',
  level: 1,
  exp: 0,
  maxLevel: 10,
  effects: ['提升食物恢复量']
});
```

2. 在相关动作中应用技能加成：

```javascript
function cookAction() {
  const cookingLevel = DeepGameplay.skillSystem.getSkillLevel('cooking');
  const bonus = cookingLevel * 5;
  gameState.hunger = Math.min(100, gameState.hunger + 30 + bonus);
  DeepGameplay.skillSystem.addExp('cooking', 10);
}
```

### 添加新状态效果

**步骤**：

1. 在 `gameState.js` 中添加状态字段：

```javascript
export const gameState = {
  // ...现有字段
  newStatus: 0
};
```

2. 在对应系统中更新逻辑（如 `timeSystem.js`）：

```javascript
function onHourPassed() {
  gameState.newStatus -= 5;
  if (gameState.newStatus < 0) {
    triggerNegativeEffect();
  }
}
```

3. 在 `hud.js` 中添加UI显示：

```javascript
export function updateHUD() {
  // ...现有更新
  updateElement('spanNewStatus', gameState.newStatus);
}
```

4. 在 `enhancedRenderer.js` 中添加视觉反馈：

```javascript
export function renderPostProcessing(ctx, canvas) {
  // ...现有效果
  
  if (gameState.newStatus < 20) {
    // 绘制警告效果
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
```

### 添加新的深度玩法系统

**步骤**：

1. 在 `src/systems/deepGameplayIntegration.js` 中创建新系统类：

```javascript
class NewSystem {
  constructor() {
    this.data = {};
  }
  
  update(delta) {
    // 系统逻辑
  }
  
  onDayPassed() {
    // 每日更新
  }
}
```

2. 在 `DeepGameplay` 中注册系统：

```javascript
export const DeepGameplay = {
  // ...现有系统
  newSystem: null
};

export function initDeepGameplaySystems() {
  // ...现有初始化
  DeepGameplay.newSystem = new NewSystem();
}
```

3. 在主循环中调用更新：

```javascript
export function updateDeepGameplay(delta) {
  // ...现有更新
  DeepGameplay.newSystem.update(delta);
}
```

---

## 性能优化建议

### 渲染优化

1. **减少重绘**：只绘制可见区域内的对象
2. **分层渲染**：静态背景可以缓存到离屏Canvas
3. **降低粒子数量**：根据设备性能动态调整

### 逻辑优化

1. **避免频繁查找**：缓存DOM元素引用
2. **使用对象池**：复用粒子对象
3. **延迟计算**：非关键逻辑降低更新频率

### 内存优化

1. **及时清理**：移除过期的事件监听器
2. **限制数组大小**：粒子、浮动文字等有上限
3. **使用WeakMap**：自动垃圾回收不再使用的对象

---

## 调试技巧

### 开启调试模式

在浏览器控制台输入：

```javascript
window.DEBUG = true;
```

### 修改游戏状态

```javascript
// 增加金钱
gameState.money = 1000;

// 修改时间
gameState.hour = 12;

// 解锁技能
DeepGameplay.skillSystem.addSkill('master', { level: 10 });
```

### 查看内部状态

```javascript
// 查看所有技能
console.log(DeepGameplay.skillSystem.skills);

// 查看所有关系
console.log(DeepGameplay.relationshipSystem.relationships);

// 查看任务列表
console.log(DeepGameplay.questSystem.quests);
```

---

## 常见问题

### Q: 如何暂停游戏？

A: 设置 `gameState.timeSpeed = 0;` 或点击UI上的暂停按钮。

### Q: 如何重置游戏？

A: 刷新页面，或者调用 `location.reload()`。

### Q: 如何添加音效？

A: 使用 `audio.playTone(frequency, duration, waveType, volume)` 合成音效。

### Q: 如何导出/导入存档？

A: 当前版本暂未实现存档系统，可通过 `localStorage` 手动实现。

---

## 贡献指南

### 代码风格

- 使用2空格缩进
- 函数名使用驼峰命名法
- 常量使用大写下划线
- 每个函数前添加JSDoc注释

### 提交规范

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
perf: 性能优化
test: 添加测试
```

---

## 版本历史

- **v2.0.0** (2024-09) - 重构为模块化架构，添加深度玩法系统
- **v1.0.0** (2024-08) - 初始版本，单文件实现

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。
