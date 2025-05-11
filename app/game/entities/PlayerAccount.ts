import { Skill } from './Skill';

export class PlayerAccount {
  id: string;
  nickname: string;
  avatar: string;
  tokenBalance: number;
  skills: Skill[];
  lastLogin: number;
  gameRecords: any[];

  constructor(id: string, nickname: string, avatar: string) {
    this.id = id;
    this.nickname = nickname;
    this.avatar = avatar;
    this.tokenBalance = 0;
    this.skills = [];
    this.lastLogin = Date.now();
    this.gameRecords = [];
  }

  login() {
    this.lastLogin = Date.now();
  }

  logout() {}

  saveSkill(skill: Skill) {
    this.skills.push(skill);
  }

  tradeSkill(skillId: string, to: PlayerAccount) {
    const idx = this.skills.findIndex(s => s.id === skillId);
    if (idx !== -1) {
      const skill = this.skills[idx];
      if (skill.transfer(to)) {
        this.skills.splice(idx, 1);
        to.saveSkill(skill);
        return true;
      }
    }
    return false;
  }

  syncToChain() {
    // TODO: 链上同步逻辑
  }
} 