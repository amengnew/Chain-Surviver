import React, { useState } from "react";
import { config } from "../blockchain/config";

// 声明 window.ethereum 类型
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Props {
  onConnect: (address: string, isDefault: boolean) => void;
}

const ConnectWallet: React.FC<Props> = ({ onConnect }) => {
  const [connecting, setConnecting] = useState(false);

  // 钱包连接逻辑（这里只做简单演示，实际可集成wagmi/viem等）
  const handleWalletConnect = async () => {
    setConnecting(true);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          onConnect(accounts[0], false);
        }
      } catch (err) {
        alert("钱包连接失败");
      }
    } else {
      alert("请先安装MetaMask钱包");
    }
    setConnecting(false);
  };

  // 默认账号登录
  const handleDefaultLogin = () => {
    onConnect(config.testAddress, true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={handleWalletConnect} disabled={connecting}>
        {connecting ? "连接中..." : "连接钱包"}
      </button>
      <button onClick={handleDefaultLogin}>使用默认账号</button>
    </div>
  );
};

export default ConnectWallet; 