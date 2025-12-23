import { IProvider } from "@web3auth/base";
import ViemRPC from "../rpc/viemRPC";
import { uiConsole } from "../utils/console";

/**
 * 区块链操作 Hook
 */
export const useBlockchain = (evmProvider: IProvider | null) => {
  const getChainId = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      const rpc = new ViemRPC(evmProvider);
      const chainId = await rpc.getChainId();
      uiConsole("Chain ID:", chainId);
    } catch (error) {
      uiConsole("获取 Chain ID 失败:", error);
    }
  };

  const getAccounts = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      const rpc = new ViemRPC(evmProvider);
      const accounts = await rpc.getAccounts();
      uiConsole("账户地址:", accounts);
    } catch (error) {
      uiConsole("获取账户失败:", error);
    }
  };

  const getBalance = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      const rpc = new ViemRPC(evmProvider);
      const balance = await rpc.getBalance();
      uiConsole("余额:", balance, "ETH");
    } catch (error) {
      uiConsole("获取余额失败:", error);
    }
  };

  const signMessage = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      uiConsole("正在签名...");
      const rpc = new ViemRPC(evmProvider);
      const signedMessage = await rpc.signMessage();
      uiConsole("签名结果:", signedMessage);
    } catch (error) {
      uiConsole("签名失败:", error);
    }
  };

  const sendTransaction = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      uiConsole("正在发送交易...");
      const rpc = new ViemRPC(evmProvider);
      const receipt = await rpc.sendTransaction();
      uiConsole("交易成功:", receipt);
    } catch (error) {
      uiConsole("发送交易失败:", error);
    }
  };

  const readContract = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      const rpc = new ViemRPC(evmProvider);
      const message = await rpc.readContract();
      uiConsole("合约读取结果:", message);
    } catch (error) {
      uiConsole("读取合约失败:", error);
    }
  };

  const writeContract = async () => {
    if (!evmProvider) {
      uiConsole("Provider 未初始化");
      return;
    }
    try {
      uiConsole("正在写入合约...");
      const rpc = new ViemRPC(evmProvider);
      const receipt = await rpc.writeContract();
      uiConsole("合约写入成功:", receipt);

      // 2秒后读取合约以查看更新
      setTimeout(async () => {
        await readContract();
      }, 2000);
    } catch (error) {
      uiConsole("写入合约失败:", error);
    }
  };

  return {
    getChainId,
    getAccounts,
    getBalance,
    signMessage,
    sendTransaction,
    readContract,
    writeContract,
  };
};

