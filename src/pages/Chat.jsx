import { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import { chatApi } from '../lib/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useAuth } from '../context/AuthContext'; // Auth context import karein
import './Chat.css';
import { useNavigate } from 'react-router-dom';


import ReplyBar from '../components/ReplyBar';
import Message from '../components/Message';
import '../components/ReplyBar.css';
import '../components/Message.css';
dayjs.extend(relativeTime);

export default function Chat() {
  const nav = useNavigate();
  const { user: currentUser } = useAuth(); // Current user get karein
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingFrom, setTypingFrom] = useState(null);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showContacts, setShowContacts] = useState(true);

  const [replyingTo, setReplyingTo] = useState(null);
const [replyText, setReplyText] = useState('');


  
  // === Jarvis state ===
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [assistantLang, setAssistantLang] = useState('en-US');
  const [assistantHint, setAssistantHint] = useState('Click Jarvis button to activate voice commands');
  const [transcript, setTranscript] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const bottomRef = useRef(null);

  const socket = useMemo(() => getSocket(), []);

useEffect(() => {
    if (!currentUser) {
      nav('/login');
    }
  }, [currentUser, nav]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      setShowContacts(isMobile ? !activeUser : true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [activeUser]);

  // Load users and sort by last message time
  // Load users via socket instead of API
useEffect(() => {
  // When socket connects, it will send us all users data
  // We just need to request it if we don't receive it automatically
  
  const timeout = setTimeout(() => {
    if (users.length === 0) {
      // Request users data if not received within 2 seconds
      socket.emit('users:request');
    }
  }, 2000);

  return () => clearTimeout(timeout);
}, [socket, users.length]);

// Socket event for receiving all users data
useEffect(() => {
  function onAllUsers({ users }) {
    setUsers(prev => {
      // Create a map of existing users with their unread counts
      const unreadMap = {};
      prev.forEach(u => {
        unreadMap[u._id] = u.unread || 0;
      });
      
      // Merge with the new users data, preserving unread counts
      return users.map(userData => {
        const existingUser = prev.find(u => u._id === userData.userId);
        return {
          ...userData.user,
          unread: existingUser ? existingUser.unread : 0
        };
      });
    });
  }

  socket.on('presence:all-users', onAllUsers);

  return () => {
    socket.off('presence:all-users', onAllUsers);
  };
}, [socket]);
  // Load messages on active user change
  useEffect(() => {
    if (!activeUser) return;

    if (isMobileView) setShowContacts(false);

    (async () => {
      try {
        const { data } = await chatApi.messagesByUser(activeUser._id);
        setConversationId(data.conversationId);
        
        // Mark messages as seen when opening a conversation
        const unseenMessages = data.messages.filter(m => 
          m.to === currentUser._id && !m.seenAt
        );
        
        if (unseenMessages.length > 0) {
          unseenMessages.forEach(message => {
            socket.emit('message:seen', { messageId: message._id, to: message.from });
          });
        }
        
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        scrollToBottomSoon();
        setUsers(prev => prev.map(u => u._id === activeUser._id ? { ...u, unread: 0 } : u));
      } catch (e) {
        console.error('Messages load fail', e);
        setMessages([]);
        setConversationId(null);
      }
    })();
  }, [activeUser?._id, isMobileView, currentUser._id, socket]);

  // Socket listeners
useEffect(() => {
  function onOnline({ userId, user }) { 
  setUsers(prev => prev.map(u => {
    if (u._id === userId) {
      return { ...u, online: true, lastSeen: null };
    }
    return u;
  }));
}
    
     function onOffline({ userId, lastSeen }) { 
  setUsers(prev => prev.map(u => {
    if (u._id === userId) {
      return { ...u, online: false, lastSeen };
    }
    return u;
  }));
}
  function onBulkOnline({ users }) {
  setUsers(prev => prev.map(u => {
    const onlineUser = users.find(ou => ou.userId === u._id);
    if (onlineUser) {
      return { 
        ...u, 
        online: true, 
        lastSeen: null 
      };
    }
    return u;
  }));

}
    
    function onTypingStart({ from }) { 
      setTypingFrom(from); 
    }
    
    function onTypingStop({ from }) { 
      setTypingFrom(prev => prev === from ? null : prev); 
    }
    
    function onMessageNew({ message }) {
  // Only handle incoming messages (from others)
  if (message.from !== currentUser._id) {
    if (activeUser && message.from === activeUser._id) {
      setMessages(prev => [...prev, message]);
      scrollToBottomSoon();
      
      // Immediately mark as seen when receiving a message in active chat
      socket.emit('message:seen', { messageId: message._id, to: message.from });
    } else {
      // increment unread for that contact
      setUsers(prev => prev.map(u => u._id === message.from ? { ...u, unread: (u.unread || 0) + 1 } : u));
      
      // Update the conversation order - move this contact to the top
      setUsers(prev => {
        const userIndex = prev.findIndex(u => u._id === message.from);
        if (userIndex > 0) {
          const updatedUsers = [...prev];
          const [user] = updatedUsers.splice(userIndex, 1);
          updatedUsers.unshift(user);
          return updatedUsers;
        }
        return prev;
      });
    }
  }
}
    function onMessageSent({ message }) {
  // Only handle our own sent messages
  if (message.from === currentUser._id) {
    setMessages(prev => [...prev, message]); 
    scrollToBottomSoon(); 
    
    // Update the conversation order - move this contact to the top
    if (activeUser && message.to === activeUser._id) {
      setUsers(prev => {
        const userIndex = prev.findIndex(u => u._id === message.to);
        if (userIndex > 0) {
          const updatedUsers = [...prev];
          const [user] = updatedUsers.splice(userIndex, 1);
          updatedUsers.unshift(user);
          return updatedUsers;
        }
        return prev;
      });
    }
  }
}
    
    function onMessageSeen({ messageId }) { 
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          return { ...m, seenAt: new Date().toISOString() };
        }
        return m;
      })); 
    }
    
    function onMessageDeleted({ messageId }) { 
      setMessages(prev => prev.filter(m => m._id !== messageId)); 
    }
   socket.on('presence:online', onOnline);
    socket.on('presence:offline', onOffline);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:new', onMessageNew);
    socket.on('message:sent', onMessageSent);
    socket.on('message:seen', onMessageSeen);
    socket.on('message:deleted', onMessageDeleted);
    socket.on('presence:bulk-online', onBulkOnline);



    return () => {
      socket.off('presence:online', onOnline);
      socket.off('presence:offline', onOffline);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:new', onMessageNew);
      socket.off('message:sent', onMessageSent);
      socket.off('message:seen', onMessageSeen);
      socket.off('message:deleted', onMessageDeleted);
      socket.off('presence:bulk-online', onBulkOnline);


    };
  }, [socket, activeUser, currentUser._id]);

  const scrollToBottomSoon = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);

  const sendText = () => {
  if ((!input.trim() && !replyingTo) || !activeUser) return;
  
  const messageData = {
    to: activeUser._id,
    text: input.trim(),
  };
  
  // Add reply data if replying to a message
  if (replyingTo) {
    messageData.replyTo = replyingTo._id;
  }
  
  socket.emit('message:send', messageData, () => {});
  setInput('');
  setReplyingTo(null);
  setReplyText('');
};

  const startTyping = () => { if (activeUser) socket.emit('typing:start', { to: activeUser._id }); };
  const stopTyping = () => { if (activeUser) socket.emit('typing:stop', { to: activeUser._id }); };

  const onEmoji = (emoji) => setInput(prev => prev + (emoji.native || ''));

  // Voice note recording
  const startRecording = async () => {
    if (recording || !activeUser) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const media = new MediaRecorder(stream);
    mediaRef.current = media;
    chunksRef.current = [];
    media.ondataavailable = (e) => chunksRef.current.push(e.data);
    media.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      try {
        const { data } = await chatApi.uploadVoice(blob);
        socket.emit('message:send', { to: activeUser._id, voiceUrl: data.url });
      } catch (e) { console.error('Voice upload failed', e); }
      finally { stream.getTracks().forEach(t => t.stop()); setRecording(false); }
    };
    media.start();
    setRecording(true);
  };
  const stopRecording = () => mediaRef.current?.stop();

  const deleteMessage = (id) => {
    socket.emit('message:delete', { messageId: id });
    setMessages(prev => prev.filter(m => m._id !== id));
  };
const handleReply = (message) => {
  setReplyingTo(message);
  setReplyText(message.text || 'Voice message');
  // Focus on the input field
  setTimeout(() => {
    const textarea = document.querySelector('.text-input');
    if (textarea) textarea.focus();
  }, 100);
};

const cancelReply = () => {
  setReplyingTo(null);
  setReplyText('');
};
  // Toggle between contacts and chat view on mobile
  const handleBackToContacts = () => {
    setShowContacts(true);
    setActiveUser(null);
    setMessages([]);
    setConversationId(null);
  };

  // =============== JARVIS: Speech Recognition ===============
  // =============== JARVIS: Speech Recognition ===============
useEffect(() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    setAssistantHint('Speech recognition not supported in this browser. Try Chrome.');
    return;
  }
  const recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = assistantLang;

  recognition.onstart = () => {
    setRecognizing(true);
    setAssistantHint('Listening... speak your command');
  };
  recognition.onend = () => {
    setRecognizing(false);
    if (listening) {
      try { recognition.start(); } catch (e) { console.log('Recognition restart failed:', e); }
    }
  };
  recognition.onerror = (e) => {
    console.warn('SR error', e.error);
    setAssistantHint('Mic error: ' + e.error);
  };

  recognition.onresult = (e) => {
    let full = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      full += e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        const finalText = full.trim();
        setTranscript(finalText);
        tryHandleCommand(finalText);
        full = '';
      }
    }
  };

  recognitionRef.current = recognition;

  if (!hasInitialized && users.length > 0) {
    setHasInitialized(true);
    speak('I am Jarvis. How can I assist you?');
    setAssistantHint('Click the Jarvis button to start voice commands');
  }

  return () => { try { recognition.stop(); } catch (e) { console.log('Recognition stop failed:', e); } };
}, [assistantLang, users, hasInitialized, listening]);

const toggleListening = () => {
  const rec = recognitionRef.current;
  if (!rec) return;
  if (listening) {
    setListening(false);
    rec.stop();
    setAssistantHint('Jarvis stopped');
    speak('Goodbye. Take care.');
  } else {
    setTranscript('');
    setListening(true);
    setAssistantHint('Listening... speak your command');
    try { rec.start(); } catch (e) { console.log('Manual start failed:', e); }
  }
};

const speak = (text) => {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = assistantLang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

// Helpers: normalize + fuzzy user match
const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const bestUserByName = (nameRaw) => {
  const name = normalize(nameRaw);
  if (!name) return null;
  let best = null;
  let bestScore = 0;

  users.forEach(u => {
    const uname = normalize(u.name || u.email || '');
    if (!uname) return;
    if (uname === name) { best = u; bestScore = 999; return; }
    const nt = new Set(name.split(' '));
    const ut = new Set(uname.split(' '));
    let overlap = 0;
    nt.forEach(t => { if (ut.has(t)) overlap++; });
    const inc = uname.includes(name) ? 0.5 : 0;
    const score = overlap + inc;
    if (score > bestScore) { best = u; bestScore = score; }
  });

  return bestScore > 0 ? best : null;
};

// Emoji name to emoji mapping
const getEmojiByName = (name) => {
  const emojiMap = {
    'happy': '😊', 'smile': '😊', 'smiley': '😊', 'smiling': '😊',
    'joy': '😂', 'laugh': '😂', 'laughing': '😂', 'lol': '😂',
    'love': '❤️', 'heart': '❤️', 'red heart': '❤️',
    'kiss': '😘', 'kissing': '😘', 'blow kiss': '😘',
    'hug': '🤗', 'hugging': '🤗', 'hugs': '🤗',
    'excited': '🤩', 'star eyes': '🤩', 'amazing': '🤩',
    'party': '🎉', 'celebrate': '🎉', 'celebration': '🎉',
    'clap': '👏', 'clapping': '👏', 'applause': '👏',
    'sad': '😢', 'cry': '😢', 'crying': '😢', 'tear': '😢',
    'angry': '😠', 'mad': '😠', 'upset': '😠',
    'worried': '😟', 'concern': '😟', 'concerned': '😟',
    'disappointed': '😞', 'down': '😞',
    'thumbs up': '👍', 'thumbs': '👍', 'like': '👍', 'good': '👍',
    'thumbs down': '👎', 'dislike': '👎', 'bad': '👎',
    'ok': '👌', 'okay': '👌', 'perfect': '👌',
    'peace': '✌️', 'victory': '✌️',
    'wave': '👋', 'hi': '👋', 'hello': '👋', 'bye': '👋',
    'pray': '🙏', 'thanks': '🙏', 'please': '🙏', 'grateful': '🙏',
    'fire': '🔥', 'lit': '🔥', 'hot': '🔥',
    'sun': '☀️', 'sunny': '☀️',
    'moon': '🌙', 'night': '🌙',
    'star': '⭐', 'stars': '⭐',
    'flower': '🌸', 'flowers': '🌸',
    'gift': '🎁', 'present': '🎁',
    'cake': '🎂', 'birthday': '🎂',
    'coffee': '☕', 'tea': '🍵',
    'pizza': '🍕', 'food': '🍕',
    'thinking': '🤔', 'think': '🤔', 'hmm': '🤔',
    'wink': '😉', 'winking': '😉',
    'cool': '😎', 'sunglasses': '😎', 'awesome': '😎',
    'shocked': '😱', 'surprise': '😱', 'surprised': '😱',
    'sleepy': '😴', 'sleep': '😴', 'tired': '😴',
    'sick': '🤒', 'ill': '🤒', 'fever': '🤒',
    'cat': '🐱', 'dog': '🐶', 'heart eyes': '😍',
    'monkey': '🐵', 'lion': '🦁', 'tiger': '🐯',
    'rain': '🌧️', 'snow': '❄️', 'cloud': '☁️',
    'morning': '🌅', 'evening': '🌆', 'night': '🌃',
    'blue heart': '💙', 'green heart': '💚', 'yellow heart': '💛',
    'purple heart': '💜', 'orange heart': '🧡', 'black heart': '🖤'
  };

  const normalizedName = normalize(name);
  return emojiMap[normalizedName] || null;
};

// Add this function to handle date/time queries
const handleDateTimeQuery = (text) => {
  const now = new Date();
  const normalizedText = normalize(text);
  
  // Date queries
  if (normalizedText.includes('aaj ki date') || 
      normalizedText.includes('aj ki date') || 
      normalizedText.includes('date kya hai') ||
      normalizedText.includes('aaj kitna tarikh hai')) {
    const dateStr = now.toLocaleDateString('ur-PK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    speak(`آج کی تاریخ ${dateStr} ہے`);
    setAssistantHint(`Today's date: ${dateStr}`);
    return true;
  }
  
  // Time queries
  if (normalizedText.includes('time kya hua') || 
      normalizedText.includes('kitne baj gaye') ||
      normalizedText.includes('time kya hai') ||
      normalizedText.includes('abhi time kya hua')) {
    const timeStr = now.toLocaleTimeString('ur-PK', {
      hour: '2-digit',
      minute: '2-digit'
    });
    speak(`اب کا وقت ${timeStr} ہے`);
    setAssistantHint(`Current time: ${timeStr}`);
    return true;
  }
  
  // Day queries
  if (normalizedText.includes('aaj kaun sa din hai') || 
      normalizedText.includes('aaj kya din hai')) {
    const dayStr = now.toLocaleDateString('ur-PK', { weekday: 'long' });
    speak(`آج ${dayStr} ہے`);
    setAssistantHint(`Today is ${dayStr}`);
    return true;
  }
  
  return false;
};

// Enhanced command parser with emoji support and Urdu commands
const tryHandleCommand = (raw) => {
  const t = normalize(raw);

  // First check if it's a date/time query
  if (handleDateTimeQuery(t)) {
    return;
  }

  if (t.match(/^(stop|quit|exit|goodbye|ruk ja|band karo|khatam karo)$/i)) {
    setListening(false);
    recognitionRef.current?.stop();
    setAssistantHint('Jarvis stopped');
    speak('Goodbye. Take care.');
    return;
  }

  if (t.match(/^(who are you|what is your purpose|introduce yourself|tum kaun ho|tumhara kaam kya hai)$/i)) {
    speak('I am your personal assistant for this chat application, developed by Hafiz Abdul Hannan.');
    setAssistantHint('Introduced myself');
    return;
  }

  // Enhanced Urdu/English open command patterns
  const openMatch = t.match(/^(open|go\s*to|open\s*chat\s*with|kholo|khologe|khol)\s+(.+)$/i);
  if (openMatch) {
    const name = openMatch[2];
    const user = bestUserByName(name);
    if (!user) { 
      speak('Contact not found'); 
      setAssistantHint('Contact not found'); 
      return; 
    }
    setActiveUser(user);
    if (isMobileView) setShowContacts(false);
    speak(`Opened chat with ${user.name || 'contact'}`);
    setAssistantHint(`Opened ${user.name}`);
    return;
  }

  // Enhanced emoji command patterns for Urdu/English
  const emojiMatch = t.match(/^send\s+(?:a\s+)?(.+?)\s+emoji\s+to\s+(.+)$/i) ||
                     t.match(/^send\s+(.+?)\s+emoji\s+to\s+(.+)$/i) ||
                     t.match(/^(.+?)\s+ko\s+(.+?)\s+emoji\s+(bhej\s*do|send|bhej)$/i) ||
                     t.match(/^(.+?)\s+emoji\s+(.+?)\s+ko\s+bhej\s*do$/i);

  if (emojiMatch) {
    let emojiName, contactName;
    if (t.includes('ko')) { 
      // Urdu pattern: "Ali ko happy emoji bhejdo"
      if (t.match(/^.+\s+ko\s+.+\s+emoji/)) {
        contactName = emojiMatch[1]; 
        emojiName = emojiMatch[2]; 
      } 
      // Alternative Urdu pattern: "happy emoji Ali ko bhejdo"
      else {
        emojiName = emojiMatch[1]; 
        contactName = emojiMatch[2]; 
      }
    }
    else { 
      // English pattern: "send happy emoji to Ali"
      emojiName = emojiMatch[1]; 
      contactName = emojiMatch[2]; 
    }

    const user = bestUserByName(contactName);
    if (!user) { speak('Contact not found'); setAssistantHint('Contact not found'); return; }

    const emoji = getEmojiByName(emojiName);
    if (emoji) { 
      sendByAssistant(user, emoji); 
      speak(`${emojiName} emoji sent to ${user.name || 'contact'}`); 
      return; 
    }
    else { 
      speak('Emoji not found. Try common names like happy, sad, heart, or thumbs up'); 
      setAssistantHint('Emoji not recognized'); 
      return; 
    }
  }

  // Enhanced message sending patterns for Urdu/English
  let name = '', text = '';
  let m =
    t.match(/^send\s+(?:a\s+)?message\s+to\s+(.+?)\s+saying\s+(.+)$/i) ||
    t.match(/^send\s+message\s+to\s+(.+?)\s+(.+)$/i) ||
    t.match(/^message\s+(.+?)\s+saying\s+(.+)$/i) ||
    t.match(/^message\s+(.+?)\s+(.+)$/i) ||
    t.match(/^send\s+(.+?)\s+(.+)$/i) ||
    t.match(/^(.+?)\s+ko\s+(.+?)\s+(bhej\s*do|bhejdo|send|kar\s*do|kardo|bhej)$/i) ||
    t.match(/^(.+?)\s+bhej\s*do\s+(.+)$/i) ||
    null;

  if (m) {
    // Determine if it's Urdu or English pattern
    if (t.includes('ko')) {
      // Urdu pattern: "Ali ko khana kha lia bhejdo"
      name = m[1];
      text = m[2];
    } else {
      // English pattern: "send to Ali khana kha lia"
      name = m[1];
      text = m[2];
    }
  } else {
    const m2 = t.match(/^say\s+(.+?)\s+to\s+(.+)$/i) ||
               t.match(/^bolo\s+(.+?)\s+(.+?)\s+ko$/i);
    if (m2) { 
      text = m2[1]; 
      name = m2[2]; 
    }
  }

  if (name && text) {
    const user = bestUserByName(name);
    if (!user) { speak('Contact not found'); setAssistantHint('Contact not found'); return; }
    sendByAssistant(user, text);
    return;
  }

  const onlyName = t.match(/^(.+?)\s*(ko|chat|message|kholo|khol)?$/i);
  if (onlyName && onlyName[1].length > 2) {
    const user = bestUserByName(onlyName[1]);
    if (user) {
      setActiveUser(user);
      if (isMobileView) setShowContacts(false);
      speak(`Opened chat with ${user.name || 'contact'}`);
      setAssistantHint(`Opened ${user.name}`);
      return;
    }
  }

  setAssistantHint('Command not recognized. Try: "send message to [name] saying [message]" or "send happy emoji to [name]"');
};

const sendByAssistant = (user, text) => {
  socket.emit('message:send', { to: user._id, text }, () => {});
  setActiveUser(user);
  if (isMobileView) setShowContacts(false);
  speak('Message sent successfully.');
  setAssistantHint(`Message sent to ${user.name}: "${text}"`);
};

  // Filtered users for search
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="chat-container">
      {/* Left sidebar - visible on desktop, conditional on mobile */}
      {(!isMobileView || showContacts) && (
        <aside className={`chat-sidebar ${isMobileView && !showContacts ? 'hidden' : ''}`}>
          <div className="search-box">
            <input
              className="search-input"
              placeholder="🔍 Search contacts..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <div className="user-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <button
                  key={u._id}
                  onClick={() => {
                    setActiveUser(u);
                    if (isMobileView) setShowContacts(false);
                  }}
                  className={`user-button ${activeUser?._id === u._id ? 'active' : ''}`}
                >
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u._id}`}
                    alt=""
                    className="avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">
                      {u.name || 'User'}
                      {u.online ? (
                        <span className="online-indicator">● online</span>
                      ) : (
                        <span className="last-seen">
                          {u.lastSeen ? dayjs(u.lastSeen).fromNow() : 'offline'}
                        </span>
                      )}
                    </div>
                    <div className="user-email">{u.email}</div>
                  </div>
                  {u.unread > 0 && <span className="unread-badge">{u.unread}</span>}
                </button>
              ))
            ) : (
              <div className="no-contacts">
                <div>📭</div>
                <div>No contacts found</div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Chat window */}
      {(!isMobileView || !showContacts) && (
        <section className={`chat-window ${isMobileView && showContacts ? 'hidden' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            {/* Back button only on mobile */}
            {isMobileView && (
              <button
                onClick={handleBackToContacts}
                className="back-button"
                title="Back to contacts"
              >
                ←
              </button>
            )}

            <div className="header-left">
              {activeUser ? (
                <>
                  <img
                    src={activeUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser._id}`}
                    alt=""
                    className="avatar-small"
                  />
                  <div>
                    <div className="header-name">{activeUser.name || 'User'}</div>
                    <div className="header-status">
                      {typingFrom === activeUser._id ? (
                        <span className="typing-indicator">💬 typing...</span>
                      ) : (
                        activeUser.online ? (
                          <span className="online-status">🟢 online</span>
                        ) : (
                          <span className="offline-status">
                            {activeUser.lastSeen ? `last seen ${dayjs(activeUser.lastSeen).fromNow()}` : 'offline'}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="select-conversation">Select a conversation</div>
              )}
            </div>

            {/* Jarvis controls */}
            <div className="header-right">
              {/*<select
                value={assistantLang}
                onChange={(e) => setAssistantLang(e.target.value)}
                className="language-select"
                title="Voice language"
              >
                <option value="en-US">🇺🇸 English</option>
                <option value="ur-PK">🇵🇰 Urdu</option>
              </select>*/}

              <button
                onClick={toggleListening}
                className={`jarvis-button ${listening ? 'listening' : ''}`}
                title={listening ? 'Stop Jarvis' : 'Start Jarvis'}
              >
                {listening ? '🛑 Stop' : '🤖 Jarvis'}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {/* Jarvis status bar */}
            <div className="jarvis-bar">
              <div className="jarvis-status">
                <span className="jarvis-icon">
                  {recognizing ? '🎤' : (listening ? '🤖' : '😴')}
                </span>
                <span className="jarvis-text">{assistantHint}</span>
              </div>
              {transcript && (
                <div className="transcript">
                  💭 "{transcript}"
                </div>
              )}
            </div>

            {!activeUser && (
              <div className="empty-chat">
                <div className="empty-icon">📂</div>
                <div className="empty-title">Select a conversation</div>
                <div className="empty-subtitle">Choose a contact from the left to start chatting</div>
              </div>
            )}

            {activeUser && messages.length === 0 && (
              <div className="empty-chat">
                <div className="empty-icon">💬</div>
                <div className="empty-title">Start a conversation</div>
                <div className="empty-subtitle">Send a message or use voice commands with Jarvis</div>
              </div>
            )}

{activeUser && messages.map(m => (
  <Message
    key={m._id || m.createdAt}
    message={m}
    isMine={m.from === currentUser._id}
    onReply={handleReply}
    onDelete={deleteMessage}
    currentUser={currentUser}
  />
))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          {activeUser && (
            <div className="input-area">
              <ReplyBar 
      replyingTo={replyingTo} 
      onCancelReply={cancelReply} 
    />
              <div className="input-row">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  className="voice-button"
                  title="Hold to record voice message"
                >
                  {recording ? '🎙️' : '🎤'}
                </button>

                <div className="text-input-container">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onFocus={startTyping}
                    onBlur={stopTyping}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendText();
                      }
                    }}
                    placeholder="Type a message..."
                    className="text-input"
                    rows="1"
                  />

                  <div className="input-actions">
                    <button
                      onClick={() => setShowEmoji(v => !v)}
                      className="emoji-button"
                      title="Add emoji"
                    >
                      😊
                    </button>
                    {showEmoji && (
                      <div className="emoji-picker">
                        <Picker
                          data={data}
                          onEmojiSelect={onEmoji}
                          theme="light"
                          previewPosition="none"
                          skinTonePosition="none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={sendText}
                  className="send-button"
                  disabled={!input.trim()}
                  title="Send message"
                >
                  ➤
                </button>
              </div>
              {recording && (
                <div className="recording-indicator">
                  🔴 Recording... Release to send
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}