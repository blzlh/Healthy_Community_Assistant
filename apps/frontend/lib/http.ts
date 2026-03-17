import axios from "axios";

export const http = axios.create({
  baseURL: "",
  headers: {
    "content-type": "application/json",
  },
});

export const serverHttp = axios.create({
  baseURL: process.env.BACKEND_BASE_URL ?? "http://localhost:3001",
  headers: {
    "content-type": "application/json",
  },
});
