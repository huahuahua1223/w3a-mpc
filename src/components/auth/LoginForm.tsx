import { useState } from "react";
import { LoginFormProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * 登录表单组件
 * 支持邮箱和手机号 OTP 登录
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSendEmailOTP,
  onSendPhoneOTP,
  loading,
}) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="grid">
      <div className="input-group">
        <label className="label">邮箱登录</label>
        <input
          type="email"
          className="input"
          placeholder="输入邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <LoadingButton
          onClick={() => onSendEmailOTP(email)}
          loading={loading}
          className="card"
        >
          发送邮箱验证码
        </LoadingButton>
      </div>

      <div className="input-group">
        <label className="label">手机号登录</label>
        <input
          type="tel"
          className="input"
          placeholder="输入手机号（如 +8613800138000）"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <LoadingButton
          onClick={() => onSendPhoneOTP(phone)}
          loading={loading}
          className="card"
        >
          发送短信验证码
        </LoadingButton>
      </div>
    </div>
  );
};

