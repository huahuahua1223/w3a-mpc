import { useState, useEffect } from "react";
import { COREKIT_STATUS } from "@web3auth/mpc-core-kit";

import "./App.css";

// Hooks
import { useWeb3Auth } from "./hooks/useWeb3Auth";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import { useFactorManager } from "./hooks/useFactorManager";
import { useBlockchain } from "./hooks/useBlockchain";
import { useDriveBackup } from "./hooks/useDriveBackup";

// Components
import { Header } from "./components/layout/Header";
import { StatusBadge } from "./components/common/StatusBadge";
import { ConsolePanel } from "./components/common/ConsolePanel";
import { LoginForm } from "./components/auth/LoginForm";
import { OTPVerification } from "./components/auth/OTPVerification";
import { RecoveryPanel } from "./components/auth/RecoveryPanel";
import { FactorManagement } from "./components/factor/FactorManagement";
import { AccountInfo } from "./components/blockchain/AccountInfo";
import { TransactionPanel } from "./components/blockchain/TransactionPanel";
import { ContractPanel } from "./components/blockchain/ContractPanel";
import { BackupFileList } from "./components/drive/BackupFileList";
import { DeviceFactorDisplay } from "./components/factor/DeviceFactorDisplay";
import { KeyDetailsDisplay } from "./components/factor/KeyDetailsDisplay";

// Types
import type { DriveBackupFile } from "./drive/driveApi";
import type { KeyDetails } from "./types";

/**
 * 主应用组件
 */
function App() {
  // 使用 Hooks 管理状态和逻辑
  const { coreKitInstance, evmProvider, status, setStatus, getUserInfo, logout } = useWeb3Auth();
  
  const {
    sendEmailOTP,
    sendPhoneOTP,
    verifyOTP,
    resetOTP,
    loading,
    otpSent,
    loginMode,
    email,
    phone,
  } = useSupabaseAuth(coreKitInstance, setStatus);

  const {
    enableMFA,
    createMnemonicFactor,
    deleteFactor,
    inputBackupFactorKey,
    getDeviceFactor,
    mnemonicToFactorKeyHex,
    getKeyDetails,
    backupFactorKey,
    lastCreatedMnemonic: mnemonicFromManager,
  } = useFactorManager(coreKitInstance);

  const {
    getChainId,
    getAccounts,
    getBalance,
    signMessage,
    sendTransaction,
    readContract,
    writeContract,
  } = useBlockchain(evmProvider);

  const {
    backupRecoveryToDrive,
    restoreRecoveryFromDrive,
    listBackupFiles,
    isBackingUp,
    isRestoring,
  } = useDriveBackup();

  // 本地状态
  const [mnemonicFactor, setMnemonicFactor] = useState<string>("");
  const [hasRecoveryFactor, setHasRecoveryFactor] = useState<boolean>(false);
  const [backupFiles, setBackupFiles] = useState<DriveBackupFile[]>([]);
  const [showBackupList, setShowBackupList] = useState<boolean>(false);
  const [deviceFactor, setDeviceFactor] = useState<string>("");
  const [showDeviceFactor, setShowDeviceFactor] = useState<boolean>(false);
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null);
  const [showKeyDetails, setShowKeyDetails] = useState<boolean>(false);

  // 检查是否已有助记词因子
  const checkHasRecoveryFactor = (): boolean => {
    if (!coreKitInstance) return false;
    try {
      const keyDetails = coreKitInstance.getKeyDetails();
      return Object.entries(keyDetails.shareDescriptions).some(([, arr]) => {
        if (!arr || arr.length === 0) return false;
        try {
          const parsed = JSON.parse(arr[0]);
          return parsed.module === "seedPhrase";
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  };

  // 初始化时检查是否已有助记词因子
  useEffect(() => {
    if (coreKitInstance && status === COREKIT_STATUS.LOGGED_IN) {
      const hasRecovery = checkHasRecoveryFactor();
      setHasRecoveryFactor(hasRecovery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coreKitInstance, status]);

  // 包装 createMnemonicFactor 以保存助记词
  const handleCreateMnemonicFactor = async () => {
    const mnemonic = await createMnemonicFactor();
    
    // 检查是否成功创建
    if (mnemonic && coreKitInstance) {
      const keyDetails = coreKitInstance.getKeyDetails();
      const hasRecovery = Object.entries(keyDetails.shareDescriptions).some(([, arr]) => {
        if (!arr || arr.length === 0) return false;
        try {
          const parsed = JSON.parse(arr[0]);
          return parsed.module === "seedPhrase";
        } catch {
          return false;
        }
      });
      setHasRecoveryFactor(hasRecovery);
      
      // 提示用户可以备份
      if (hasRecovery) {
        setTimeout(() => {
          const shouldBackup = window.confirm(
            "✅ 助记词因子创建成功！\n\n" +
            "是否要立即备份到 Google Drive？\n\n" +
            "（建议立即备份以防丢失）"
          );
          if (shouldBackup) {
            handleBackupToGoogleDrive(mnemonic);
          }
        }, 500);
      }
    }
  };

  // 备份到 Google Drive（使用提供的助记词）
  const handleBackupToGoogleDrive = async (mnemonic: string) => {
    try {
      await backupRecoveryToDrive({
        recoveryMnemonic: mnemonic,
        label: "Web3Auth MPC Recovery",
      });
    } catch (error) {
      console.error("备份失败:", error);
    }
  };

  // 智能备份到 Google Drive（自动创建或使用现有助记词）
  const handleBackupToDrive = async () => {
    try {
      // 检查是否已有助记词因子
      const hasRecovery = checkHasRecoveryFactor();
      
      if (!hasRecovery) {
        // 没有助记词因子，先创建
        const mnemonic = await createMnemonicFactor();
        
        if (mnemonic) {
          // 创建成功，更新状态
          setHasRecoveryFactor(true);
          
          // 直接备份
          await handleBackupToGoogleDrive(mnemonic);
        }
      } else {
        // 已有助记词因子，优先使用最近创建的
        let mnemonic = mnemonicFromManager;
        
        // 如果没有，让用户手动输入
        if (!mnemonic) {
          mnemonic = window.prompt(
            "请输入要备份的助记词：\n\n" +
            "（从控制台输出中复制完整的助记词）"
          ) || "";
        }
        
        if (!mnemonic) return;
        
        await handleBackupToGoogleDrive(mnemonic);
      }
    } catch (error) {
      console.error("备份操作失败:", error);
    }
  };

  // 从 Google Drive 恢复
  const handleRestoreFromDrive = async () => {
    try {
      const mnemonic = await restoreRecoveryFromDrive();
      if (mnemonic) {
        // 自动转换为 factorKey
        await mnemonicToFactorKeyHex(mnemonic);
        // 自动输入 factorKey
        await inputBackupFactorKey();
      }
    } catch (error) {
      console.error("恢复失败:", error);
    }
  };

  // 列出备份文件
  const handleListBackupFiles = async () => {
    try {
      const files = await listBackupFiles();
      setBackupFiles(files);
      setShowBackupList(true);
    } catch (error) {
      console.error("列出备份文件失败:", error);
    }
  };

  // 获取设备因子（用于因子管理页面）
  const handleGetDeviceFactor = async (): Promise<void> => {
    try {
      const factor = await getDeviceFactor();
      if (factor) {
        setDeviceFactor(factor);
        setShowDeviceFactor(true);
      }
    } catch (error) {
      console.error("获取设备因子失败:", error);
    }
  };

  // 获取设备因子（用于恢复面板）
  const handleGetDeviceFactorForRecovery = async (): Promise<void> => {
    try {
      await getDeviceFactor();
    } catch (error) {
      console.error("获取设备因子失败:", error);
    }
  };

  // 获取密钥详情并显示
  const handleGetKeyDetails = async (): Promise<void> => {
    try {
      const details = await getKeyDetails();
      if (details) {
        setKeyDetails(details);
        setShowKeyDetails(true);
      }
    } catch (error) {
      console.error("获取密钥详情失败:", error);
    }
  };

  // 恢复面板处理函数
  const handleConvertMnemonic = async (mnemonic: string) => {
    await mnemonicToFactorKeyHex(mnemonic);
  };

  const handleGetUserInfo = async () => {
    const userInfo = getUserInfo();
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(userInfo || {}, null, 2);
    }
    console.log(userInfo);
  };

  // ==================== UI 渲染 ====================

  return (
    <div className="container">
      <Header onLogout={logout} showLogout={status === COREKIT_STATUS.LOGGED_IN} />

      <StatusBadge status={status} />

      <div className="main-content">
        {/* 已登录状态 */}
        {status === COREKIT_STATUS.LOGGED_IN && (
          <>
            <FactorManagement
              onEnableMFA={enableMFA}
              onCreateMnemonic={handleCreateMnemonicFactor}
              onDeleteFactor={deleteFactor}
              onGetKeyDetails={handleGetKeyDetails}
              onGetUserInfo={handleGetUserInfo}
              onBackupToDrive={handleBackupToDrive}
              onListBackupFiles={handleListBackupFiles}
              onGetDeviceFactor={handleGetDeviceFactor}
              hasRecoveryFactor={hasRecoveryFactor}
              isBackingUp={isBackingUp}
            />

            <AccountInfo
              onGetChainId={getChainId}
              onGetAccounts={getAccounts}
              onGetBalance={getBalance}
            />

            <TransactionPanel
              onSignMessage={signMessage}
              onSendTransaction={sendTransaction}
            />

            <ContractPanel
              onReadContract={readContract}
              onWriteContract={writeContract}
            />
          </>
        )}

        {/* 需要更多因子状态 */}
        {status === COREKIT_STATUS.REQUIRED_SHARE && (
          <RecoveryPanel
            onGetDeviceFactor={handleGetDeviceFactorForRecovery}
            onConvertMnemonic={handleConvertMnemonic}
            onInputBackupKey={inputBackupFactorKey}
            onRestoreFromDrive={handleRestoreFromDrive}
            backupFactorKey={backupFactorKey}
            mnemonicFactor={mnemonicFactor}
            setMnemonicFactor={setMnemonicFactor}
            disabled={false}
            isRestoring={isRestoring}
          />
        )}

        {/* 未登录状态 */}
        {status !== COREKIT_STATUS.LOGGED_IN && status !== COREKIT_STATUS.REQUIRED_SHARE && (
          <>
            {otpSent ? (
              <OTPVerification
                mode={loginMode || "email"}
                target={loginMode === "email" ? email : phone}
                onVerify={verifyOTP}
                onBack={resetOTP}
                loading={loading}
              />
            ) : (
              <LoginForm
                onSendEmailOTP={sendEmailOTP}
                onSendPhoneOTP={sendPhoneOTP}
                loading={loading}
              />
            )}
          </>
        )}
      </div>

      <ConsolePanel />

      {/* 备份文件列表模态框 */}
      {showBackupList && (
        <BackupFileList 
          files={backupFiles} 
          onClose={() => setShowBackupList(false)} 
        />
      )}

      {/* 设备因子显示模态框 */}
      {showDeviceFactor && (
        <DeviceFactorDisplay 
          factorKey={deviceFactor} 
          onClose={() => setShowDeviceFactor(false)} 
        />
      )}

      {/* 密钥详情显示模态框 */}
      {showKeyDetails && keyDetails && (
        <KeyDetailsDisplay 
          keyDetails={keyDetails} 
          onClose={() => setShowKeyDetails(false)} 
        />
      )}

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-core-kit-examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          Web3Auth MPC Core Kit Examples
        </a>
      </footer>
    </div>
  );
}

export default App;
