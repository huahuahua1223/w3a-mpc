import { useState } from "react";
import { Web3AuthMPCCoreKit, COREKIT_STATUS } from "@web3auth/mpc-core-kit";
import { supabase } from "../config/supabase";
import { verifierName } from "../config/chainConfig";
import { uiConsole } from "../utils/console";

/**
 * Supabase OTP 登录逻辑 Hook
 */
export const useSupabaseAuth = (
  coreKitInstance: Web3AuthMPCCoreKit | null,
  setStatus: (status: COREKIT_STATUS) => void
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<"email" | "phone" | null>(null);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  /**
   * 发送邮箱验证码
   */
  const sendEmailOTP = async (emailAddress: string) => {
    if (!emailAddress) {
      uiConsole("请输入邮箱地址");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
      });

      if (error) throw error;

      setEmail(emailAddress);
      setOtpSent(true);
      setLoginMode("email");
      uiConsole("验证码已发送到邮箱:", emailAddress);
    } catch (error: any) {
      uiConsole("发送验证码失败:", error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发送手机验证码
   */
  const sendPhoneOTP = async (phoneNumber: string) => {
    if (!phoneNumber) {
      uiConsole("请输入手机号码（需包含国家代码，如 +86）");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setPhone(phoneNumber);
      setOtpSent(true);
      setLoginMode("phone");
      uiConsole("验证码已发送到手机:", phoneNumber);
    } catch (error: any) {
      uiConsole("发送验证码失败:", error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 验证 OTP 并登录 Web3Auth
   */
  const verifyOTP = async (otp: string) => {
    if (!otp) {
      uiConsole("请输入验证码");
      return;
    }
    if (!coreKitInstance) {
      uiConsole("Web3Auth 未初始化");
      return;
    }

    setLoading(true);
    try {
      // 验证 OTP
      const verifyParams =
        loginMode === "email"
          ? { email, token: otp, type: "email" as const }
          : { phone, token: otp, type: "sms" as const };

      const { data, error } = await supabase.auth.verifyOtp(verifyParams);

      if (error) throw error;
      if (!data.session) throw new Error("验证成功但未获取到 session");

      // 提取 JWT token
      const idToken = data.session.access_token;
      const verifierId = data.user?.id || "";

      uiConsole("OTP 验证成功，正在登录 Web3Auth...");

      // 使用 JWT 登录 Web3Auth
      await coreKitInstance.loginWithJWT({
        verifier: verifierName,
        verifierId,
        idToken,
      });

      if (coreKitInstance.status === COREKIT_STATUS.LOGGED_IN) {
        await coreKitInstance.commitChanges();
      }

      // 检查是否需要更多因子
      if (coreKitInstance.status === COREKIT_STATUS.REQUIRED_SHARE) {
        uiConsole("需要更多因子，请输入备份密钥或设备密钥");
      } else {
        uiConsole("登录成功！");
      }

      // 更新状态
      const newStatus = coreKitInstance.status;
      uiConsole("更新状态为:", newStatus);
      setStatus(newStatus);

      // 重置表单
      setOtpSent(false);
      setEmail("");
      setPhone("");
      setLoginMode(null);
    } catch (error: any) {
      uiConsole("登录失败:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setLoginMode(null);
  };

  return {
    sendEmailOTP,
    sendPhoneOTP,
    verifyOTP,
    resetOTP,
    loading,
    otpSent,
    loginMode,
    email,
    phone,
  };
};

