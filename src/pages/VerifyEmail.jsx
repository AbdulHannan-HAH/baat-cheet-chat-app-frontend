import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import  api  from "../lib/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("Invalid link");
      return;
    }
    (async () => {
      try {
        await api.get(`/auth/verify?token=${token}`);
        setStatus("Email verified! You can login now.");
        setTimeout(() => nav("/login"), 1500);
      } catch {
        setStatus("Verification failed or link expired.");
      }
    })();
  }, []);

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
          }}
        >
          Verify Email
        </h1>
        <p style={{ marginBottom: "16px" }}>{status}</p>
        <Link
          to="/login"
          style={{
            display: "inline-block",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
