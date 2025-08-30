import { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import { chatApi } from '../lib/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useAuth } from '../context/AuthContext';
import './Chat.css';
import { useNavigate } from 'react-router-dom';

import ReplyBar from '../components/ReplyBar';
import Message from '../components/Message';
import '../components/Replybar.css';
import '../components/Message.css';
dayjs.extend(relativeTime);

export default function Chat() {
  const nav = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState(() => {
    const savedOrder = localStorage.getItem('chatContactOrder');
    return savedOrder ? JSON.parse(savedOrder) : [];
  });
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
  const [uploadingFile, setUploadingFile] = useState(false);

  const [showProfileDetails, setShowProfileDetails] = useState(null);

  // === Jarvis state ===
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [assistantLang, setAssistantLang] = useState('en-US');
  const [assistantHint, setAssistantHint] = useState('Click Jarvis button to activate voice commands');
  const [transcript, setTranscript] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const bottomRef = useRef(null);
  const lastProcessedRef = useRef({ command: '', time: 0 });
  const commandTimeoutRef = useRef(null);

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

  // Load users via socket instead of API
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (users.length === 0) {
        socket.emit('users:request');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [socket, users.length]);

  // Socket event for receiving all users data
  useEffect(() => {
    function onAllUsers({ users }) {
      setUsers(prev => {
        const orderMap = {};
        prev.forEach((u, index) => {
          orderMap[u._id] = index;
        });
        
        const mergedUsers = users.map(userData => {
          const existingUser = prev.find(u => u._id === userData.userId);
          return {
            ...userData.user,
            unread: existingUser ? existingUser.unread : 0,
          };
        });
        
        mergedUsers.sort((a, b) => {
          const aOrder = orderMap[a._id] !== undefined ? orderMap[a._id] : Infinity;
          const bOrder = orderMap[b._id] !== undefined ? orderMap[b._id] : Infinity;
          return aOrder - bOrder;
        });
        
        return mergedUsers;
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
      if (message.from !== currentUser._id) {
        if (activeUser && message.from === activeUser._id) {
          setMessages(prev => [...prev, message]);
          scrollToBottomSoon();
          
          socket.emit('message:seen', { messageId: message._id, to: message.from });
        } else {
          setUsers(prev => {
            const userIndex = prev.findIndex(u => u._id === message.from);
            if (userIndex >= 0) {
              const updatedUsers = [...prev];
              const [user] = updatedUsers.splice(userIndex, 1);
              user.unread = (user.unread || 0) + 1;
              updatedUsers.unshift(user);
              return updatedUsers;
            }
            const newUser = {
              _id: message.from,
              name: message.senderName || 'Unknown',
              unread: 1,
            };
            return [newUser, ...prev];
          });
        }
      }
    }
    
    function onMessageSent({ message }) {
      if (message.from === currentUser._id) {
        setMessages(prev => [...prev, message]); 
        scrollToBottomSoon(); 
        
        if (activeUser && message.to === activeUser._id) {
          setUsers(prev => {
            const userIndex = prev.findIndex(u => u._id === message.to);
            if (userIndex >= 0) {
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
  
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('chatContactOrder', JSON.stringify(users));
    }
  }, [users]);

  const scrollToBottomSoon = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);

  const sendText = () => {
    if ((!input.trim() && !replyingTo) || !activeUser) return;
    
    const messageData = {
      to: activeUser._id,
      text: input.trim(),
    };
    
    if (replyingTo) {
      messageData.replyTo = replyingTo._id;
    }
    
    socket.emit('message:send', messageData, () => {});
    setInput('');
    setReplyingTo(null);
    setReplyText('');
  };

  const handleShowProfile = (user) => {
    setShowProfileDetails(user);
  };

  const handleCloseProfile = () => {
    setShowProfileDetails(null);
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
    setTimeout(() => {
      const textarea = document.querySelector('.text-input');
      if (textarea) textarea.focus();
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };
  
  const handleBackToContacts = () => {
    setShowContacts(true);
    setActiveUser(null);
    setMessages([]);
    setConversationId(null);
  };

  const handleFileUpload = async (file) => {
    if (!activeUser) return;
    
    setUploadingFile(true);
    try {
      const { data } = await chatApi.uploadFile(file);
      
      socket.emit('message:send', {
        to: activeUser._id,
        attachments: [data.file],
        text: `Sent a file: ${file.name}`
      });
    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Check for Urdu voice support
  useEffect(() => {
    const checkUrduSupport = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const hasUrduVoice = voices.some(voice => 
          voice.lang.includes('ur') || voice.lang.includes('UR') || voice.lang.includes('Urdu')
        );
        
        if (!hasUrduVoice) {
          setAssistantHint('Urdu voice not available. Try Chrome browser for better Urdu support.');
        }
      }
    };
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = checkUrduSupport;
      checkUrduSupport();
    }
  }, []);

  // =============== JARVIS: Speech Recognition ===============
  useEffect(() => {
    // Only initialize once
    if (recognitionRef.current) return;
    
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
        try { 
          setTimeout(() => recognition.start(), 100);
        } catch (e) { 
          console.log('Recognition restart failed:', e);
          setListening(false);
        }
      }
    };
    
    recognition.onerror = (e) => {
      console.warn('SR error', e.error);
      if (e.error === 'no-speech') {
        // This is normal when no speech is detected
        return;
      }
      setAssistantHint('Mic error: ' + e.error);
      setListening(false);
    };

    recognition.onresult = (e) => {
      let full = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          full = e.results[i][0].transcript;
          const finalText = full.trim();
          
          // Debounce logic to prevent duplicate processing
          const currentTime = Date.now();
          if (finalText && 
              (finalText !== lastProcessedRef.current.command || 
               currentTime - lastProcessedRef.current.time > 2000)) {
            
            setTranscript(finalText);
            tryHandleCommand(finalText);
            
            lastProcessedRef.current = {
              command: finalText,
              time: currentTime
            };
          }
        }
      }
    };

    recognitionRef.current = recognition;

    if (!hasInitialized && users.length > 0) {
      setHasInitialized(true);
      speak('I am Jarvis. How can I assist you?');
      setAssistantHint('Click the Jarvis button to start voice commands');
    }

    return () => {
      try { 
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) { 
        console.log('Recognition stop failed:', e); 
      }
    };
  }, [assistantLang, users, hasInitialized]);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    
    if (listening) {
      setListening(false);
      try { 
        rec.stop(); 
      } catch (e) {
        console.log('Stop failed:', e);
      }
      setAssistantHint('Jarvis stopped');
      speak('Goodbye. Take care.');
    } else {
      setTranscript('');
      setListening(true);
      setAssistantHint('Listening... speak your command');
      try { 
        rec.start(); 
      } catch (e) { 
        console.log('Manual start failed:', e);
        setListening(false);
      }
      
      // Auto-stop after 10 seconds of inactivity
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      commandTimeoutRef.current = setTimeout(() => {
        if (listening && !recognizing) {
          toggleListening();
        }
      }, 10000);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Detect if the text contains Urdu characters
    const hasUrdu = /[\u0600-\u06FF]/.test(text);
    
    if (hasUrdu) {
      // Try to find an Urdu voice
      const voices = window.speechSynthesis.getVoices();
      const urduVoice = voices.find(voice => 
        voice.lang.includes('ur') || voice.lang.includes('UR') || voice.lang.includes('Urdu')
      );
      
      if (urduVoice) {
        utterance.voice = urduVoice;
        utterance.lang = urduVoice.lang;
      } else {
        // Fallback to English if no Urdu voice found
        utterance.lang = 'en-US';
        console.warn('Urdu voice not available, falling back to English');
      }
    } else {
      utterance.lang = assistantLang;
    }
    
    utterance.rate = 0.8; // Slower rate for better clarity
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

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
      'moon': '🌙', 
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

  const handleDateTimeQuery = (text) => {
    const now = new Date();
    const normalizedText = normalize(text);
    
    // Check if Urdu voice is available
    const voices = window.speechSynthesis?.getVoices() || [];
    const hasUrduVoice = voices.some(voice => 
      voice.lang.includes('ur') || voice.lang.includes('UR') || voice.lang.includes('Urdu')
    );
    
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
      
      if (hasUrduVoice) {
        speak(`آج کی تاریخ ${dateStr} ہے`);
        setAssistantHint(`Today's date: ${dateStr}`);
      } else {
        // Fallback to English pronunciation
        const englishDate = now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        speak(`Today's date is ${englishDate}`);
        setAssistantHint(`Today's date: ${dateStr}`);
      }
      return true;
    }
    
    if (normalizedText.includes('time kya hua') || 
        normalizedText.includes('kitne baj gaye') ||
        normalizedText.includes('time kya hai') ||
        normalizedText.includes('abhi time kya hua')) {
      
      const timeStr = now.toLocaleTimeString('ur-PK', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      if (hasUrduVoice) {
        speak(`اب کا وقت ${timeStr} ہے`);
        setAssistantHint(`Current time: ${timeStr}`);
      } else {
        // Fallback to English pronunciation
        const englishTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        speak(`Current time is ${englishTime}`);
        setAssistantHint(`Current time: ${timeStr}`);
      }
      return true;
    }
    
    if (normalizedText.includes('aaj kaun sa din hai') || 
        normalizedText.includes('aaj kya din hai')) {
      
      const dayStr = now.toLocaleDateString('ur-PK', { weekday: 'long' });
      
      if (hasUrduVoice) {
        speak(`آج ${dayStr} ہے`);
        setAssistantHint(`Today is ${dayStr}`);
      } else {
        // Fallback to English pronunciation
        const englishDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        speak(`Today is ${englishDay}`);
        setAssistantHint(`Today is ${dayStr}`);
      }
      return true;
    }
    
    return false;
  };

  const tryHandleCommand = (raw) => {
    if (isProcessing) return false;
    setIsProcessing(true);
    
    const t = normalize(raw);
    console.log("Processing command:", t); // For debugging

    // First check if it's a stop command
    if (t.match(/^(stop|quit|exit|goodbye|ruk ja|band karo|khatam karo|bas|rukho)$/i)) {
      setListening(false);
      recognitionRef.current?.stop();
      setAssistantHint('Jarvis stopped');
      speak('Take care. Good Bye');
      setIsProcessing(false);
      return true;
    }

    // Handle date/time queries
    if (handleDateTimeQuery(t)) {
      setIsProcessing(false);
      return true;
    }

    // Handle introduction
    if (t.match(/^(who are you|what is your purpose|introduce yourself|tum kaun ho|tumhara kaam kya hai|tumhara maqsad kia ha|tumhara purpose kia ha)$/i)) {
      speak('I am Jarvis. I am your personal assistant for this chat application, developed by Hafiz Abdul Hannan.');
      setAssistantHint('Introduced myself');
      setIsProcessing(false);
      return true;
    }
    
    if (t.match(/^(what is the nickname of developer?|hafiz abdul hannan ka nickname kia ha?)$/i)) {
      speak('Nickname of Hafiz Abdul Hannan is hah');
      setAssistantHint('Introduced Developer');
      setIsProcessing(false);
      return true;
    }

    const openMatch = t.match(/^(open|go\s*to|open\s*chat\s*with|kholo|khologe|khol)\s+(.+)$/i);
    if (openMatch) {
      const name = openMatch[2];
      const user = bestUserByName(name);
      if (!user) { 
        speak('Contact not found'); 
        setAssistantHint('Contact not found'); 
        setIsProcessing(false);
        return true; 
      }
      setActiveUser(user);
      if (isMobileView) setShowContacts(false);
      speak(`Opened chat with ${user.name || 'contact'}`);
      setAssistantHint(`Opened ${user.name}`);
      setIsProcessing(false);
      return true;
    }

    const emojiMatch = t.match(/^send\s+(?:a\s+)?(.+?)\s+emoji\s+to\s+(.+)$/i) ||
                       t.match(/^send\s+(.+?)\s+emoji\s+to\s+(.+)$/i) ||
                       t.match(/^(.+?)\s+ko\s+(.+?)\s+emoji\s+(bhej\s*do|send|bhej)$/i) ||
                       t.match(/^(.+?)\s+emoji\s+(.+?)\s+ko\s+bhej\s*do$/i);

    if (emojiMatch) {
      let emojiName, contactName;
      if (t.includes('ko')) { 
        if (t.match(/^.+\s+ko\s+.+\s+emoji/)) {
          contactName = emojiMatch[1]; 
          emojiName = emojiMatch[2]; 
        } 
        else {
          emojiName = emojiMatch[1]; 
          contactName = emojiMatch[2]; 
        }
      }
      else { 
        emojiName = emojiMatch[1]; 
        contactName = emojiMatch[2]; 
      }

      const user = bestUserByName(contactName);
      if (!user) { 
        speak('Contact not found'); 
        setAssistantHint('Contact not found'); 
        setIsProcessing(false);
        return true; 
      }

      const emoji = getEmojiByName(emojiName);
      if (emoji) { 
        sendByAssistant(user, emoji); 
        speak(`${emojiName} emoji sent to ${user.name || 'contact'}`); 
        setIsProcessing(false);
        return true; 
      }
      else { 
        speak('Emoji not found. Try common names like happy, sad, heart, or thumbs up'); 
        setAssistantHint('Emoji not recognized'); 
        setIsProcessing(false);
        return true; 
      }
    }

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
      if (t.includes('ko')) {
        name = m[1];
        text = m[2];
      } else {
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
      if (!user) { 
        speak('Contact not found'); 
        setAssistantHint('Contact not found'); 
        setIsProcessing(false);
        return true; 
      }
      sendByAssistant(user, text);
      setIsProcessing(false);
      return true;
    }

    const onlyName = t.match(/^(.+?)\s*(ko|chat|message|kholo|khol)?$/i);
    if (onlyName && onlyName[1].length > 2) {
      const user = bestUserByName(onlyName[1]);
      if (user) {
        setActiveUser(user);
        if (isMobileView) setShowContacts(false);
        speak(`Opened chat with ${user.name || 'contact'}`);
        setAssistantHint(`Opened ${user.name}`);
        setIsProcessing(false);
        return true;
      }
    }

    setAssistantHint('Command not recognized. Try: "send message to [name] saying [message]" or "send happy emoji to [name]"');
    setIsProcessing(false);
    return false;
  };

  const sendByAssistant = (user, text) => {
    socket.emit('message:send', { to: user._id, text }, () => {});
    setActiveUser(user);
    if (isMobileView) setShowContacts(false);
    speak('Message sent successfully.');
    setAssistantHint(`Message sent to ${user.name}: "${text}"`);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchText.toLowerCase()) 
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
            {/* Jarvis button in search box for mobile */}
            {isMobileView && (
              <button
                onClick={toggleListening}
                className={`jarvis-button mobile-jarvis-button ${listening ? 'listening' : ''}`}
                title={listening ? 'Stop Jarvis' : 'Start Jarvis'}
                disabled={recognizing || isProcessing}
              >
                {listening ? '🛑 Stop' : '🤖 Jarvis'}
              </button>
            )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowProfile(u);
                    }}
                    style={{cursor: 'pointer'}}
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

            {/* Jarvis controls - hidden on mobile since it's in the search box */}
            {!isMobileView && (
              <div className="header-right">
                <select 
                  value={assistantLang} 
                  onChange={(e) => setAssistantLang(e.target.value)}
                  className="language-select"
                >
                  <option value="en-US">English</option>
                  <option value="ur-PK">Urdu</option>
                </select>
                <button
                  onClick={toggleListening}
                  className={`jarvis-button ${listening ? 'listening' : ''}`}
                  title={listening ? 'Stop Jarvis' : 'Start Jarvis'}
                >
                  {listening ? '🛑 Stop' : '🤖 Jarvis'}
                </button>
              </div>
            )}
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
                {isProcessing && <span className="processing-indicator"> (Processing...)</span>}
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
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                    e.target.value = '';
                  }}
                  accept="*/*"
                />
                
                <button
                  onClick={() => document.getElementById('file-upload').click()}
                  className="file-button"
                  title="Attach file"
                  disabled={uploadingFile || !activeUser}
                >
                  {uploadingFile ? '📤' : '📎'}
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
                    placeholder="Type here ..."
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

      {showProfileDetails && (
        <div className="profile-modal-overlay" onClick={handleCloseProfile}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>Profile Details</h3>
              <button className="close-button" onClick={handleCloseProfile}>×</button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-avatar-large">
                <img
                  src={showProfileDetails.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${showProfileDetails._id}`}
                  alt={showProfileDetails.name}
                />
              </div>
              <div className="profile-details">
                <h4>{showProfileDetails.name || 'User'}</h4>
                {showProfileDetails.bio && (
                  <p className="profile-bio">{showProfileDetails.bio}</p>
                )}
                {showProfileDetails.phone && (
                  <p className="profile-phone">📞 {showProfileDetails.phone}</p>
                )}
                <div className="profile-status">
                  {showProfileDetails.online ? (
                    <span className="online-status">🟢 Online</span>
                  ) : (
                    <span className="offline-status">
                      Last seen {showProfileDetails.lastSeen ? dayjs(showProfileDetails.lastSeen).fromNow() : 'a long time ago'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}