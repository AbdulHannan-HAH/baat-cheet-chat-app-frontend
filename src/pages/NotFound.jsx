import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "40px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        404
      </h1>
      <p style={{ marginBottom: "16px" }}>Page not found</p>
      <Link
        to="/"
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
        Go Home
      </Link>
    </div>
  );
}
