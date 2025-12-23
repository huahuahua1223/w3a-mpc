import { createClient } from "@supabase/supabase-js";

// Supabase 配置
// 请在 Supabase Dashboard 获取这些值: https://app.supabase.com/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Auth 配置说明：
 * 
 * 1. Email OTP 配置：
 *    - 在 Supabase Dashboard -> Authentication -> Email Templates
 *    - 修改 "Confirm signup" 模板
 *    - 将 {{ .ConfirmationURL }} 改为 {{ .Token }}
 *    - 这样用户会收到验证码而不是链接
 * 
 * 2. SMS OTP 配置：
 *    - 在 Supabase Dashboard -> Authentication -> Providers -> Phone
 *    - 配置 SMS 提供商（推荐 Twilio）
 *    - 启用 Phone provider
 * 
 * 3. JWT 配置：
 *    - 在 Web3Auth Dashboard 创建 JWT Verifier
 *    - Verifier Type: JWT
 *    - JWKS Endpoint: https://{your-project-ref}.supabase.co/.well-known/jwks.json
 *    - JWT Field: sub (user id) 或 email/phone
 */

