/**
 * Google Drive 备份与恢复 Hook
 * 提供助记词的加密备份和解密恢复功能
 */

import { useState } from "react";
import { getDriveAccessToken } from "../drive/gisToken";
import { encryptText, decryptText } from "../drive/cryptoBox";
import { createAppDataFile, listAppDataBackups, downloadFileContent } from "../drive/driveApi";
import { makeFileName, type W3aMpcBackupV1 } from "../drive/backupFormat";
import { uiConsole } from "../utils/console";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";

/**
 * Google Drive 备份与恢复 Hook
 */
export const useDriveBackup = () => {
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  /**
   * 连接 Google Drive（获取 OAuth token）
   */
  const connectDrive = async (): Promise<string> => {
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string;
    if (!clientId) {
      throw new Error("缺少 VITE_GOOGLE_OAUTH_CLIENT_ID 环境变量");
    }

    setIsConnecting(true);
    try {
      uiConsole("正在连接 Google Drive...");
      const token = await getDriveAccessToken({
        clientId,
        scope: DRIVE_SCOPE,
        prompt: "consent",
      });
      setDriveToken(token);
      uiConsole("✅ Google Drive 连接成功");
      return token;
    } catch (error: any) {
      uiConsole("❌ Google Drive 连接失败:", error.message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * 备份助记词到 Google Drive
   * @param opts - 备份选项
   */
  const backupRecoveryToDrive = async (opts: {
    recoveryMnemonic: string;
    label?: string;
  }): Promise<void> => {
    setIsBackingUp(true);
    try {
      // 1. 获取 token
      const token = driveToken ?? (await connectDrive());

      // 2. 提示用户设置加密口令
      const pass = window.prompt(
        "请设置一个用于加密备份的口令（至少 8 个字符）：\n\n" +
        "⚠️ 务必记住此口令，恢复时需要使用！"
      );
      
      if (!pass) {
        uiConsole("已取消备份");
        return;
      }

      if (pass.length < 8) {
        throw new Error("口令长度至少需要 8 个字符");
      }

      uiConsole("正在加密助记词...");
      
      // 3. 加密助记词
      const encrypted = await encryptText(pass, opts.recoveryMnemonic);

      // 4. 构建备份文件
      const blob: W3aMpcBackupV1 = {
        v: 1,
        app: "w3a-mpc",
        createdAt: new Date().toISOString(),
        label: opts.label,
        shareType: "RECOVERY",
        shareDescription: "seedPhrase",
        encrypted,
      };

      uiConsole("正在上传到 Google Drive...");

      // 5. 上传到 Drive
      await createAppDataFile(token, makeFileName(), JSON.stringify(blob));

      uiConsole("✅ 备份成功！助记词已加密并上传到 Google Drive (appDataFolder)");
      alert("✅ 备份成功！\n\n助记词已加密并安全保存到 Google Drive。");
    } catch (error: any) {
      uiConsole("❌ 备份失败:", error.message);
      alert(`❌ 备份失败：${error.message}`);
      throw error;
    } finally {
      setIsBackingUp(false);
    }
  };

  /**
   * 从 Google Drive 恢复助记词
   * @returns 解密后的助记词
   */
  const restoreRecoveryFromDrive = async (): Promise<string | null> => {
    setIsRestoring(true);
    try {
      // 1. 获取 token
      const token = driveToken ?? (await connectDrive());

      uiConsole("正在列出备份文件...");

      // 2. 列出备份文件
      const files = await listAppDataBackups(token);
      
      if (!files.length) {
        throw new Error("Google Drive (appDataFolder) 中没有找到备份文件");
      }

      uiConsole(`找到 ${files.length} 个备份文件`);

      // 3. 按创建时间排序，最新的在前
      const sortedFiles = [...files].sort((a, b) => 
        (b.createdTime ?? "").localeCompare(a.createdTime ?? "")
      );

      // 4. 让用户选择文件
      let selectedFile = sortedFiles[0];
      
      if (sortedFiles.length > 1) {
        const fileList = sortedFiles
          .map((f, i) => {
            const date = f.createdTime 
              ? new Date(f.createdTime).toLocaleString("zh-CN")
              : "未知时间";
            return `${i + 1}. ${f.name} (${date})`;
          })
          .join("\n");

        const choice = window.prompt(
          `找到 ${sortedFiles.length} 个备份文件，请选择要恢复的文件：\n\n${fileList}\n\n请输入序号 (1-${sortedFiles.length})，直接回车使用最新的备份：`
        );

        if (choice === null) {
          uiConsole("已取消恢复");
          return null;
        }

        if (choice.trim()) {
          const index = parseInt(choice.trim()) - 1;
          if (index >= 0 && index < sortedFiles.length) {
            selectedFile = sortedFiles[index];
          }
        }
      }

      uiConsole(`正在下载备份文件: ${selectedFile.name}`);

      // 5. 下载文件内容
      const content = await downloadFileContent(token, selectedFile.id);
      const blob = JSON.parse(content) as W3aMpcBackupV1;

      // 6. 验证文件格式
      if (blob.v !== 1 || blob.app !== "w3a-mpc") {
        throw new Error("不是有效的 w3a-mpc 备份文件");
      }

      // 7. 提示用户输入解密口令
      const pass = window.prompt(
        "请输入当时设置的加密口令：\n\n" +
        `备份时间：${new Date(blob.createdAt).toLocaleString("zh-CN")}`
      );

      if (!pass) {
        uiConsole("已取消恢复");
        return null;
      }

      uiConsole("正在解密助记词...");

      // 8. 解密助记词
      try {
        const mnemonic = await decryptText(pass, blob.encrypted);
        uiConsole("✅ 助记词解密成功");
        return mnemonic;
      } catch (error) {
        throw new Error("解密失败：口令错误或文件已损坏");
      }
    } catch (error: any) {
      uiConsole("❌ 恢复失败:", error.message);
      alert(`❌ 恢复失败：${error.message}`);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  };

  /**
   * 列出 Google Drive 中的备份文件
   * @returns 备份文件列表
   */
  const listBackupFiles = async () => {
    try {
      // 获取 token
      const token = driveToken ?? (await connectDrive());
      
      uiConsole("正在列出备份文件...");
      
      // 列出备份文件
      const files = await listAppDataBackups(token);
      
      uiConsole(`找到 ${files.length} 个备份文件`);
      
      return files;
    } catch (error: any) {
      uiConsole("❌ 列出备份文件失败:", error.message);
      throw error;
    }
  };

  return {
    connectDrive,
    backupRecoveryToDrive,
    restoreRecoveryFromDrive,
    listBackupFiles,
    driveToken,
    isConnecting,
    isBackingUp,
    isRestoring,
  };
};

