import * as Phaser from 'phaser';
import { Player } from './Player';

export class ExpOrb extends Phaser.Physics.Arcade.Sprite {
  value: number;
  isCollected: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    super(scene, x, y, `exp${value}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.value = value;
    this.isCollected = false;
    this.setCircle(10 + value * 2);
  }

  moveToward(target: Phaser.Math.Vector2) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      this.setVelocity((dx / len) * 200, (dy / len) * 200);
    }
  }

  collect(player: Player) {
    if (this.isCollected) return;
    this.isCollected = true;
    player.gainExp(this.value);
    this.destroy();
  }
} 