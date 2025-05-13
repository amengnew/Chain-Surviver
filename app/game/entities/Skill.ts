import { Player } from './Player';
import { Enemy } from './Enemy';
import { PlayerAccount } from './PlayerAccount';

export class Skill {
  id: string;
  name: string;
  level: number;
  cooldown: number;
  effect: (player: Player, enemies: Enemy[], skill?: Skill) => boolean | void;
  tradable: boolean;
  owner: PlayerAccount;
  lastUsed: number = 0;

  constructor(
    id: string,
    name: string,
    level: number,
    cooldown: number,
    effect: (player: Player, enemies: Enemy[], skill?: Skill) => boolean | void,
    tradable: boolean,
    owner: PlayerAccount
  ) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.cooldown = cooldown;
    this.effect = effect;
    this.tradable = tradable;
    this.owner = owner;
  }

  use(player: Player, enemies: Enemy[], time: number) {
    if (time - this.lastUsed < this.cooldown) return false;
    const result = this.effect(player, enemies, this);
    if (result === false) return false;
    this.lastUsed = time;
    return true;
  }

  levelUp() {
    this.level++;
    // 可扩展：提升技能效果、减少冷却等
  }

  transfer(to: PlayerAccount) {
    if (!this.tradable) return false;
    this.owner = to;
    return true;
  }
} 