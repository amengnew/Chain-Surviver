import * as Phaser from 'phaser';
import { Bullet } from './Bullet';
import { Skill } from './Skill';
import { PlayerAccount } from './PlayerAccount';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  exp: number;
  level: number;
  maxLevel: number = 30;
  attackCooldown: number;
  attackRange: number;
  attackPower: number;
  isAlive: boolean;
  speed: number;
  lastAttackTime: number;
  direction: { x: number; y: number };
  invincibleUntil: number = 0;
  expMagnetRange: number;
  skills: Skill[];
  account?: PlayerAccount;

  constructor(scene: Phaser.Scene, x: number, y: number, account?: PlayerAccount) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.maxHp = 100;
    this.hp = this.maxHp;
    this.exp = 0;
    this.level = 1;
    this.maxLevel = 30;
    this.attackCooldown = 600; // 毫秒
    this.attackRange = 220;
    this.attackPower = 10;
    this.isAlive = true;
    this.speed = 200;
    this.lastAttackTime = 0;
    this.direction = { x: 1, y: 0 };
    this.expMagnetRange = 80; // 经验球吸引范围
    this.skills = [];
    this.account = account;
  }

  move(direction: { x: number; y: number }) {
    if (!this.isAlive) return;
    this.setVelocity(direction.x * this.speed, direction.y * this.speed);
    if (direction.x !== 0 || direction.y !== 0) {
      this.direction = { ...direction };
    }
  }

  stop(): this {
    this.setVelocity(0, 0);
    return this;
  }

  attack(targetEnemy?: Phaser.GameObjects.Sprite, bullets?: Phaser.Physics.Arcade.Group, scene?: Phaser.Scene) {
    if (!this.isAlive || !bullets || !scene || !targetEnemy) return;
    // 发射子弹，目标为最近敌人
    const bullet = new Bullet(scene, this.x, this.y, targetEnemy as any, this.attackPower);
    bullets.add(bullet);
  }

  tryAutoAttack(enemies: Phaser.GameObjects.Group, time: number, bullets?: Phaser.Physics.Arcade.Group, scene?: Phaser.Scene) {
    if (!this.isAlive) return;
    if (time - this.lastAttackTime < this.attackCooldown) return;
    // 找到最近的敌人
    let minDist = Number.MAX_VALUE;
    let nearest: Phaser.GameObjects.Sprite | null = null;
    enemies.children.iterate((enemyObj: Phaser.GameObjects.GameObject | undefined) => {
      const enemy = enemyObj as Phaser.GameObjects.Sprite & { isAlive?: boolean };
      if (enemy && enemy.isAlive) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
        if (dist < minDist && dist <= this.attackRange) {
          minDist = dist;
          nearest = enemy;
        }
      }
      return true;
    });
    if (nearest) {
      this.attack(nearest, bullets, scene);
      this.lastAttackTime = time;
    }
  }

  takeDamage(amount: number, attackerPos?: { x: number; y: number }) {
    const now = this.scene.time.now;
    if (now < this.invincibleUntil || !this.isAlive) return;
    this.hp -= amount;
    this.invincibleUntil = now + 800; // 0.8秒无敌
    if (this.hp <= 0) {
      this.hp = 0;
      this.isAlive = false;
      this.setTint(0xff0000);
      this.setVelocity(0, 0);
    } else {
      this.setTint(0xffaaaa);
      this.scene.time.delayedCall(200, () => this.clearTint(), [], this);
      // 受击击退效果
      if (attackerPos) {
        const dx = this.x - attackerPos.x;
        const dy = this.y - attackerPos.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const knockback = 180; // 击退速度
        this.setVelocity((dx / len) * knockback, (dy / len) * knockback);
        this.scene.time.delayedCall(120, () => this.setVelocity(0, 0), [], this);
      }
    }
  }

  gainExp(amount: number) {
    if (this.level >= this.maxLevel) return;
    this.exp += amount;
    while (this.exp >= 50 && this.level < this.maxLevel) {
      this.exp -= 50;
      this.level++;
      this.levelUp();
    }
  }

  levelUp() {
    this.maxHp += 20;
    this.hp = this.maxHp;
    this.attackPower += 5;
    this.speed += 10;
    // 升级动画
    if (this.scene && typeof (this.scene as any).showLevelUpAnimation === 'function') {
      (this.scene as any).showLevelUpAnimation(this.x, this.y);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    // 可扩展：自动攻击、回血等
  }
} 