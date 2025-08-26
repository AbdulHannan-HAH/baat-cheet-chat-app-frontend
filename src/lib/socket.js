// src/utils/socket.js (ya jahan tum rakhtay ho)
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    // agar development mode hai to localhost use karo
    const backendUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:5000"
        : "https://baatcheet-backend-s5cs.onrender.com";

    socket = io(backendUrl, {
      withCredentials: true, // cookies bhejne ke liye
      autoConnect: true,
    });
  }
  return socket;
}
