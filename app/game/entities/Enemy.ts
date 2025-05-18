import * as Phaser from 'phaser';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  speed: number;
  attackPower: number;
  expValue: number;
  isAlive: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setScale(0.6);

    this.maxHp = 30;
    this.hp = this.maxHp;
    this.speed = 100;
    this.attackPower = 10;
    this.expValue = 5;
    this.isAlive = true;
  }

  moveToward(target: Phaser.Math.Vector2) {
    if (!this.isAlive) return;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      this.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
    } else {
      this.setVelocity(0, 0);
    }
  }

  attack(player: Player) {
    if (!this.isAlive) return;
    player.takeDamage(this.attackPower);
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.setTint(0xff0000);

    // 死亡时掉落经验球 (Move this before disabling body)
    // Ensure scene and spawnExpOrb method exist
    if (this.scene && typeof (this.scene as any).spawnExpOrb === 'function') {
      (this.scene as any).spawnExpOrb(this.x, this.y);
    }

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      // Disable body and destroy sprite visually/physically (Call after dropping orb)
      this.disableBody(true, true);
    } else {
      // Fallback if body is already gone
      this.setActive(false);
      this.setVisible(false);
      this.destroy(); // Explicitly destroy if body is already missing
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    // 可扩展：AI、动画等
  }
} 