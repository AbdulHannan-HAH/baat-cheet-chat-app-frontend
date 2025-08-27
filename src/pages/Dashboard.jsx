import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Dashboard.css"; // We'll create this CSS file

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("features");

  useEffect(() => {
    if (user && !user.avatarUrl) nav("/avatar-picker");
  }, [user]);

  // App features data
  const features = [
    {
      icon: "🤖",
      title: "Jarvis Voice Assistant",
      description: "Control the app with voice commands in both English and Urdu"
    },
    {
      icon: "🖼️",
      title: "Image and Videos Sharing",
      description: "Easily share your images and videos with friends"
    },
    {
      icon: "😊",
      title: "Emoji Reactions",
      description: "Express yourself with a wide range of emojis"
    },
    {
      icon: "🌐",
      title: "Multi-Language Support",
      description: "Switch between English and Urdu seamlessly"
    },
    {
      icon: "📱",
      title: "Responsive Design",
      description: "Works perfectly on desktop, tablet, and mobile"
    },
    {
      icon: "🔒",
      title: "Secure Messaging",
      description: "Your conversations are private and encrypted"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Hello, {user?.name} 👋</h1>
          <p>Welcome to your personal messaging hub</p>
        </div>
        <div className="avatar-section">
          <Avatar name={user?.name} src={user?.avatarUrl} size={60} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === "features" ? "active" : ""}`}
          onClick={() => setActiveTab("features")}
        >
          <i className="fas fa-star"></i>
          App Features
        </button>
        <button 
          className={`tab ${activeTab === "developer" ? "active" : ""}`}
          onClick={() => setActiveTab("developer")}
        >
          <i className="fas fa-code"></i>
          Developer
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {activeTab === "features" && (
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "developer" && (
          <div className="developer-card">
            <div className="developer-header">
              <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=hafiz&backgroundColor=4f46e5" 
                alt="Developer" 
                className="developer-avatar"
              />
              <div className="developer-info">
                <h2>Hafiz Abdul Hannan</h2>
                <p>Full Stack Developer</p>
              </div>
            </div>
            <div className="developer-bio">
              <p>
                Passionate about creating innovative web applications with modern technologies. 
                This chat application showcases skills in React, Node.js, WebSockets, and voice recognition.
              </p>
            </div>
            <div className="developer-skills">
              <h3>Technologies Used</h3>
              <div className="skills-list">
                <span className="skill-tag">React</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">WebSockets</span>
                <span className="skill-tag">MongoDB</span>
                <span className="skill-tag">Speech Recognition</span>
                <span className="skill-tag">CSS3</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Go to Chats Button */}
      <div className="action-buttons">
        <button 
          className="go-to-chats-btn"
          onClick={() => nav("/chat")}
        >
          <i className="fas fa-comments"></i>
          Go to Chats
        </button>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2023 ChatApp. Built with ❤️ by Hafiz Abdul Hannan</p>
      </footer>
    </div>
  );
}
