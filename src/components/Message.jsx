import { useState } from 'react';
import FileAttachment from './FileAttachment';
import './Message.css';

const Message = ({ message, isMine, onReply, onDelete, currentUser }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={`message-container ${isMine ? 'outgoing' : 'incoming'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`message ${isMine ? 'outgoing' : 'incoming'}`}>
        {message.replyTo && (
          <div className="reply-preview">
            <strong>{message.replyTo.fromName || 'User'}:</strong>
            {message.replyTo.text || 'Voice message'}
          </div>
        )}
        
        {message.text && <div className="message-text">{message.text}</div>}
        
        {message.voiceUrl && (
          <audio controls className="voice-message">
            <source src={message.voiceUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        )}
        
        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="attachments-container">
            {message.attachments.map((attachment, index) => (
              <FileAttachment key={index} attachment={attachment} />
            ))}
          </div>
        )}
        
        <div className="message-time">
          {new Date(message.createdAt).toLocaleTimeString()}
          {isMine && (
            <span className="message-status">
              {message.seenAt ? '✓✓' : message.deliveredAt ? '✓' : ''}
            </span>
          )}
        </div>
        
        {showActions && (
          <div className="message-actions">
            <button onClick={() => onReply(message)} title="Reply">
              ↩️
            </button>
            {isMine && (
              <button onClick={() => onDelete(message._id)} title="Delete">
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;