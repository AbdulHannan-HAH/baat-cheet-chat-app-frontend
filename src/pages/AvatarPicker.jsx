import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';

const initials = (name='User') => name.split(' ').map(w=>w[0]).join('').slice(0,2) || 'U';

export default function AvatarPicker(){
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const seedBase = useMemo(() => initials(user?.name || 'User'), [user]);
  const [selected, setSelected] = useState('');

  const options = useMemo(() => {
    const styles = ['identicon','thumbs','bottts','adventurer','shapes','pixel-art','beam','fun-emoji','croodles','open-peeps','rings'];
    return styles.map((s,i)=>`https://api.dicebear.com/8.x/${s}/svg?seed=${seedBase}${i}`);
  }, [seedBase]);

  const save = async () => {
    if (!selected) return alert('Select an avatar');
    try {
      const { data } = await authApi.updateAvatar(selected);
      setUser(data.user);
      nav('/dashboard');
    } catch {
      alert('Failed to save avatar');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🎭 Pick Your Avatar</h1>
        <p className="subtitle">Choose one and continue to your dashboard.</p>
        
        <div className="grid">
          {options.map((url)=> (
            <button 
              key={url} 
              onClick={()=>setSelected(url)} 
              className={`avatar-btn ${selected===url? 'selected' : ''}`}>
              <img src={url} alt="avatar" />
            </button>
          ))}
        </div>
        
        <div className="actions">
          <button onClick={save} className="btn-primary">Continue</button>
          <button onClick={()=>nav(-1)} className="btn-ghost">Back</button>
        </div>
        <p className="note">✨ You can change this later in Profile settings.</p>
      </div>

      <style>{`
        .container {
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        .card {
          max-width: 1000px;
          width: 100%;
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
          text-align: center;
          color: #111827;
        }
        .subtitle {
          color: #6b7280;
          margin-bottom: 24px;
          text-align: center;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 16px;
        }
        .avatar-btn {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          background: #fafafa;
        }
        .avatar-btn:hover {
          transform: translateY(-4px);
          border-color: #60a5fa;
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }
        .avatar-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .avatar-btn.selected {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #93c5fd;
          transform: scale(1.05);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 28px;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
        }
        .btn-ghost {
          background: transparent;
          color: #374151;
          padding: 12px 20px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-ghost:hover {
          background: #f9fafb;
          transform: translateY(-2px);
        }
        .note {
          font-size: 13px;
          color: #6b7280;
          margin-top: 16px;
          text-align: center;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .card {
            padding: 16px;
          }
          h1 {
            font-size: 1.5rem;
          }
          .grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
          }
          .btn-primary, .btn-ghost {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
