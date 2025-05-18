import React, { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

// 动态导入 GameScene，后续会实现
// @ts-ignore
import GameScene from '../game/scenes/GameScene';

const skillIconMap: Record<string, string> = {
  skill_fireball: '/assets/fireball_icon.png',
  skill_healing_aura: '/assets/healing_aura.png',
  skill_chain_lightning: '/assets/chain_lightning.png',
  skill_frost_shield: '/assets/frost_shield.png',
  skill_summon_golem: '/assets/summon_golem.png',
  skill_explosive_arrow: '/assets/explosive_arrow.png',
};

const SkillBar: React.FC<{
  skills: { name: string; cooldown: number; lastUsed: number; id: string }[];
  now: number;
}> = ({ skills, now }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
      {skills.map((skill, idx) => {
        const cd = Math.max(0, skill.cooldown - (now - skill.lastUsed));
        const icon = skillIconMap[skill.id] || '/assets/placeholder.png';
        const ratio = skill.cooldown > 0 ? Math.max(0, Math.min(1, cd / skill.cooldown)) : 0;
        const filter = `grayscale(${ratio}) brightness(${0.7 + 0.3 * (1 - ratio)})`;
        return (
          <div
            key={skill.id}
            className={`w-12 h-12 bg-gray-800/80 border-2 border-blue-400 rounded flex flex-col items-center justify-center shadow-lg relative`}
          >
            <img
              src={icon}
              alt={skill.name}
              className="w-8 h-8 mb-0.5"
              style={{ width: 32, height: 32, filter, transition: 'filter 0.3s' }}
            />
            {cd > 0 && (
              <span className="absolute bottom-1 right-1 text-white font-bold text-base drop-shadow">{(cd / 1000).toFixed(1)}s</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PhaserGame: React.FC<{ coins: number; onExit?: () => void }> = ({ coins, onExit }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  // 技能栏状态
  const [skills, setSkills] = useState<any[]>([]);
  const [now, setNow] = useState(0);
  const [gameOver, setGameOver] = useState<null | 'dead' | 'clear'>(null);

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      phaserGameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: gameRef.current,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        backgroundColor: '#222',
      });
    }
    // 监听技能栏数据同步事件
    const updateSkillBar = (e: any) => {
      setNow(e.detail.now);
      setSkills(e.detail.skills);
    };
    window.addEventListener('update-skillbar', updateSkillBar);
    // 监听游戏结束事件
    const handleGameOver = (e: any) => {
      setGameOver(e.detail.type);
    };
    window.addEventListener('game-over', handleGameOver);
    return () => {
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
      window.removeEventListener('update-skillbar', updateSkillBar);
      window.removeEventListener('game-over', handleGameOver);
    };
  }, []);

  return (
    <>
      {/* 金币UI */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg shadow text-yellow-400 font-bold text-xl">
        金币：{coins}
      </div>
      <div ref={gameRef} style={{ width: '100vw', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 10 }} />
      <SkillBar skills={skills} now={now} />
      {gameOver && (
        <div
          className="fixed left-1/2 top-1/2 z-50"
          style={{
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-10 flex flex-col items-center animate-scale-fade-in">
            <div
              className="text-5xl font-extrabold mb-6"
              style={{
                color: gameOver === 'dead' ? '#e11d48' : '#16a34a',
                textShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              {gameOver === 'dead' ? 'DEAD' : '恭喜通关！'}
            </div>
            <button
              className="mt-4 px-10 py-4 text-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
              onClick={() => {
                setGameOver(null);
                if (onExit) onExit();
              }}
            >
              结束游戏
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhaserGame; 