# Chain Survivor 游戏核心类设计

## 1. 玩家账号（PlayerAccount）
- 属性：
  - id: string                      // 唯一账号ID（如钱包地址）
  - nickname: string                // 昵称
  - avatar: string                  // 头像
  - tokenBalance: number            // 链上代币余额
  - skills: Skill[]                 // 已拥有技能（可交易）
  - lastLogin: number               // 上次登录时间
  - gameRecords: GameRecord[]       // 历史对局记录
- 方法：
  - login(): void                   // 登录
  - logout(): void                  // 登出
  - saveSkill(skill: Skill): void   // 保存技能到账号
  - tradeSkill(skillId: string, to: PlayerAccount): void // 技能交易
  - syncToChain(): void             // 同步数据到链上

## 2. 主角（Player/Hero）
- 属性：
  - account: PlayerAccount          // 绑定的账号信息
  - position: { x: number, y: number }  // 位置
  - velocity: { x: number, y: number }  // 速度
  - speed: number                       // 移动速度
  - hp: number                          // 当前生命值
  - maxHp: number                       // 最大生命值
  - exp: number                         // 当前经验值
  - level: number                       // 当前等级
  - attackCooldown: number              // 攻击冷却
  - attackRange: number                 // 攻击范围
  - attackPower: number                 // 攻击力
  - skills: Skill[]                     // 当前局拥有技能
  - isAlive: boolean                    // 是否存活
- 方法：
  - move(direction: {x, y}): void       // 移动
  - attack(): void                      // 自动攻击
  - takeDamage(amount: number): void    // 受伤
  - gainExp(amount: number): void       // 获得经验
  - levelUp(): void                     // 升级
  - update(): void                      // 每帧更新

## 3. 敌人（Enemy）
- 属性：
  - position: { x: number, y: number }
  - velocity: { x: number, y: number }
  - speed: number
  - hp: number
  - maxHp: number
  - attackPower: number
  - expValue: number                    // 被击败时掉落经验
  - isAlive: boolean
- 方法：
  - moveToward(target: {x, y}): void    // 向目标移动
  - attack(target: Player): void        // 攻击主角
  - takeDamage(amount: number): void    // 受伤
  - die(): void                        // 死亡
  - update(): void                     // 每帧更新

## 4. 地图（Map/World）
- 属性：
  - width: number
  - height: number
  - obstacles: Obstacle[]               // 障碍物
  - spawnPoints: {x, y}[]               // 敌人/道具生成点
- 方法：
  - isWalkable(x, y): boolean           // 判断是否可行走
  - getRandomSpawnPoint(): {x, y}       // 获取随机生成点

## 5. 经验球（ExpOrb）
- 属性：
  - position: { x: number, y: number }
  - value: number                       // 经验值
  - isCollected: boolean
- 方法：
  - moveToward(target: {x, y}): void    // 吸向主角
  - collect(player: Player): void       // 被主角收集

## 6. 技能（Skill）
- 属性：
  - id: string
  - name: string
  - level: number
  - cooldown: number
  - effect: (player: Player, enemies: Enemy[]) => void
  - tradable: boolean                   // 是否可交易
  - owner: PlayerAccount                // 技能归属账号
- 方法：
  - use(): void
  - levelUp(): void
  - transfer(to: PlayerAccount): void   // 技能转让

## 7. 游戏管理器（GameManager）
- 属性：
  - player: Player
  - enemies: Enemy[]
  - expOrbs: ExpOrb[]
  - map: Map
  - time: number
- 方法：
  - spawnEnemy(): void
  - update(): void
  - checkGameOver(): boolean

## 8. 对局记录（GameRecord）
- 属性：
  - id: string
  - playerId: string
  - startTime: number
  - endTime: number
  - level: number
  - skillsUsed: Skill[]
  - result: string (win/lose/score)

---

## 新增机制说明
- 玩家账号（PlayerAccount）与链上钱包绑定，支持链上代币余额、技能资产等。
- 每次登录后可同步链上数据，技能、代币等信息永久保存。
- 每局游戏结束后，玩家可选择保存一个技能到账号，技能可在链上交易。
- 技能拥有唯一ID和归属权，支持转让、交易。
- 技能和账号信息通过链上智能合约管理，确保资产安全和可追溯。

## 交互关系
- Player 通过键盘控制移动，自动攻击附近敌人。
- Enemy 自动追踪 Player 并攻击。
- Player 击败 Enemy 后掉落 ExpOrb，Player 吸取后获得经验并升级。
- Map 限制移动范围，提供障碍和生成点。
- GameManager 负责整体调度、生成敌人、检测胜负等。 