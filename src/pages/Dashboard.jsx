import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Dashboard.css"; 

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("features");

  useEffect(() => {
    if (user && !user.avatarUrl) nav("/avatar-picker");
  }, [user]);

  // Features data
  const features = [
    { icon: "🤖", title: "Jarvis Voice Assistant", description: "Control the app with voice commands in both English and Urdu" },
    { icon: "🖼️", title: "Image and Videos Sharing", description: "Easily share your images and videos with friends" },
    { icon: "😊", title: "Emoji Reactions", description: "Express yourself with a wide range of emojis" },
    { icon: "🌐", title: "Multi-Language Support", description: "Switch between English and Urdu seamlessly" },
    { icon: "📱", title: "Responsive Design", description: "Works perfectly on desktop, tablet, and mobile" },
    { icon: "🔒", title: "Secure Messaging", description: "Your conversations are private and encrypted" }
  ];

  // Initial Reviews
  const [reviews, setReviews] = useState([
    {
      name: "Ali Raza",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
      feedback: "Jarvis voice assistant is amazing! Urdu commands bhi perfectly samajhta hai 👏",
      rating: 5
    },
    {
      name: "Sara Khan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
      feedback: "Simple aur responsive design, mujhe mobile par bohot easy lagta hai.",
      rating: 4
    }
  ]);

  // Form states
  const [reviewName, setReviewName] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Add Review Handler
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewName || !reviewFeedback) return;

    const newReview = {
      name: reviewName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewName}`,
      feedback: reviewFeedback,
      rating: reviewRating
    };

    setReviews([newReview, ...reviews]);
    setReviewName("");
    setReviewFeedback("");
    setReviewRating(5);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Hello, {user?.name} 👋</h1>
          <p>Welcome to your personal messaging hub</p>
        </div>
        <div className="avatar-section">
          <Avatar name={user?.name} src={user?.avatarUrl} size={60} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab ${activeTab === "features" ? "active" : ""}`} onClick={() => setActiveTab("features")}>
          <i className="fas fa-star"></i> App Features
        </button>
        <button className={`tab ${activeTab === "developer" ? "active" : ""}`} onClick={() => setActiveTab("developer")}>
          <i className="fas fa-code"></i> Developer
        </button>
        <button className={`tab ${activeTab === "manual" ? "active" : ""}`} onClick={() => setActiveTab("manual")}>
          <i className="fas fa-book"></i> User Manual
        </button>
        <button className={`tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
          <i className="fas fa-comments"></i> Reviews
        </button>
      </div>

      {/* Content */}
      <div className="content-area">
        {/* Features */}
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

        {/* Developer */}
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

        {/* User Manual */}
        {activeTab === "manual" && (
          <div className="manual-card">
            <h2>📖 How to use Jarvis</h2>
            <p>Jarvis is your AI voice assistant. You can give commands in both <b>English</b> and <b>Urdu</b>.</p>

            <div className="manual-section">
              <h3>🔍 Open Chats</h3>
              <ul>
                <li><b>English:</b> "Open Babar Azam chat"</li>
                <li><b>Urdu:</b> "Babar Azam ki chat kholo"</li>
              </ul>
            </div>

            <div className="manual-section">
              <h3>💬 Send Messages</h3>
              <ul>
                <li><b>English:</b> "Send message to Ali"</li>
                <li><b>Urdu:</b> "Ali ko message bhejo"</li>
              </ul>
            </div>

            <div className="manual-section">
              <h3>📅 Date & Time</h3>
              <ul>
                <li><b>English:</b> "What is today’s date?" / "What time is it now?"</li>
                <li><b>Urdu:</b> "Aaj ki tareekh kya hai?" / "Abhi kitna time hua hai?"</li>
              </ul>
            </div>

            <div className="manual-section">
              <h3>😊 Emojis</h3>
              <ul>
                <li><b>English:</b> "Send happy emoji to Ali"</li>
                <li><b>Urdu:</b> "Ali ko khushi wala emoji bhejo"</li>
                <li><b>English:</b> "Send sad emoji to Ali"</li>
                <li><b>Urdu:</b> "Ali ko udaasi wala emoji bhejo"</li>
                <li><b>English:</b> "Send enjoy emoji to Ali"</li>
                <li><b>Urdu:</b> "Ali ko maze ka emoji bhejo"</li>
              </ul>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div>
            {/* Add Review Form */}
            <form className="review-form" onSubmit={handleAddReview}>
              <h3>Add Your Review</h3>
              <input
                type="text"
                placeholder="Your Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                required
              />
              <textarea
                placeholder="Your Feedback"
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                required
              ></textarea>
              <label>
                Rating: 
                <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                  <option value={5}>⭐️⭐️⭐️⭐️⭐️</option>
                  <option value={4}>⭐️⭐️⭐️⭐️</option>
                  <option value={3}>⭐️⭐️⭐️</option>
                  <option value={2}>⭐️⭐️</option>
                  <option value={1}>⭐️</option>
                </select>
              </label>
              <button type="submit">Submit Review</button>
            </form>

            {/* Reviews List */}
            <div className="reviews-grid">
              {reviews.map((rev, idx) => (
                <div key={idx} className="review-card">
                 {/* <img src={rev.avatar} alt={rev.name} className="review-avatar" />*/}
                  <div className="review-content">
                    <h4>{rev.name}</h4>
                    <p>{rev.feedback}</p>
                    <div className="review-rating">
                      {"⭐".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Go to Chats */}
      <div className="action-buttons">
        <button className="go-to-chats-btn" onClick={() => nav("/chat")}>
          <i className="fas fa-comments"></i> Go to Chats
        </button>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2025 BaatCheet. Built with ❤️ by Hafiz Abdul Hannan</p>
      </footer>
    </div>
  );
}
