import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ExpOrb } from '../entities/ExpOrb';
import { Bullet } from '../entities/Bullet';

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
  }

  create() {
    // 创建主角
    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
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
          player.takeDamage(enemy.attackPower);
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

  update(time: number, delta: number) {
    if (!this.player.isAlive) return;
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
      if (enemy) {
        if (enemy.isAlive) {
          enemy.moveToward(new Phaser.Math.Vector2(this.player.x, this.player.y));
        }
        // 敌人死亡时掉落经验球
        if (enemy.hp <= 0 && !enemy.getData('expDropped')) {
          enemy.setData('expDropped', true);
          this.spawnExpOrb(enemy.x, enemy.y);
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

  spawnEnemy() {
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
}

export default GameScene; 