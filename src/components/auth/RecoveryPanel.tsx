import { RecoveryPanelProps } from "../../types";
import { LoadingButton } from "../common/LoadingButton";

/**
 * 账户恢复面板组件
 * 当需要更多因子时显示
 */
export const RecoveryPanel: React.FC<RecoveryPanelProps> = ({
  onGetDeviceFactor,
  onConvertMnemonic,
  onInputBackupKey,
  backupFactorKey,
  mnemonicFactor,
  setMnemonicFactor,
  disabled,
}) => {
  return (
    <div className="recovery-container">
      <h2>⚠ 需要恢复账户</h2>
      <p className="subtitle">请使用以下任一方式恢复您的账户</p>

      <div className="recovery-options">
        {/* 设备因子 */}
        <div className="input-group">
          <label className="label">方式 1: 使用设备因子</label>
          <LoadingButton onClick={onGetDeviceFactor} disabled={disabled}>
            从设备获取因子
          </LoadingButton>
        </div>

        {/* 助记词恢复 */}
        <div className="input-group">
          <label className="label">方式 2: 使用助记词恢复</label>
          <input
            type="text"
            className="input"
            placeholder="输入助记词"
            value={mnemonicFactor}
            onChange={(e) => setMnemonicFactor(e.target.value)}
            disabled={disabled}
          />
          <LoadingButton
            onClick={() => onConvertMnemonic(mnemonicFactor)}
            disabled={disabled || !mnemonicFactor}
          >
            从助记词恢复
          </LoadingButton>
        </div>

        {/* 备份密钥 */}
        {backupFactorKey && (
          <div className="input-group">
            <label className="label">方式 3: 使用备份密钥</label>
            <p className="subtitle">密钥已从助记词生成</p>
            <LoadingButton onClick={onInputBackupKey} disabled={disabled}>
              输入备份密钥
            </LoadingButton>
          </div>
        )}
      </div>
    </div>
  );
};

