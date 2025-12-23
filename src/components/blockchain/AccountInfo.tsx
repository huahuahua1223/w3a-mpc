import { AccountInfoProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * 账户信息组件
 * 显示链 ID、账户地址和余额
 */
export const AccountInfo: React.FC<AccountInfoProps> = ({
  onGetChainId,
  onGetAccounts,
  onGetBalance,
}) => {
  return (
    <div className="section">
      <h2>📊 账户信息</h2>
      <div className="grid">
        <LoadingButton onClick={onGetChainId}>获取 Chain ID</LoadingButton>
        <LoadingButton onClick={onGetAccounts}>获取账户地址</LoadingButton>
        <LoadingButton onClick={onGetBalance}>获取余额</LoadingButton>
      </div>
    </div>
  );
};

