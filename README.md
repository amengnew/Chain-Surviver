# Chain Survivor

Chain Survivor 是一款结合了区块链 GameFi 元素的 2D 生存类网页游戏，玩法类似于《吸血鬼幸存者》。玩家可以通过链上钱包登录，体验角色成长、技能收集、链上资产管理等创新玩法。游戏支持链上数据同步、技能资产化、链上交易等功能。

非常抱歉！！！ 因为工作时间有限 链上操作等没有调试成功 默认采用 默认账号登陆体验前端游戏


## 项目特色
- 2D 生存玩法，自动攻击、技能成长、敌人波次挑战
- 支持链上钱包登录，玩家数据可上链存储
- 技能系统丰富，技能可升级、保存、链上交易
- 默认账号（游客模式）支持，无需钱包也能体验游戏
- 前端采用 Next.js + React + TailwindCSS，游戏引擎为 Phaser3

## 技术栈

### 前端
- Next.js 15
- React 19
- TypeScript 5
- TailwindCSS 3
- Zustand（状态管理）
- Phaser 3（游戏引擎）

### 区块链集成
- Polkadot Asset Hub
- 智能合约（Solidity/ink!，用于玩家数据、技能资产管理）
- 钱包连接（MetaMask/默认账号）

### 开发工具
- pnpm（推荐）/yarn/npm
- Prettier
- ESLint

## 安装与启动

1. 克隆项目：
   ```bash
   git clone https://github.com/yourname/Chain-Surviver.git
   cd Chain-Surviver
   ```
2. 安装依赖（推荐使用 pnpm）：
   ```bash
   pnpm install
   # 或 yarn install
   # 或 npm install
   ```
3. 启动开发服务器：
   ```bash
   pnpm dev
   # 或 yarn dev
   # 或 npm run dev
   ```
4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 主要功能
- 2D 生存类游戏玩法，自动攻击、技能成长、敌人波次挑战
- 链上钱包连接与默认账号登录
- 玩家数据链上同步与本地存储
- 技能系统：技能收集、升级、链上资产化与交易
- 游戏内 UI：主菜单、技能栏、结算界面等

## 目录结构
```
Chain-Surviver/
├── app/
│   ├── blockchain/      # 区块链相关逻辑与配置
│   ├── components/      # React 组件（登录、菜单、游戏入口等）
│   ├── game/            # 游戏核心逻辑（entities, scenes, skills）
├── public/
│   └── assets/          # 游戏图片、音效等资源
├── .next/               # Next.js 构建产物
├── package.json         # 依赖与脚本
├── README.md            # 项目说明
├── ...
```

## 依赖包及版本

### 主要依赖
- next: 15.3.1
- react: ^19.0.0
- react-dom: ^19.0.0
- tailwindcss: 3.4.3
- postcss: ^8.5.3
- autoprefixer: ^10.4.21
- phaser: ^3.88.2
- zustand: ^5.0.4

### 开发依赖
- typescript: ^5
- prettier: ^3.5.3
- @types/node: ^20
- @types/react: ^19
- @types/react-dom: ^19
- @tailwindcss/postcss: ^4

---

如需了解更多开发细节，请参考 `workflow.md`、`design.md`、`skill.md` 等文档。
