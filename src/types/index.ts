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
  onRestoreFromDrive?: () => Promise<void>;
  backupFactorKey: string;
  mnemonicFactor: string;
  setMnemonicFactor: (value: string) => void;
  disabled: boolean;
  isRestoring?: boolean;
}

// ==================== 因子管理组件类型 ====================

export interface FactorManagementProps {
  onEnableMFA: () => Promise<void>;
  onCreateMnemonic: () => Promise<void>;
  onDeleteFactor: () => Promise<void>;
  onGetKeyDetails: () => Promise<void>;
  onGetUserInfo: () => Promise<void>;
  onBackupToDrive?: () => Promise<void>;
  onListBackupFiles?: () => Promise<void>;
  onGetDeviceFactor?: () => Promise<void>;
  hasRecoveryFactor?: boolean;
  isBackingUp?: boolean;
  isListingBackups?: boolean;
  isGettingDeviceFactor?: boolean;
}

// ==================== Drive 备份相关类型 ====================

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export interface BackupFileListProps {
  files: DriveBackupFile[];
  onClose: () => void;
}

export interface DeviceFactorDisplayProps {
  factorKey: string | null;
  onClose: () => void;
}

export interface KeyDetails {
  requiredFactors: number;
  threshold: number;
  totalFactors: number;
  shareDescriptions: Record<string, string[]>;
  metadataPubKey: any; // Point type from Web3Auth
  tssPubKey?: any; // Point type from Web3Auth (optional)
  keyType: string;
}

export interface KeyDetailsDisplayProps {
  keyDetails: KeyDetails;
  onClose: () => void;
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

