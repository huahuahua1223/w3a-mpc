/**
 * 密钥详情显示组件
 */

interface ShareInfo {
  pub: string;
  module: string;
  dateAdded: number;
  tssShareIndex: number;
  browserName?: string;
  browserVersion?: string;
  deviceName?: string;
}

import type { KeyDetails } from "../../types";

export interface KeyDetailsDisplayProps {
  keyDetails: KeyDetails;
  onClose: () => void;
}

export const KeyDetailsDisplay: React.FC<KeyDetailsDisplayProps> = ({ 
  keyDetails, 
  onClose 
}) => {
  // 转换公钥为字符串格式
  const formatPubKey = (pubKey: any): { x: string; y: string } => {
    if (!pubKey) return { x: '', y: '' };
    return {
      x: pubKey.x?.toString('hex') || pubKey.x || '',
      y: pubKey.y?.toString('hex') || pubKey.y || ''
    };
  };

  const metadataPubKey = formatPubKey(keyDetails.metadataPubKey);
  const tssPubKey = formatPubKey(keyDetails.tssPubKey);

  // 解析因子信息
  const parseShares = (): ShareInfo[] => {
    const shares: ShareInfo[] = [];
    Object.entries(keyDetails.shareDescriptions).forEach(([, arr]) => {
      if (arr && arr.length > 0) {
        try {
          const parsed = JSON.parse(arr[0]);
          shares.push(parsed);
        } catch (e) {
          console.error("解析因子失败:", e);
        }
      }
    });
    return shares.sort((a, b) => a.tssShareIndex - b.tssShareIndex);
  };

  const shares = parseShares();

  // 获取因子类型的显示名称和图标
  const getFactorTypeInfo = (share: ShareInfo) => {
    const module = share.module.toLowerCase();
    
    if (module === 'seedphrase') {
      return { icon: '🌱', name: '助记词因子', type: 'Recovery Share', color: '#4CAF50' };
    } else if (module === 'hashedshare') {
      return { icon: '🔐', name: '哈希因子', type: 'Hashed Share', color: '#2196F3' };
    } else if (module === 'other' && share.browserName) {
      return { icon: '📱', name: '设备因子', type: 'Device Share', color: '#FF9800' };
    } else if (module === 'other') {
      return { icon: '🔑', name: '其他因子', type: 'Other Share', color: '#9C27B0' };
    } else {
      return { icon: '❓', name: '未知因子', type: 'Unknown', color: '#757575' };
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label}已复制到剪贴板`);
  };

  return (
    <div className="backup-list-overlay" onClick={onClose}>
      <div className="backup-list-modal key-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="backup-list-header">
          <h3>🔐 密钥详情</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="backup-list-content">
          <div className="key-details-info">
            {/* 概览信息 */}
            <div className="info-section">
              <h4>📊 概览</h4>
              <div className="key-stats">
                <div className="stat-item">
                  <span className="stat-label">总因子数</span>
                  <span className="stat-value">{keyDetails.totalFactors}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">阈值</span>
                  <span className="stat-value">{keyDetails.threshold}/{keyDetails.totalFactors}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">必需因子</span>
                  <span className="stat-value">{keyDetails.requiredFactors}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">密钥类型</span>
                  <span className="stat-value">{keyDetails.keyType}</span>
                </div>
              </div>
            </div>

            {/* 因子列表 */}
            <div className="info-section">
              <h4>🔑 因子列表 ({shares.length})</h4>
              <div className="shares-list">
                {shares.map((share) => {
                  const typeInfo = getFactorTypeInfo(share);
                  return (
                    <div key={share.pub} className="share-item" style={{ borderLeftColor: typeInfo.color }}>
                      <div className="share-header">
                        <div className="share-title">
                          <span className="share-icon">{typeInfo.icon}</span>
                          <span className="share-name">{typeInfo.name}</span>
                          <span className="share-index">#{share.tssShareIndex}</span>
                        </div>
                        <span className="share-type">{typeInfo.type}</span>
                      </div>
                      
                      <div className="share-details">
                        <div className="detail-row">
                          <span className="detail-label">公钥:</span>
                          <code className="detail-value">{share.pub.slice(0, 20)}...{share.pub.slice(-20)}</code>
                          <button 
                            className="mini-copy-btn" 
                            onClick={() => copyToClipboard(share.pub, '公钥')}
                          >
                            📋
                          </button>
                        </div>
                        
                        <div className="detail-row">
                          <span className="detail-label">创建时间:</span>
                          <span className="detail-value">
                            {new Date(share.dateAdded).toLocaleString('zh-CN')}
                          </span>
                        </div>

                        {share.browserName && (
                          <div className="detail-row">
                            <span className="detail-label">设备信息:</span>
                            <span className="detail-value">
                              {share.deviceName} - {share.browserName} {share.browserVersion}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TSS 公钥 */}
            <div className="info-section">
              <h4>🔐 TSS 公钥</h4>
              <div className="pubkey-box">
                <div className="pubkey-row">
                  <span className="pubkey-label">X:</span>
                  <code className="pubkey-value">{tssPubKey.x}</code>
                  <button 
                    className="mini-copy-btn" 
                    onClick={() => copyToClipboard(tssPubKey.x, 'X 坐标')}
                  >
                    📋
                  </button>
                </div>
                <div className="pubkey-row">
                  <span className="pubkey-label">Y:</span>
                  <code className="pubkey-value">{tssPubKey.y}</code>
                  <button 
                    className="mini-copy-btn" 
                    onClick={() => copyToClipboard(tssPubKey.y, 'Y 坐标')}
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* 元数据公钥 */}
            <div className="info-section">
              <h4>📝 元数据公钥</h4>
              <div className="pubkey-box">
                <div className="pubkey-row">
                  <span className="pubkey-label">X:</span>
                  <code className="pubkey-value">{metadataPubKey.x}</code>
                  <button 
                    className="mini-copy-btn" 
                    onClick={() => copyToClipboard(metadataPubKey.x, 'X 坐标')}
                  >
                    📋
                  </button>
                </div>
                <div className="pubkey-row">
                  <span className="pubkey-label">Y:</span>
                  <code className="pubkey-value">{metadataPubKey.y}</code>
                  <button 
                    className="mini-copy-btn" 
                    onClick={() => copyToClipboard(metadataPubKey.y, 'Y 坐标')}
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="backup-list-footer">
          <p className="hint">
            💡 提示：需要至少 {keyDetails.threshold} 个因子才能访问钱包
          </p>
        </div>
      </div>
    </div>
  );
};

