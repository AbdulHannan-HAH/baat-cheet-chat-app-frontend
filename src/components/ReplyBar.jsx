import { FiX } from 'react-icons/fi';

export default function ReplyBar({ replyingTo, onCancelReply }) {
  if (!replyingTo) return null;

  return (
    <div className="reply-bar">
      <div className="reply-info">
        <div className="reply-indicator">Replying to</div>
        <div className="reply-preview">
          {replyingTo.text && (
            <div className="reply-text">{replyingTo.text}</div>
          )}
          {replyingTo.voiceUrl && (
            <div className="reply-voice">🎤 Voice message</div>
          )}
        </div>
      </div>
      <button className="cancel-reply" onClick={onCancelReply}>
        <FiX />
      </button>
    </div>
  );
}