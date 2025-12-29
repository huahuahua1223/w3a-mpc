import type { DriveBackupFile } from "../../drive/driveApi";

/**
 * 备份文件列表组件
 */
export interface BackupFileListProps {
  files: DriveBackupFile[];
  onClose: () => void;
}

export const BackupFileList: React.FC<BackupFileListProps> = ({ files, onClose }) => {
  if (files.length === 0) {
    return (
      <div className="backup-list-overlay" onClick={onClose}>
        <div className="backup-list-modal" onClick={(e) => e.stopPropagation()}>
          <div className="backup-list-header">
            <h3>📁 Google Drive 备份文件</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="backup-list-content">
            <p className="no-files">未找到备份文件</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backup-list-overlay" onClick={onClose}>
      <div className="backup-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="backup-list-header">
          <h3>📁 Google Drive 备份文件 ({files.length})</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="backup-list-content">
          <table className="backup-table">
            <thead>
              <tr>
                <th>文件名</th>
                <th>创建时间</th>
                <th>大小</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="file-name">{file.name}</td>
                  <td className="file-date">
                    {file.createdTime 
                      ? new Date(file.createdTime).toLocaleString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "未知"}
                  </td>
                  <td className="file-size">
                    {file.size ? `${(parseInt(file.size) / 1024).toFixed(2)} KB` : "未知"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="backup-list-footer">
          <p className="hint">💡 提示：这些文件已加密存储在 Google Drive 的应用私有文件夹中</p>
        </div>
      </div>
    </div>
  );
};

