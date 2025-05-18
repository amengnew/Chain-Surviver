import { Skill } from '../entities/Skill';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { PlayerAccount } from '../entities/PlayerAccount';

// 火球术
export const FireballSkill = (owner: PlayerAccount) =>
  new Skill(
    'skill_fireball',
    '火球术',
    1,
    5000,
    (player: Player, enemies: Enemy[]) => {
      let minDist = Number.MAX_VALUE;
      let target: Enemy | null = null;
      enemies.forEach(e => {
        if (e.isAlive) {
          const dist = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
          if (dist < minDist) {
            minDist = dist;
            target = e;
          }
        }
      });
      if (target) {
        // 发射 fireball.png 子弹
        const fireball = player.scene.physics.add.sprite(player.x, player.y, 'fireball');
        fireball.setScale(0.02); // 根据图片实际大小调整
        fireball.setDepth(10);
        const speed = 250;
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        fireball.setVelocity((dx / len) * speed, (dy / len) * speed);
        fireball.setRotation(Math.atan2(dy, dx));
        // 手动检测碰撞
        const checkCollision = () => {
          if (!fireball.active || !target.isAlive) return;
          const dist = Phaser.Math.Distance.Between(fireball.x, fireball.y, target.x, target.y);
          if (dist < 32) { // 32像素内算命中
            target.takeDamage(50);
            fireball.destroy();
            for (let i = 1; i <= 3; i++) {
              player.scene.time.delayedCall(i * 1000, () => {
                if (target && target.isAlive) target.takeDamage(10);
              });
            }
            player.scene.events.off('update', checkCollision);
            player.scene.events.off('update', outOfBoundsHandler);
          }
        };
        player.scene.events.on('update', checkCollision);
        // 超出屏幕自动销毁 fireball
        const outOfBoundsHandler = () => {
          if (!fireball.active) return;
          if (
            fireball.x < -32 || fireball.x > player.scene.scale.width + 32 ||
            fireball.y < -32 || fireball.y > player.scene.scale.height + 32
          ) {
            fireball.destroy();
            player.scene.events.off('update', checkCollision);
            player.scene.events.off('update', outOfBoundsHandler);
          }
        };
        player.scene.events.on('update', outOfBoundsHandler);
      }
      // 旧实现：直接对最近敌人造成伤害
      // if (target) {
      //   target.takeDamage(50);
      //   for (let i = 1; i <= 3; i++) {
      //     player.scene.time.delayedCall(i * 1000, () => {
      //       if (target && target.isAlive) target.takeDamage(10);
      //     });
      //   }
      // }
    },
    true,
    owner
  );

// 治疗光环
export const HealingAuraSkill = (owner: PlayerAccount) =>
  new Skill(
    'skill_healing_aura',
    '治疗光环',
    1,
    20000,
    (player: Player) => {
      if (player.hp / player.maxHp > 0.5) return false;
      player.setBlendMode(Phaser.BlendModes.ADD); // 高亮
      for (let i = 1; i <= 5; i++) {
        player.scene.time.delayedCall(i * 1000, () => {
          if (player.isAlive) player.hp = Math.min(player.maxHp, player.hp + 10);
        });
      }
      player.scene.time.delayedCall(5000, () => {
        player.setBlendMode(Phaser.BlendModes.NORMAL); // 恢复
      });
    },
    false,
    owner
  );

// 闪电链
export const ChainLightningSkill = (owner: PlayerAccount) =>
  new Skill(
    'skill_chain_lightning',
    '闪电链',
    1,
    8000,
    (player: Player, enemies: Enemy[]) => {
      const sorted = enemies
        .filter(e => e.isAlive)
        .sort((a, b) => Phaser.Math.Distance.Between(player.x, player.y, a.x, a.y) - Phaser.Math.Distance.Between(player.x, player.y, b.x, b.y))
        .slice(0, 3);
      let damage = 40;
      sorted.forEach(e => {
        e.takeDamage(damage);
        damage = Math.max(0, damage - 10);
      });
    },
    true,
    owner
  );

// 冰霜护盾
export const FrostShieldSkill = (owner: PlayerAccount) =>
  new Skill(
    'skill_frost_shield',
    '冰霜护盾',
    1,
    15000,
    (player: Player, enemies: Enemy[]) => {
      let shield = 60;
      const origTakeDamage = player.takeDamage.bind(player);
      player.takeDamage = (amount: number) => {
        if (shield > 0) {
          const absorb = Math.min(shield, amount);
          shield -= absorb;
          amount -= absorb;
        }
        if (amount > 0) origTakeDamage(amount);
      };
      player.scene.time.delayedCall(10000, () => {
        player.takeDamage = origTakeDamage;
      });
      enemies.forEach(e => {
        if (Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) < 120) {
          e.speed *= 0.7;
          player.scene.time.delayedCall(10000, () => (e.speed /= 0.7));
        }
      });
    },
    false,
    owner
  );

// 召唤傀儡
export const SummonGolemSkill = (owner: PlayerAccount) =>
  new Skill(
    'skill_summon_golem',
    '召唤傀儡',
    1,
    30000,
    (player: Player) => {
      // 伪代码：实际需实现 Golem 类
      const golem = player.scene.add.sprite(player.x + 40, player.y, 'golem');
      (golem as any).hp = 200;
      (golem as any).attack = 30;
      player.scene.time.delayedCall(20000, () => golem.destroy());
    },
    true,
    owner
  );

// 爆裂箭
export const ExplosiveArrowSkill = (owner: PlayerAccount) =>
  new Skill(
    'skill_explosive_arrow',
    '爆裂箭',
    1,
    7000,
    (player: Player, enemies: Enemy[]) => {
      (player as any).nextAttackIsExplosive = true;
      (player as any).explosiveArrowEffect = (target: Enemy) => {
        target.takeDamage(40);
        enemies.forEach(e => {
          if (e !== target && Phaser.Math.Distance.Between(target.x, target.y, e.x, e.y) < 80) {
            e.takeDamage(20);
          }
        });
      };
    },
    true,
    owner
  ); 