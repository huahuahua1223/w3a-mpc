/**
 * Google Identity Services Token 获取模块
 * 用于获取 Google Drive API 的 access token
 */

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * 获取 Google Drive access token
 * @param opts - 配置选项
 * @returns access token
 */
export async function getDriveAccessToken(opts: {
  clientId: string;
  scope: string; // e.g. https://www.googleapis.com/auth/drive.appdata
  prompt?: "" | "consent" | "select_account";
}): Promise<string> {
  if (!window.google?.accounts?.oauth2?.initTokenClient) {
    throw new Error("Google Identity Services 未加载：请确认 index.html 已引入 gsi/client");
  }

  return await new Promise<string>((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: opts.clientId,
      scope: opts.scope,
      prompt: opts.prompt ?? "consent",
      callback: (resp: any) => {
        if (resp?.error) reject(new Error(resp.error));
        else resolve(resp.access_token);
      },
    });

    client.requestAccessToken();
  });
}

