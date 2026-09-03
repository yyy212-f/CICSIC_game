# 密羽寻踪 H5 Demo

## 开发文档

### 环境要求

- Node.js 18 或更高版本
- npm（随 Node.js 一并安装）
- 推荐使用 Chrome、Edge 等现代浏览器进行横屏调试

本项目在 Windows PowerShell 中统一使用 `npm.cmd`。这能避免系统限制 `npm.ps1` 脚本执行时出现的错误。

### 安装依赖

先将终端路径切换到miyuxunzong-demo下

首次获取项目后，在本目录执行：

```powershell
npm.cmd install
```

### 启动开发服务

双击本目录的 `start-dev.bat`，它会先构建项目，再启动开发服务。

也可以在终端中执行：

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

浏览器访问：

```text
http://127.0.0.1:5173/
```

### 构建生产版本

```powershell
npm.cmd run build
```

构建结果位于 `dist/`。部署静态网站时，仅需发布该目录中的文件。

### 预览构建产物

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

访问 `http://127.0.0.1:4173/`。

### 开发约定

- 使用 Vue 3、TypeScript、Vite 和 Pinia。
- 路由采用 Hash 模式，适合 GitHub Pages 等纯静态托管环境。
- `src/data/tempered_1937.json` 是构建期导入的主线剧本。不要在主流程中重新改为 `fetch` 读取，否则地图进入剧情时会重新出现异步加载风险。
- `src/data/gameData.ts` 是剧本查询入口，负责按章节和节点取得剧情数据。
- 游戏状态统一保存在 `src/stores/gameStore.ts`，存档由 `src/engine/SaveManager.ts` 写入浏览器 IndexedDB。
- 修改后先执行 `npm.cmd run build`，确认 TypeScript 类型检查和 Vite 构建都通过。

### 目录说明

```text
src/
  data/
    tempered_1937.json   # 构建期剧本数据
    gameData.ts          # 剧本查询工具
  engine/
    SaveManager.ts       # IndexedDB 存档
  router/
    index.ts             # 页面路由
  stores/
    gameStore.ts         # 玩家状态、奖励、进度
  views/
    HomePage.vue         # 开场和首页
    WorldSelectPage.vue  # 七大世界选择
    WorldMapPage.vue     # 横屏探索地图
    NarrativePage.vue    # 剧情与选项
    StationPage.vue      # 情报站和密码箱
    CinemaPage.vue       # 本地题库
    FragmentPage.vue     # 碎片收集
    MarketPage.vue       # 虚拟市集
    ProfilePage.vue      # 个人档案
  style.css              # 全局横屏样式和动效
public/                  # 静态资源（当前保留原始数据与占位资源）
dist/                    # 构建产物，不手工编辑
```

### 键盘操作

| 页面 | 操作 |
|---|---|
| 地图 | `WASD` 或方向键移动情报鹰；到达 POI 后按 `Enter` 进入 |
| 世界选择 | 方向键切换世界卡片；`Enter` 进入已开放世界 |
| 剧情 | `↑↓` / `←→` 切换选项；`Enter` 确认或推进；`Esc` 返回地图 |

## 项目内容

“密羽寻踪”是面向青年群体的国家安全教育沉浸式互动 H5。玩家以代号“渡鸦”进入隐蔽战线故事，通过情报鹰引导，在地图探索、剧情抉择、密码验证和知识问答中推进任务。

当前 Demo 以 **淬火 1937** 世界为核心，采用横屏交互。全部内容在浏览器本地运行，不需要后端、账号或云端数据库。

### 当前已实现

- 开场引导、横屏首页和七大世界入口
- 淬火 1937 的可视化探索地图
- 默认任务探索与自由探索模式切换
- 情报鹰点击移动、WASD/方向键移动、插值平滑移动和轨迹记录
- 主线剧情、选项分支、条件判断、数值变化和结局
- 情报站：NPC 指引、任务交接、密码验证、每日密码箱
- 本地题库、情报碎片、虚拟市集与个人档案
- IndexedDB 自动存档与手动存档
- 页面过渡、地图 POI 到达提示和情报鹰悬浮动效

### 五大功能模块

1. **全域探索地图**：每个主题世界对应一张地图。当前 Demo 提供自由探索、任务探索、POI 到达触发和轨迹记录。
2. **情报站**：承担线索传递、密码破译、任务提交和奖励发放。
3. **国安题库**：以本地题目验证知识学习与奖励流程。视频播放暂未纳入当前版本。
4. **情报碎片**：通过完成剧情收集故事片段，逐步解锁英烈故事。
5. **虚拟市集**：使用羽毛兑换本地虚拟道具和装扮，不包含现实交易。

### 当前范围边界

以下能力依赖服务端、版权资源或外部平台，因此不属于当前静态 H5 Demo：

- 组队探索、实时协同、好友与契约
- 账号、跨设备云存档和数据统计
- LBS 打卡、二维码验证、分享轨迹
- 影片播放、版权内容托管和教师集体模式
- 实体文创、库存、订单、兑换码和线下核销

## 部署

项目是纯静态 H5，可部署到任意 HTTPS 静态托管平台。

GitHub Pages 部署时：提交源码仓库并通过 GitHub Actions 构建后发布 `dist/`，或将 `dist/` 内的文件发布到专用 `gh-pages` 分支。由于使用 Hash 路由，不需要服务器额外配置 SPA 重写规则。
