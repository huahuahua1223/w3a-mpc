/**
 * Google Drive REST API 封装模块
 * 使用 Drive v3 API 操作 appDataFolder
 */

/**
 * Drive 备份文件信息
 */
export type DriveBackupFile = {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
};

const DRIVE_V3 = "https://www.googleapis.com/drive/v3";

/**
 * 生成授权请求头
 */
function authHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * 列出 appDataFolder 中的备份文件
 * @param accessToken - Google OAuth access token
 * @param namePrefix - 文件名前缀，用于过滤
 * @returns 备份文件列表
 */
export async function listAppDataBackups(
  accessToken: string,
  namePrefix = "w3a-mpc-backup-"
): Promise<DriveBackupFile[]> {
  const q = encodeURIComponent(`name contains '${namePrefix}' and trashed = false`);
  const fields = encodeURIComponent("files(id,name,createdTime,modifiedTime,size)");
  const url = `${DRIVE_V3}/files?spaces=appDataFolder&q=${q}&fields=${fields}`;
  
  const res = await fetch(url, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error(`列出文件失败: ${res.status} ${await res.text()}`);
  
  const data = await res.json();
  return (data.files ?? []) as DriveBackupFile[];
}

/**
 * 下载文件内容
 * @param accessToken - Google OAuth access token
 * @param fileId - 文件 ID
 * @returns 文件内容（文本）
 */
export async function downloadFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const url = `${DRIVE_V3}/files/${fileId}?alt=media`;
  const res = await fetch(url, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error(`下载文件失败: ${res.status} ${await res.text()}`);
  return await res.text();
}

/**
 * 在 appDataFolder 中创建文件
 * @param accessToken - Google OAuth access token
 * @param fileName - 文件名
 * @param content - 文件内容
 * @returns 创建的文件信息
 */
export async function createAppDataFile(
  accessToken: string,
  fileName: string,
  content: string
): Promise<{ id: string; name: string }> {
  // 使用 crypto.randomUUID() 生成更安全的 boundary
  const boundary = "w3aMpcBoundary_" + crypto.randomUUID();
  
  const metadata = {
    name: fileName,
    mimeType: "application/json",
    parents: ["appDataFolder"],
  };

  const delimiter = `--${boundary}\r\n`;
  const close = `--${boundary}--`;

  // 使用 Blob 构建 multipart body，避免字符串拼接问题
  const body = new Blob(
    [
      delimiter,
      `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n`,
      delimiter,
      `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
      content,
      `\r\n`,
      close,
      `\r\n`,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  // ✅ 关键修复：必须使用 /upload/drive/v3/files 端点进行 multipart 上传
  const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`创建文件失败: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; name: string };
}

