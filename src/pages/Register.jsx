import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await authApi.register({ name, email, password });
      toast.success(data.message || "Registered! Check your email to verify.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (e) {
      const msg = e?.response?.data?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
    }
  };

  // Custom BaatCheet Logo SVG
  const BaatCheetLogo = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="#2563eb" />
      <circle cx="35" cy="40" r="8" fill="white" />
      <circle cx="65" cy="40" r="8" fill="white" />
      <path
        d="M30 65 Q50 75 70 65"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M25 30 L15 20 M75 30 L85 20"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        padding: "20px",
        width: "90%",
      }}
    >
      {/* Toastify container - yeh important hai */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* Logo + App Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.3)",
            }}
          >
            <BaatCheetLogo />
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2563eb",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            BaatCheet
          </h2>
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Create your account
        </h1>
        <p style={{ 
          color: "#6b7280", 
          marginBottom: "24px", 
          fontSize: "14px", 
          textAlign: "center" 
        }}>
          Join the conversation
        </p>

        {error && (
          <div style={{ 
            marginBottom: "16px", 
            color: "#e53e3e", 
            fontSize: "14px",
            backgroundColor: "#fed7d7",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "14px",
                color: "#6b7280",
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
              }}
            >
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "14px",
                color: "#6b7280",
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "14px",
                color: "#6b7280",
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Create a strong password"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "16px",
              marginTop: "10px",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#1d4ed8"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#2563eb"}
          >
            Create Account
          </button>
        </form>

        <p style={{ 
          marginTop: "20px", 
          fontSize: "14px", 
          textAlign: "center" 
        }}>
          Already have an account?{" "}
          <Link 
            to="/login" 
            style={{ 
              color: "#2563eb", 
              fontWeight: "600",
              textDecoration: "none",
            }}
            onMouseOver={(e) => e.target.style.textDecoration = "underline"}
            onMouseOut={(e) => e.target.style.textDecoration = "none"}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}