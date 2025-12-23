import { useState } from "react";
import { COREKIT_STATUS } from "@web3auth/mpc-core-kit";

import "./App.css";

// Hooks
import { useWeb3Auth } from "./hooks/useWeb3Auth";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import { useFactorManager } from "./hooks/useFactorManager";
import { useBlockchain } from "./hooks/useBlockchain";

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

  // 本地状态
  const [mnemonicFactor, setMnemonicFactor] = useState<string>("");

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
              onCreateMnemonic={createMnemonicFactor}
              onDeleteFactor={deleteFactor}
              onGetKeyDetails={getKeyDetails}
              onGetUserInfo={handleGetUserInfo}
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
            onGetDeviceFactor={getDeviceFactor}
            onConvertMnemonic={handleConvertMnemonic}
            onInputBackupKey={inputBackupFactorKey}
            backupFactorKey={backupFactorKey}
            mnemonicFactor={mnemonicFactor}
            setMnemonicFactor={setMnemonicFactor}
            disabled={false}
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
