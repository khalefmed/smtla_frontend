import axios from "axios";

// export const BACKEND_BASE_URL = "http://127.0.0.1:8000/api/";
// export const BACKEND_BASE_URL = "https://nineoumar.pythonanywhere.com/api/";
export const BACKEND_BASE_URL = "https://nineoumar.pythonanywhere.com/api/";

const token = window.localStorage.getItem("token")
export const api = axios.create({
  timeout: 50000,
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization" : `Bearer ${token}`

  },
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);
