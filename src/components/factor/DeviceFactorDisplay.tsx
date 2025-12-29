/**
 * 设备因子显示组件
 */
export interface DeviceFactorDisplayProps {
  factorKey: string;
  onClose: () => void;
}

export const DeviceFactorDisplay: React.FC<DeviceFactorDisplayProps> = ({ 
  factorKey, 
  onClose 
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(factorKey);
    alert("✅ 设备因子已复制到剪贴板");
  };

  return (
    <div className="backup-list-overlay" onClick={onClose}>
      <div className="backup-list-modal device-factor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="backup-list-header">
          <h3>🔑 设备因子</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="backup-list-content">
          <div className="device-factor-info">
            <div className="info-section">
              <h4>📱 什么是设备因子？</h4>
              <p>
                设备因子是存储在当前浏览器本地的密钥片段，用于恢复您的钱包账户。
                它是 MPC 钱包安全机制的重要组成部分。
              </p>
            </div>

            <div className="info-section">
              <h4>🔐 因子密钥</h4>
              <div className="factor-key-box">
                <code className="factor-key-text">{factorKey}</code>
                <button className="copy-btn" onClick={copyToClipboard}>
                  📋 复制
                </button>
              </div>
            </div>

            <div className="info-section warning">
              <h4>⚠️ 重要提示</h4>
              <ul>
                <li>请妥善保管此设备因子，不要泄露给他人</li>
                <li>如果更换浏览器或清除浏览器数据，需要使用此因子恢复账户</li>
                <li>建议将此因子安全备份到密码管理器或其他安全位置</li>
                <li>结合助记词因子可以在任何设备上恢复账户</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="backup-list-footer">
          <p className="hint">💡 提示：此因子仅存储在当前浏览器中，请务必备份</p>
        </div>
      </div>
    </div>
  );
};

