"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import GameEntry from './components/GameEntry';
import WalletConnect from './components/WalletConnect';
import { getPlayerData, setPlayerData } from './blockchain/viem';
// import GameMain from './components/GameMain'; // 你可以根据实际情况实现GameMain

const PhaserGame = dynamic(() => import('./components/PhaserGame'), { ssr: false });

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [inGame, setInGame] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [playerData, setPlayerDataState] = useState<any>(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  // 点击登录按钮时弹出钱包连接
  const handleLoginClick = () => {
    setShowWalletConnect(true);
  };

  // 钱包连接成功
  const handleConnect = async (addr: string, isDefault: boolean = false) => {
    setAddress(addr);
    setShowWalletConnect(false);
    if (isDefault) {
      // 默认账号，直接用本地 mock 数据
      const data: [number, number, number, number] = [100, 1, 100, 10];
      setPlayerDataState(data);
      setUserData({
        name: '默认账号',
        coins: data[0],
        level: data[1],
        maxHp: data[2],
        attackPower: data[3]
      });
    } else {
      // 链上账号，调用合约
      try {
        const data = await getPlayerData(addr as `0x${string}`) as [number, number, number, number];
        setPlayerDataState(data);
        setUserData({
          name: '链上玩家',
          coins: data?.[0] ?? 0,
          level: data?.[1] ?? 1,
          maxHp: data?.[2] ?? 100,
          attackPower: data?.[3] ?? 10
        });
      } catch (e) {
        // 如果合约调用失败，自动切换为默认账号
        alert('链上数据获取失败，已切换为默认账号');
        const data: [number, number, number, number] = [100, 1, 100, 10];
        setPlayerDataState(data);
        setUserData({
          name: '默认账号',
          coins: data[0],
          level: data[1],
          maxHp: data[2],
          attackPower: data[3]
        });
      }
    }
  };

  // 点击"开始游戏"进入主游戏
  const handleStart = () => setInGame(true);

  // 结束游戏，回到封面
  const handleExit = () => {
    setUserData(null);
    setInGame(false);
    setAddress(null);
    setPlayerDataState(null);
  };

  // 游戏结束时调用
  const handleGameOver = async (coins: number, level: number, maxHp: number, attackPower: number) => {
    if (!address) return;
    await setPlayerData("",coins, level, maxHp, attackPower);
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={handleLoginClick} className="px-6 py-3 bg-blue-600 text-white rounded text-xl font-bold shadow-lg">
          登录
        </button>
        {showWalletConnect && <WalletConnect onConnect={handleConnect} />}
      </div>
    );
  }

  if (!inGame) {
    return (
      <div>
        <div className="mb-4">已连接: {address.slice(0, 8)}...{address.slice(-6)}</div>
        <GameEntry
          userData={userData}
          onLogin={() => {}}
          onStart={handleStart}
        />
      </div>
    );
  }

  // 进入本地写好的游戏
  return <PhaserGame coins={userData?.coins ?? 0} onExit={handleExit} />;
}
