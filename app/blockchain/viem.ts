import { createPublicClient, getContract, http, defineChain, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ABI, BYTECODE } from '../blockchain/ChaiSurvivor';
import { config } from '../blockchain/config';

let CONTRACT_ADDRESS: `0x${string}` | null = null;
const RPC_URL = config.rpcUrl;



export const localChain = (url: string) => defineChain({
  id: 1111,  // Westend chain ID
  name: 'Westend',
  network: 'Westend',
  nativeCurrency: {
      name: 'WND',
      symbol: 'WND', 
      decimals: 12,  // Polkadot uses 12 decimals
  },
  rpcUrls: {
      default: {
          http: [url],
      },
  },
  // testnet: true,
})

export const publicClient = createPublicClient({
  chain: localChain(RPC_URL),
  transport: http(),
});

// 部署合约并返回合约地址
export async function deployContractIfNeeded() {
  const wallet = privateKeyToAccount(config.privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account: wallet,
    transport: http(RPC_URL),
    chain: localChain(RPC_URL),
  });
  // 部署合约
  const txHash = await walletClient.deployContract({
    abi: ABI,
    bytecode: BYTECODE as `0x${string}`,
    account: wallet,
    chain: localChain(RPC_URL),
  });
  // 等待部署完成
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  CONTRACT_ADDRESS = receipt.contractAddress as `0x${string}`;
  return CONTRACT_ADDRESS;
}

export async function getPlayerData(address: `0x${string}`) {
  const contractAddress = await deployContractIfNeeded();
  const contract = getContract({
    address: contractAddress,
    abi: ABI,
    client: publicClient,
  });
  return await contract.read.getPlayerData([address]);
}

export async function setPlayerData(signer: any, coins: number, level: number, maxHp: number, attackPower: number) {
  const contractAddress = await deployContractIfNeeded();
  const walletClient = createWalletClient({
    account: signer.account,
    transport: http(RPC_URL),
    chain: localChain(RPC_URL),
  });
  const contract = getContract({
    address: contractAddress,
    abi: ABI,
    client: walletClient,
  });
  return await contract.write.setPlayerData([coins, level, maxHp, attackPower]);
} 