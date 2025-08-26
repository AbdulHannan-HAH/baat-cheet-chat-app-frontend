import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../lib/api";

export default function ProfilePopup({ isOpen, onClose }) {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef(null);

  // Load user details when popup opens
  useEffect(() => {
    if (isOpen) {
      loadUserDetails();
    }
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const { data } = await profileApi.get();
      
      if (data.success && data.user) {
        setUserDetails(data.user);
      }
    } catch (err) {
      console.error("Failed to load user details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div ref={popupRef} style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            Profile Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div>Loading...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src={userDetails?.avatarUrl || "/default-avatar.png"}
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #e5e7eb'
                }}
              />
            </div>

            {/* User Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Full Name
                </label>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}>
                  {userDetails?.name || 'Not set'}
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Email Address
                </label>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}>
                  {userDetails?.email || 'Not set'}
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Phone Number
                </label>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}>
                  {userDetails?.phone || 'Not set'}
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Bio
                </label>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  minHeight: '60px'
                }}>
                  {userDetails?.bio || 'No bio yet'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                Last updated: {userDetails?.updatedAt ? new Date(userDetails.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}