import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../lib/api";
import EmojiPicker from "emoji-picker-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const bioRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: ""
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const { data } = await profileApi.get();
        
        if (data.success && data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
            phone: data.user.phone || ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmojiSelect = (emojiData) => {
    const textarea = bioRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newBio = formData.bio.substring(0, start) + emojiData.emoji + formData.bio.substring(end);
    
    setFormData(prev => ({
      ...prev,
      bio: newBio
    }));

    // Set cursor position after inserted emoji
    setTimeout(() => {
      textarea.selectionStart = start + emojiData.emoji.length;
      textarea.selectionEnd = start + emojiData.emoji.length;
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      console.log("Saving profile data:", formData);
      
      const { data } = await profileApi.update(formData);
      
      if (data.success) {
        setUser(data.user);
        setMessage("Profile updated successfully!");
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await profileApi.uploadAvatar(formData);
      
      if (data.success) {
        setUser(data.user);
        setMessage("Avatar uploaded successfully!");
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.message || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "16px", 
        padding: "32px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
          Profile Settings
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px" }}>
          Manage your account information
        </p>

        {message && (
          <div style={{ 
            color: "green", 
            backgroundColor: "#f0fdf4",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "1px solid #bbf7d0"
          }}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div style={{ 
            color: "red", 
            backgroundColor: "#fef2f2",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "1px solid #fecaca"
          }}>
            ❌ {error}
          </div>
        )}

        {/* Avatar Section - Now on top for mobile */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", alignSelf: "flex-start" }}>
            Profile Picture
          </h3>
          
          <div style={{ marginBottom: "16px" }}>
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              marginBottom: "16px",
              border: "3px solid #e5e7eb",
              position: "relative"
            }}>
              <img
                src={user?.avatarUrl || "/default-avatar.png"}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              {uploading && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px"
                }}>
                  Uploading...
                </div>
              )}
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: "300px" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button
              onClick={triggerFileInput}
              disabled={uploading}
              style={{
                width: "100%",
                backgroundColor: uploading ? "#9ca3af" : "#2563eb",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: uploading ? "not-allowed" : "pointer",
                marginBottom: "12px"
              }}
            >
              {uploading ? "Uploading..." : "Upload New Avatar"}
            </button>
            
            <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
              JPG, PNG, GIF up to 5MB
            </p>
          </div>
        </div>

        {/* Profile Form - Now below avatar on mobile */}
        <div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  color: "#6b7280",
                  fontSize: "16px"
                }}
              />
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                Email cannot be changed
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Bio
                </label>
                <button
                  type="button"
                  onClick={toggleEmojiPicker}
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
              </div>
              
              {showEmojiPicker && (
                <div ref={emojiPickerRef} style={{ position: 'absolute', zIndex: 1000, marginTop: '5px' }}>
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    width={300}
                    height={400}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
              
              <textarea
                ref={bioRef}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                placeholder="Tell us about yourself... 😊"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  resize: "vertical",
                  fontFamily: "inherit",
                  marginTop: "5px"
                }}
              />
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                Click the smiley button to add emojis
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "16px"
                }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  backgroundColor: saving ? "#9ca3af" : "#2563eb",
                  color: "white",
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}