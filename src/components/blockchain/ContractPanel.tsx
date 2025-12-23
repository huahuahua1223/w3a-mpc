import { ContractPanelProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * 合约面板组件
 * 提供智能合约交互功能
 */
export const ContractPanel: React.FC<ContractPanelProps> = ({
  onReadContract,
  onWriteContract,
}) => {
  return (
    <div className="section">
      <h2>📜 智能合约</h2>
      <div className="grid">
        <LoadingButton onClick={onReadContract}>读取合约</LoadingButton>
        <LoadingButton onClick={onWriteContract}>写入合约</LoadingButton>
      </div>
    </div>
  );
};

