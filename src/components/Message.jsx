import dayjs from 'dayjs';

export default function Message({ 
  message, 
  isMine, 
  onReply, 
  onDelete,
  currentUser 
}) {
  const handleReply = () => {
    onReply(message);
  };

  const handleDelete = () => {
    onDelete(message._id);
  };

  return (
    <div className={`message-container ${isMine ? 'mine' : 'theirs'}`}>
      <div className={`message ${isMine ? 'outgoing' : 'incoming'}`}>
        {/* Reply indicator if this is a reply */}
        {message.replyTo && (
          <div className="message-reply">
            <div className="reply-to">
              Replying to {message.replyTo.from === currentUser._id ? 'yourself' : message.replyTo.fromName}
            </div>
            <div className="reply-content">
              {message.replyTo.text && (
                <div className="reply-text-preview">{message.replyTo.text}</div>
              )}
              {message.replyTo.voiceUrl && (
                <div className="reply-voice-preview">🎤 Voice message</div>
              )}
            </div>
          </div>
        )}
        
        {/* Message content */}
        {message.text && <div className="message-text">{message.text}</div>}
        {message.voiceUrl && (
          <audio controls src={message.voiceUrl} className="voice-message" />
        )}
        
        <div className="message-time">
          {dayjs(message.createdAt).format('hh:mm A')}
          {isMine && (
            <span className="message-status">
              {message.seenAt ? ' ✓✓' : (message.deliveredAt ? ' ✓' : '')}
            </span>
          )}
        </div>
        
        {/* Message actions */}
        <div className="message-actions">
          <button
            onClick={handleReply}
            className="message-action reply-action"
            title="Reply"
          >
            ↪
          </button>
          {isMine && (
            <button
              onClick={handleDelete}
              className="message-action delete-action"
              title="Delete message"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}