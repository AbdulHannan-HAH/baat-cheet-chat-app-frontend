import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  me: () => API.get("/auth/me"),
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  logout: () => API.post("/auth/logout"),
  updateAvatar: (avatarUrl) => API.post("/auth/avatar", { avatarUrl }), // Yeh line add karein
  resend: (email) => API.post("/auth/resend", { email }), // Yeh bhi add karein
};






export const chatApi = {
  users: () => API.get("/chat/users"),
  conversations: () => API.get("/chat/conversations"),
  // by user id (server will create conversation if needed)
  messagesByUser: (userId) => API.get(`/chat/messages-by-user/${userId}`),
  // fallback REST send
  send: (payload) => API.post(`/chat/send`, payload),
  // voice upload
  uploadVoice: async (blob) => {
    const fd = new FormData();
    fd.append("voice", blob, "voice.webm");
    return API.post("/chat/upload/voice", fd);
  },
};


export const profileApi = {
  get: () => API.get("/profile"),
  update: (data) => API.put("/profile", data),
  updateAvatar: (avatarUrl) => API.post("/profile/avatar", { avatarUrl }),
  uploadAvatar: (formData) => API.post("/profile/upload-avatar", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),



  
};
export default API;




