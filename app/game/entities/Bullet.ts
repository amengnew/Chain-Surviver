import * as Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  speed: number;
  damage: number;
  target: Enemy | null;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.speed = 400;
    this.damage = damage;
    this.target = target;
    this.setActive(true);
    this.setVisible(true);
    this.setCircle(10);
    this.setScale(1.5);
    this.updateVelocity();
  }

  updateVelocity() {
    if (this.target && this.target.active) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
        this.setRotation(Math.atan2(dy, dx));
      }
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.target || !this.target.active) {
      this.destroy();
      return;
    }
    this.updateVelocity();
    // 超出屏幕自动销毁
    if (
      this.x < -32 || this.x > this.scene.scale.width + 32 ||
      this.y < -32 || this.y > this.scene.scale.height + 32
    ) {
      this.destroy();
    }
  }
} 