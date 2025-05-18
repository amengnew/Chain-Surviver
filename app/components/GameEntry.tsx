import React, { useState } from 'react';

export default function GameEntry({
  userData,
  onLogin,
  onStart,
}: {
  userData: any;
  onLogin: () => void;
  onStart: () => void;
}) {
  const [showAlert, setShowAlert] = useState(false);

  const handleStart = () => {
    if (!userData) {
      setShowAlert(true);
    } else {
      onStart();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl">
        {/* 封面图片 */}
        <div className="flex items-center justify-center w-full md:w-1/2 bg-black">
          <img
            src="/assets/cover.png"
            alt="Game Cover"
            className="max-w-full max-h-[400px] object-contain"
          />
        </div>
        {/* 右侧内容区 */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gradient-to-b from-gray-100 to-gray-300">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Chain Survivor</h1>
          {!userData ? (
            <>
              <button
                className="mb-6 text-xl px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
                onClick={onLogin}
              >
                登录
              </button>
              <button
                className="text-2xl px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
                onClick={handleStart}
              >
                开始游戏
              </button>
              {showAlert && (
                <div className="mt-6 text-red-600 font-bold">请先登录！</div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6 w-full flex flex-col gap-2 text-lg text-gray-700">
                <div>角色：{userData.name}</div>
                <div>金币：{userData.coins}</div>
                <div>等级：{userData.level}</div>
                <div>最大生命：{userData.maxHp}</div>
                <div>攻击力：{userData.attackPower}</div>
              </div>
              <button
                className="text-2xl px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200"
                onClick={handleStart}
              >
                开始游戏
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 