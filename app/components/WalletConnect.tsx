"use client";
import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && address) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  return (
    <div>
      {isConnected && address ? (
        <div>
          已连接: {address.slice(0, 8)}...{address.slice(-6)}
          <button onClick={() => disconnect()} className="ml-2 px-2 py-1 bg-gray-300 rounded">断开</button>
        </div>
      ) : (
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          连接钱包
        </button>
      )}
    </div>
  );
} 