import { useState, useEffect } from "react";
import { Web3AuthMPCCoreKit, WEB3AUTH_NETWORK, COREKIT_STATUS, makeEthereumSigner } from "@web3auth/mpc-core-kit";
import { EthereumSigningProvider } from "@web3auth/ethereum-mpc-provider";
import { tssLib } from "@toruslabs/tss-dkls-lib";
import { web3AuthClientId, chainConfig } from "../config/chainConfig";

/**
 * Web3Auth 初始化和状态管理 Hook
 */
export const useWeb3Auth = () => {
  const [coreKitInstance] = useState(() => {
    if (typeof window === "undefined") return null;
    return new Web3AuthMPCCoreKit({
      web3AuthClientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET,
      storage: window.localStorage,
      manualSync: true,
      tssLib,
    });
  });

  const [evmProvider] = useState(() => {
    if (!coreKitInstance) return null;
    const provider = new EthereumSigningProvider({ config: { chainConfig } });
    provider.setupProvider(makeEthereumSigner(coreKitInstance));
    return provider;
  });

  const [status, setStatus] = useState<COREKIT_STATUS>(COREKIT_STATUS.NOT_INITIALIZED);

  useEffect(() => {
    const init = async () => {
      if (coreKitInstance && coreKitInstance.status === COREKIT_STATUS.NOT_INITIALIZED) {
        await coreKitInstance.init();
        setStatus(coreKitInstance.status);
      }
    };
    init();
  }, [coreKitInstance]);

  // 添加状态同步机制：定期检查 coreKitInstance 的状态
  useEffect(() => {
    if (!coreKitInstance) return;

    // 设置定时器定期检查状态变化
    const intervalId = setInterval(() => {
      const currentStatus = coreKitInstance.status;
      setStatus((prevStatus) => {
        if (currentStatus !== prevStatus) {
          console.log("状态变化:", prevStatus, "->", currentStatus);
          return currentStatus;
        }
        return prevStatus;
      });
    }, 300);

    return () => clearInterval(intervalId);
  }, [coreKitInstance]);

  const getUserInfo = () => {
    if (!coreKitInstance) return null;
    return coreKitInstance.getUserInfo();
  };

  const logout = async () => {
    if (!coreKitInstance) return;
    await coreKitInstance.logout();
    setStatus(coreKitInstance.status);
  };

  return {
    coreKitInstance,
    evmProvider,
    status,
    setStatus,
    getUserInfo,
    logout,
  };
};

