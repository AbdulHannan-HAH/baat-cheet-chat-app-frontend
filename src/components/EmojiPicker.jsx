import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function EmojiPickerButton({ onEmojiSelect }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const togglePicker = () => {
    setShowPicker(prev => !prev);
  };

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
    setShowPicker(false);
  };

  // Click outside to close picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={togglePicker}
        style={{
          background: 'none',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '8px',
          cursor: 'pointer',
          fontSize: '18px'
        }}
      >
        😊
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 1000,
            marginTop: '8px'
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
          />
        </div>
      )}
    </div>
  );
}