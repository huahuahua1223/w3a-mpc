/**
 * 备份文件格式定义
 */

import type { EncryptedPayload } from "./cryptoBox";

/**
 * Web3Auth MPC 备份文件格式 v1
 */
export type W3aMpcBackupV1 = {
  v: 1;
  app: "w3a-mpc";
  createdAt: string;

  // 元信息（可选）
  label?: string;
  shareType: "RECOVERY" | "DEVICE" | "SERVER";
  shareDescription?: string;

  // 加密后的助记词
  encrypted: EncryptedPayload;
};

/**
 * 生成备份文件名
 * @returns 带时间戳的文件名
 */
export function makeFileName(): string {
  const ts = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
  return `w3a-mpc-backup-${ts}.json`;
}

