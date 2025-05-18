import { createWalletClient, custom } from 'viem';

export async function connectWallet() {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('请先安装 MetaMask 或其他以太坊钱包');
  }
  const client = createWalletClient({
    transport: custom((window as any).ethereum),
  });
  const [address] = await client.requestAddresses();
  return { client, address };
} 