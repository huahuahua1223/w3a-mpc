import { useState } from "react";
import { OTPVerificationProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * OTP 验证组件
 * 用于输入和验证 OTP 验证码
 */
export const OTPVerification: React.FC<OTPVerificationProps> = ({
  mode,
  target,
  onVerify,
  onBack,
  loading,
}) => {
  const [otp, setOtp] = useState("");

  return (
    <div className="otp-container">
      <h2>验证 {mode === "email" ? "邮箱" : "手机号"}</h2>
      <p className="subtitle">
        验证码已发送到: <strong>{target}</strong>
      </p>

      <div className="otp-input-container">
        <input
          type="text"
          className="input"
          placeholder="输入 6 位验证码"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          autoFocus
        />
      </div>

      <div className="button-group">
        <LoadingButton onClick={() => onVerify(otp)} loading={loading}>
          验证并登录
        </LoadingButton>
        <button className="card secondary" onClick={onBack} disabled={loading}>
          返回
        </button>
      </div>
    </div>
  );
};

