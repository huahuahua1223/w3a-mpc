import { CHAIN_NAMESPACES } from "@web3auth/base";

// 链配置 - Ethereum Sepolia Testnet
export const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia testnet (11155111)
  rpcTarget: "https://ethereum-sepolia-rpc.publicnode.com",
  // 避免在生产环境使用公共 RPC，建议使用 Infura, Alchemy, Quicknode 等服务
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

// Web3Auth 配置
// 请在 Web3Auth Dashboard 获取: https://dashboard.web3auth.io/
export const web3AuthClientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "YOUR_WEB3AUTH_CLIENT_ID";

// JWT Verifier 名称（需要在 Web3Auth Dashboard 配置）
export const verifierName = import.meta.env.VITE_VERIFIER_NAME || "supabase-verifier";

/**
 * 测试网水龙头（获取测试币）：
 * - Sepolia: https://sepoliafaucet.com/
 * - Sepolia (Alchemy): https://sepoliafaucet.com/
 * - Sepolia (Infura): https://www.infura.io/faucet/sepolia
 */

