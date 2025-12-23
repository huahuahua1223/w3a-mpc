import { useState } from "react";
import {
  Web3AuthMPCCoreKit,
  COREKIT_STATUS,
  TssShareType,
  generateFactorKey,
  keyToMnemonic,
  mnemonicToKey,
  FactorKeyTypeShareDescription,
} from "@web3auth/mpc-core-kit";
import { BN } from "bn.js";
import { Point, secp256k1 } from "@tkey/common-types";
import { uiConsole } from "../utils/console";

/**
 * 因子管理 Hook
 */
export const useFactorManager = (coreKitInstance: Web3AuthMPCCoreKit | null) => {
  const [backupFactorKey, setBackupFactorKey] = useState<string>("");

  /**
   * 输入备份因子密钥
   */
  const inputBackupFactorKey = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance not found");
    }
    if (!backupFactorKey) {
      throw new Error("backupFactorKey not found");
    }

    try {
      const factorKey = new BN(backupFactorKey, "hex");
      await coreKitInstance.inputFactorKey(factorKey);

      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        uiConsole("因子密钥输入成功，已登录");
      } else if (coreKitInstance.status === COREKIT_STATUS.REQUIRED_SHARE) {
        uiConsole("仍需要更多因子");
      }
    } catch (error) {
      uiConsole("输入因子密钥失败:", error);
    }
  };

  /**
   * 启用 MFA
   */
  const enableMFA = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }

    try {
      const factorKey = await coreKitInstance.enableMFA({});
      const factorKeyMnemonic = keyToMnemonic(factorKey);

      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        await coreKitInstance.commitChanges();
      }

      uiConsole("MFA 已启用，备份密钥（助记词）:", factorKeyMnemonic);
      setBackupFactorKey(factorKey);
    } catch (error) {
      uiConsole("启用 MFA 失败:", error);
    }
  };

  /**
   * 创建助记词因子
   */
  const createMnemonicFactor = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }

    try {
      const factorKey = generateFactorKey();
      await coreKitInstance.createFactor({
        shareType: TssShareType.RECOVERY,
        factorKey: factorKey.private,
        shareDescription: FactorKeyTypeShareDescription.SeedPhrase,
      });

      const factorKeyMnemonic = await keyToMnemonic(factorKey.private.toString("hex"));

      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        await coreKitInstance.commitChanges();
      }

      uiConsole("助记词因子已创建:", factorKeyMnemonic);
    } catch (error) {
      uiConsole("创建助记词因子失败:", error);
    }
  };

  /**
   * 助记词转因子密钥
   */
  const mnemonicToFactorKeyHex = async (mnemonic: string) => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }

    try {
      const factorKey = await mnemonicToKey(mnemonic);
      setBackupFactorKey(factorKey);
      uiConsole("助记词已转换为因子密钥:", factorKey);
      return factorKey;
    } catch (error) {
      uiConsole("转换失败:", error);
    }
  };

  /**
   * 获取设备因子
   */
  const getDeviceFactor = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance not found");
    }

    try {
      const factorKey = await coreKitInstance.getDeviceFactor();
      setBackupFactorKey(factorKey as string);
      uiConsole("设备因子:", factorKey);
    } catch (error) {
      uiConsole("获取设备因子失败:", error);
    }
  };

  /**
   * 删除因子
   */
  const deleteFactor = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }

    try {
      let factorPub: string | undefined;

      // 查找要删除的因子
      for (const [key, value] of Object.entries(coreKitInstance.getKeyDetails().shareDescriptions)) {
        if (value.length > 0) {
          const parsedData = JSON.parse(value[0]);
          if (parsedData.module === FactorKeyTypeShareDescription.SocialShare) {
            factorPub = key;
          }
        }
      }

      if (factorPub) {
        uiConsole("正在删除社交因子...", "Factor Pub:", factorPub);
        const pub = Point.fromSEC1(secp256k1, factorPub);
        await coreKitInstance.deleteFactor(pub);
        await coreKitInstance.commitChanges();
        uiConsole("社交因子已删除");
      } else {
        uiConsole("未找到可删除的社交因子");
      }
    } catch (error) {
      uiConsole("删除因子失败:", error);
    }
  };

  /**
   * 获取密钥详情
   */
  const getKeyDetails = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance not found");
    }
    uiConsole(coreKitInstance.getKeyDetails());
  };

  return {
    enableMFA,
    createMnemonicFactor,
    deleteFactor,
    inputBackupFactorKey,
    getDeviceFactor,
    mnemonicToFactorKeyHex,
    getKeyDetails,
    backupFactorKey,
    setBackupFactorKey,
  };
};

