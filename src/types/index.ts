// 组件 Props 类型定义

import { COREKIT_STATUS } from "@web3auth/mpc-core-kit";

// ==================== 认证组件类型 ====================

export interface LoginFormProps {
  onSendEmailOTP: (email: string) => Promise<void>;
  onSendPhoneOTP: (phone: string) => Promise<void>;
  loading: boolean;
}

export interface OTPVerificationProps {
  mode: 'email' | 'phone';
  target: string; // email 或 phone
  onVerify: (otp: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export interface RecoveryPanelProps {
  onGetDeviceFactor: () => Promise<void>;
  onConvertMnemonic: (mnemonic: string) => Promise<void>;
  onInputBackupKey: () => Promise<void>;
  backupFactorKey: string;
  mnemonicFactor: string;
  setMnemonicFactor: (value: string) => void;
  disabled: boolean;
}

// ==================== 因子管理组件类型 ====================

export interface FactorManagementProps {
  onEnableMFA: () => Promise<void>;
  onCreateMnemonic: () => Promise<void>;
  onDeleteFactor: () => Promise<void>;
  onGetKeyDetails: () => Promise<void>;
  onGetUserInfo: () => Promise<void>;
}

// ==================== 区块链组件类型 ====================

export interface AccountInfoProps {
  onGetChainId: () => Promise<void>;
  onGetAccounts: () => Promise<void>;
  onGetBalance: () => Promise<void>;
}

export interface TransactionPanelProps {
  onSignMessage: () => Promise<void>;
  onSendTransaction: () => Promise<void>;
}

export interface ContractPanelProps {
  onReadContract: () => Promise<void>;
  onWriteContract: () => Promise<void>;
}

// ==================== 通用组件类型 ====================

export interface StatusBadgeProps {
  status: COREKIT_STATUS;
}

export interface LoadingButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface HeaderProps {
  onLogout?: () => Promise<void>;
  showLogout?: boolean;
}

