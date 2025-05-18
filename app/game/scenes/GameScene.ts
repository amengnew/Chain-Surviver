import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ExpOrb } from '../entities/ExpOrb';
import { Bullet } from '../entities/Bullet';
import { Skill } from '../entities/Skill';
import { FireballSkill, HealingAuraSkill } from '../skills/skills';
import { PlayerAccount } from '../entities/PlayerAccount';

class GameScene extends Phaser.Scene {
  player!: Player;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  enemies!: Phaser.Physics.Arcade.Group;
  expOrbs!: Phaser.Physics.Arcade.Group;
  bullets!: Phaser.Physics.Arcade.Group;
  enemySpawnTimer: number = 0;
  playerHpText!: Phaser.GameObjects.Text;
  playerExpBar!: Phaser.GameObjects.Graphics;
  playerLevelText!: Phaser.GameObjects.Text;
  skillBarSyncTimer: number = 0;
  wave: number = 1;
  maxWave: number = 3;
  waveTime: number = 30; // 每波30秒
  waveTimer: number = 0;
  waveEnemyCount: number[] = [5, 10, 18];
  waveEnemyHp: number[] = [30, 60, 120];
  waveEnemySpawned: number = 0;
  waveEnemyTotal: number = 0;
  waveEnemyAlive: number = 0;
  waveUiText!: Phaser.GameObjects.Text;
  isGameClear: boolean = false;

  constructor() {
    super('GameScene');
  }

  preload() {
    // 统一加载 public/assets 下的图片素材
    this.load.image('player', '/assets/player.png');
    this.load.image('enemy', '/assets/enemy.png');
    this.load.image('exp1', '/assets/exp1.png');
    this.load.image('exp5', '/assets/exp5.png');
    this.load.image('exp10', '/assets/exp10.png');
    this.load.image('bullet', '/assets/bullet.png');
    this.load.image('fireball', '/assets/fireball.png');
  }

  create() {
    // 创建主角
    const account = new PlayerAccount('demo', 'Demo', '');
    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2, account);
    this.cursors = this.input.keyboard!.createCursorKeys();
    // 支持 WASD
    (this.input.keyboard! as Phaser.Input.Keyboard.KeyboardPlugin).addKeys('W,A,S,D');
    // 生命值UI
    this.playerHpText = this.add.text(20, 20, '', { font: '20px Arial', color: '#fff', backgroundColor: '#000a', padding: { left: 8, right: 8, top: 4, bottom: 4 } });
    // 经验条和等级UI
    this.playerExpBar = this.add.graphics();
    this.playerLevelText = this.add.text(20, 50, '', { font: '18px Arial', color: '#fff', backgroundColor: '#000a', padding: { left: 8, right: 8, top: 2, bottom: 2 } });

    // 创建敌人组
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    // 创建经验球组
    this.expOrbs = this.physics.add.group({ classType: ExpOrb, runChildUpdate: true });
    // 创建子弹组
    this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // 敌人之间的物理碰撞，防止重叠
    this.physics.add.collider(this.enemies, this.enemies);

    // 玩家与敌人碰撞检测（用箭头函数，避免类型报错）
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (playerObj, enemyObj) => {
        const player = playerObj as Player;
        const enemy = enemyObj as Enemy;
        if (enemy.isAlive && player.isAlive) {
          // 敌人攻击主角，只扣血不直接死亡
          player.takeDamage(enemy.attackPower, { x: enemy.x, y: enemy.y });
          // 敌人被击退一点
          const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
          enemy.setVelocity(-Math.cos(angle) * 100, -Math.sin(angle) * 100);
        }
      }
    );

    // 玩家与经验球碰撞检测
    this.physics.add.overlap(
      this.player,
      this.expOrbs,
      (playerObj, orbObj) => {
        const player = playerObj as Player;
        const orb = orbObj as ExpOrb;
        orb.collect(player);
      }
    );

    // 子弹与敌人碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bulletObj, enemyObj) => {
        const bullet = bulletObj as Bullet;
        const enemy = enemyObj as Enemy;
        if (enemy.isAlive) {
          enemy.takeDamage(bullet.damage);
          // 敌人被击中反馈
          enemy.setTint(0xff0000);
          this.time.delayedCall(100, () => enemy.clearTint(), [], this);
          // 简单爆炸特效（sprite 放大淡出）
          const explosion = this.add.sprite(enemy.x, enemy.y, 'bullet');
          explosion.setScale(2);
          explosion.setAlpha(0.7);
          this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 3,
            duration: 200,
            onComplete: () => explosion.destroy()
          });
        }
        bullet.destroy();
      }
    );

    // 监听技能释放事件
    window.addEventListener('use-skill', (e: any) => {
      const skillId = e.detail.skillId;
      const skill = this.player.skills.find(s => s.id === skillId);
      if (skill) {
        skill.use(this.player, this.enemies.getChildren() as any, this.time.now);
      }
    });

    // 给玩家添加初始技能（示例）
    this.player.skills.push(FireballSkill(account));
    this.player.skills.push(HealingAuraSkill(account));

    // 更新生命值UI
    this.playerHpText.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
    // 更新经验条和等级UI
    const expRatio = Math.min(1, this.player.exp / 50);
    this.playerExpBar.clear();
    this.playerExpBar.fillStyle(0x222222, 0.7);
    this.playerExpBar.fillRect(20, 80, 200, 16);
    this.playerExpBar.fillStyle(0x00cfff, 1);
    this.playerExpBar.fillRect(20, 80, 200 * expRatio, 16);
    this.playerExpBar.lineStyle(2, 0xffffff, 1);
    this.playerExpBar.strokeRect(20, 80, 200, 16);
    this.playerLevelText.setText(`等级: ${this.player.level}`);

    // 右上角波次与倒计时UI
    this.waveUiText = this.add.text(this.scale.width - 220, 20, '', { font: '20px Arial', color: '#fff', backgroundColor: '#000a', padding: { left: 8, right: 8, top: 4, bottom: 4 } }).setScrollFactor(0).setDepth(100);
    this.startWave(1);
  }

  startWave(wave: number) {
    this.wave = wave;
    this.waveTimer = this.waveTime;
    this.waveEnemySpawned = 0;
    this.waveEnemyTotal = this.waveEnemyCount[wave - 1];
    this.waveEnemyAlive = 0;
    // 清空场上敌人
    this.enemies.clear(true, true);
    // 立即生成全部敌人
    for (let i = 0; i < this.waveEnemyTotal; i++) {
      this.spawnEnemy(this.waveEnemyHp[wave - 1]);
    }
    this.waveEnemyAlive = this.waveEnemyTotal;
  }

  update(time: number, delta: number) {
    if (this.isGameClear) return;
    if (!this.player.isAlive) {
      // 角色死亡时派发事件
      window.dispatchEvent(new CustomEvent('game-over', { detail: { type: 'dead' } }));
      return;
    }
    // 技能自动释放
    this.player.skills.forEach(skill => {
      if (time - skill.lastUsed >= skill.cooldown) {
        skill.use(this.player, this.enemies.getChildren() as any, this.time.now);
      }
    });
    const cursors = this.cursors;
    const keys = (this.input.keyboard! as Phaser.Input.Keyboard.KeyboardPlugin).addKeys('W,A,S,D') as any;
    let dir = { x: 0, y: 0 };
    if (cursors.left.isDown || keys.A.isDown) dir.x = -1;
    if (cursors.right.isDown || keys.D.isDown) dir.x = 1;
    if (cursors.up.isDown || keys.W.isDown) dir.y = -1;
    if (cursors.down.isDown || keys.S.isDown) dir.y = 1;
    if (dir.x !== 0 || dir.y !== 0) {
      const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
      dir.x /= len; dir.y /= len;
      this.player.move(dir);
    } else {
      this.player.stop();
    }

    // 主角自动攻击最近的敌人
    this.player.tryAutoAttack(this.enemies, time, this.bullets, this);

    // 敌人自动追踪主角
    this.enemies.children.iterate((enemyObj: Phaser.GameObjects.GameObject | undefined) => {
      const enemy = enemyObj as Enemy;
      if (enemy && enemy.active) {
        if (enemy.isAlive) {
          enemy.moveToward(new Phaser.Math.Vector2(this.player.x, this.player.y));
        }
      }
      return true;
    });

    // 经验球靠近主角自动吸附
    this.expOrbs.children.iterate((orbObj: Phaser.GameObjects.GameObject | undefined) => {
      const orb = orbObj as ExpOrb;
      if (orb && !orb.isCollected) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
        if (dist < this.player.expMagnetRange) {
          orb.moveToward(new Phaser.Math.Vector2(this.player.x, this.player.y));
        } else {
          orb.setVelocity(0, 0); // 不吸引时静止
        }
      }
      return true;
    });

    // 定时生成敌人
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer > 1500) { // 每1.5秒生成一个敌人
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 技能栏数据同步（每 100ms）
    this.skillBarSyncTimer = (this.skillBarSyncTimer || 0) + delta;
    if (this.skillBarSyncTimer > 100) {
      window.dispatchEvent(new CustomEvent('update-skillbar', {
        detail: {
          now: this.time.now,
          skills: this.player.skills.map(s => ({
            id: s.id,
            name: s.name,
            cooldown: s.cooldown,
            lastUsed: s.lastUsed
          }))
        }
      }));
      this.skillBarSyncTimer = 0;
    }

    // 波次倒计时
    this.waveTimer -= delta / 1000;
    if (this.waveTimer < 0) this.waveTimer = 0;
    // 右上角UI
    if (this.wave <= this.maxWave) {
      this.waveUiText.setText(`第${this.wave}波 / ${this.maxWave}波\n本波剩余: ${Math.ceil(this.waveTimer)}s`);
    }
    // 检查波次结束
    if (this.waveTimer <= 0 && this.wave < this.maxWave) {
      this.showWaveEndTip();
      this.startWave(this.wave + 1);
    } else if (this.waveTimer <= 0 && this.wave === this.maxWave && !this.isGameClear) {
      this.isGameClear = true;
      this.waveUiText.setText('恭喜通关！');
      this.showGameClearTip();
      // 通关时派发事件
      window.dispatchEvent(new CustomEvent('game-over', { detail: { type: 'clear' } }));
    }

    // 更新生命值UI
    this.playerHpText.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
    // 更新经验条和等级UI
    const expRatio = Math.min(1, this.player.exp / 50);
    this.playerExpBar.clear();
    this.playerExpBar.fillStyle(0x222222, 0.7);
    this.playerExpBar.fillRect(20, 80, 200, 16);
    this.playerExpBar.fillStyle(0x00cfff, 1);
    this.playerExpBar.fillRect(20, 80, 200 * expRatio, 16);
    this.playerExpBar.lineStyle(2, 0xffffff, 1);
    this.playerExpBar.strokeRect(20, 80, 200, 16);
    this.playerLevelText.setText(`等级: ${this.player.level}`);
  }

  spawnEnemy(hpOverride?: number) {
    // 随机在四周生成
    const margin = 40;
    const side = Phaser.Math.Between(0, 3);
    let x = 0, y = 0;
    if (side === 0) { // 上
      x = Phaser.Math.Between(margin, this.scale.width - margin);
      y = margin;
    } else if (side === 1) { // 下
      x = Phaser.Math.Between(margin, this.scale.width - margin);
      y = this.scale.height - margin;
    } else if (side === 2) { // 左
      x = margin;
      y = Phaser.Math.Between(margin, this.scale.height - margin);
    } else { // 右
      x = this.scale.width - margin;
      y = Phaser.Math.Between(margin, this.scale.height - margin);
    }
    const enemy = new Enemy(this, x, y);
    if (hpOverride) {
      enemy.maxHp = hpOverride;
      enemy.hp = hpOverride;
    }
    // 怪物伤害随波次提升
    enemy.attackPower = 10 * this.wave;
    this.enemies.add(enemy);
  }

  spawnExpOrb(x: number, y: number) {
    // 1/5/10 经验球概率分布
    const rand = Phaser.Math.Between(1, 100);
    let value = 1;
    if (rand > 90) value = 10;
    else if (rand > 60) value = 5;
    // 创建经验球
    const orb = new ExpOrb(this, x, y, value);
    this.expOrbs.add(orb);
  }

  showLevelUpAnimation(x: number, y: number) {
    const text = this.add.text(x, y - 60, 'LEVEL UP!', {
      font: '32px Arial',
      color: '#ffe066',
      stroke: '#000',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1.2,
      y: y - 100,
      duration: 400,
      ease: 'back.out',
      yoyo: false,
      onComplete: () => {
        this.tweens.add({
          targets: text,
          alpha: 0,
          scale: 1.5,
          duration: 400,
          delay: 300,
          onComplete: () => text.destroy()
        });
      }
    });
  }

  showWaveEndTip() {
    // 每波通关奖励5金币
    if (this.player && this.player.account) {
      this.player.account.tokenBalance += 5;
      // 可选：同步到链上
      if (typeof this.player.account.syncToChain === 'function') {
        this.player.account.syncToChain();
      }
    }
    const text = this.add.text(this.scale.width / 2, 120, `第${this.wave}波结束，奖励5金币！`, {
      font: '28px Arial', color: '#fff', backgroundColor: '#000a', padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 1200,
      delay: 1200,
      onComplete: () => text.destroy()
    });
  }

  showGameClearTip() {
    // 通关奖励5金币
    if (this.player && this.player.account) {
      this.player.account.tokenBalance += 5;
      if (typeof this.player.account.syncToChain === 'function') {
        this.player.account.syncToChain();
      }
    }
    const text = this.add.text(this.scale.width / 2, this.scale.height / 2, '恭喜通关！', {
      font: '40px Arial', color: '#ffe066', backgroundColor: '#000a', padding: { left: 24, right: 24, top: 12, bottom: 12 }
    }).setOrigin(0.5).setDepth(300);
    this.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      onComplete: () => text.setScale(1)
    });
  }
}

export default GameScene; 