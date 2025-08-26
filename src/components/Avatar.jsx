export default function Avatar({ src, name, size = 36 }) {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid #ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e5e5e5",
    color: "#333",
    fontWeight: "bold",
    fontSize: size / 2.5,
  };

  return (
    <div style={avatarStyle}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span>{(name?.[0] || "U").toUpperCase()}</span>
      )}
    </div>
  );
}
