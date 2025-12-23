import { TransactionPanelProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * 交易面板组件
 * 提供签名消息和发送交易功能
 */
export const TransactionPanel: React.FC<TransactionPanelProps> = ({
  onSignMessage,
  onSendTransaction,
}) => {
  return (
    <div className="section">
      <h2>💳 交易操作</h2>
      <div className="grid">
        <LoadingButton onClick={onSignMessage}>签名消息</LoadingButton>
        <LoadingButton onClick={onSendTransaction}>发送交易</LoadingButton>
      </div>
    </div>
  );
};

