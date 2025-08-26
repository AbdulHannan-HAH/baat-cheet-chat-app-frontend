import { io } from "socket.io-client";

let socket;
export function getSocket() {
  if (!socket) {
    const backendUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:5000"
        : "https://baatcheet-backend-s5cs.onrender.com";

    socket = io(backendUrl, {
      autoConnect: true,
      auth: {
        token: localStorage.getItem("token"), // 👈 send token with handshake
      },
    });
  }
  return socket;
}
