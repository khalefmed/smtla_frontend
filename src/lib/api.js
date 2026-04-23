import axios from "axios";

// export const BACKEND_BASE_URL = "http://127.0.0.1:8000/api/";
// export const BACKEND_BASE_URL = "https://nineoumar.pythonanywhere.com/api/";
export const BACKEND_BASE_URL = "https://api.smtla-sa.com/api/";
// export const BACKEND_BASE_URL = "https://nineoumar.pythonanywhere.com/api/";

export const api = axios.create({
  timeout: 50000,
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response && error.response.status === 401 && error.config.url !== "connexion/") {
      window.location.href = "/deconnexion"; 
    }
    
    return Promise.reject(error);
  }
);