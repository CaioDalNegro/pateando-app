// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://10.110.12.20:8080",
});

export default api;
