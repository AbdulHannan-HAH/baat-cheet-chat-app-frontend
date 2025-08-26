import { useState } from 'react';
import './FileAttachment.css';

const FileAttachment = ({ attachment }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'pdf':
        return '📄';
      case 'document':
        return '📝';
      case 'spreadsheet':
        return '📊';
      case 'presentation':
        return '📊';
      case 'text':
        return '📃';
      case 'archive':
        return '📦';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // For non-image/video files, add download attribute
    if (attachment.fileType !== 'image' && attachment.fileType !== 'video') {
      link.download = attachment.fileName;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (attachment.fileType === 'image' || attachment.fileType === 'video') {
      setIsOpen(true);
    } else {
      handleDownload();
    }
  };

  const isPreviewable = () => {
    return attachment.fileType === 'image' || attachment.fileType === 'video';
  };

  return (
    <>
      <div 
        className={`file-attachment ${isPreviewable() ? 'previewable' : ''}`} 
        onClick={isPreviewable() ? handlePreview : handleDownload}
      >
        <div className="file-icon">{getFileIcon(attachment.fileType)}</div>
        <div className="file-info">
          <div className="file-name">{attachment.fileName}</div>
          <div className="file-size">{formatFileSize(attachment.fileSize)}</div>
        </div>
        <button 
          className="download-btn" 
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          title="Download file"
        >
          ⬇️
        </button>
      </div>

      {isOpen && (
        <div className="file-preview-overlay" onClick={() => setIsOpen(false)}>
          <div className="file-preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-preview" onClick={() => setIsOpen(false)}>
              ✕
            </button>
            {attachment.fileType === 'image' ? (
              <img src={attachment.fileUrl} alt={attachment.fileName} />
            ) : (
              <video controls autoPlay src={attachment.fileUrl} />
            )}
            <div className="file-preview-info">
              <h3>{attachment.fileName}</h3>
              <p>{formatFileSize(attachment.fileSize)}</p>
              <button onClick={handleDownload} className="download-btn-large">
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileAttachment;