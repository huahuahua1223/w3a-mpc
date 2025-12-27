import { FactorManagementProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * 因子管理组件
 * 提供 MFA、助记词、删除因子等功能
 */
export const FactorManagement: React.FC<FactorManagementProps> = ({
  onEnableMFA,
  onCreateMnemonic,
  onDeleteFactor,
  onGetKeyDetails,
  onGetUserInfo,
}) => {
  return (
    <div className="section">
      <h2>🔐 因子管理</h2>
      <div className="grid">
        <LoadingButton onClick={onEnableMFA}>启用 MFA</LoadingButton>
        <LoadingButton onClick={onCreateMnemonic}>创建助记词因子</LoadingButton>
        <LoadingButton onClick={onDeleteFactor}>删除助记词因子</LoadingButton>
        <LoadingButton onClick={onGetKeyDetails}>查看密钥详情</LoadingButton>
        <LoadingButton onClick={onGetUserInfo}>获取用户信息</LoadingButton>
      </div>
    </div>
  );
};

