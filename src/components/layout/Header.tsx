import { HeaderProps } from "../../types";

/**
 * 页面头部组件
 */
export const Header: React.FC<HeaderProps> = ({ onLogout, showLogout = false }) => {
  return (
    <div className="header-container">
      <h1>
        <a target="_blank" href="https://web3auth.io/docs/sdk/core-kit/mpc-core-kit" rel="noreferrer">
          Web3Auth MPC CoreKit
        </a>{" "}
        <span className="subtitle">使用 Supabase OTP + Viem</span>
      </h1>

      {showLogout && onLogout && (
        <button className="card logout-btn" onClick={onLogout}>
          退出登录
        </button>
      )}
    </div>
  );
};

