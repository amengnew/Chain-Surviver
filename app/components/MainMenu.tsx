"use client";
import React from 'react';

type MainMenuProps = {
  onStart: () => void;
  onOptions: () => void;
  onExit: () => void;
};

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onOptions, onExit }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
      <h1 className="text-4xl font-bold text-white mb-12 drop-shadow-lg">Chain Survivor</h1>
      <div className="flex flex-col gap-6 w-64">
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded text-xl font-semibold shadow" onClick={onStart}>
          开始游戏
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded text-xl font-semibold shadow" onClick={onOptions}>
          选项
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white py-3 rounded text-xl font-semibold shadow" onClick={onExit}>
          退出游戏
        </button>
      </div>
    </div>
  );
};

export default MainMenu; 