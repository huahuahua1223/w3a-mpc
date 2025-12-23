import { COREKIT_STATUS } from "@web3auth/mpc-core-kit";
import { StatusBadgeProps } from "../../types";

/**
 * 状态徽章组件
 * 显示当前登录状态
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case COREKIT_STATUS.LOGGED_IN:
      return <span className="status-badge logged-in">✓ 已登录</span>;
    case COREKIT_STATUS.REQUIRED_SHARE:
      return <span className="status-badge required-share">⚠ 需要更多因子</span>;
    case COREKIT_STATUS.NOT_INITIALIZED:
      return <span className="status-badge not-initialized">⏳ 初始化中...</span>;
    default:
      return <span className="status-badge logged-out">✗ 未登录</span>;
  }
};

