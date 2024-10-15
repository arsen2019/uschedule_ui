import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8000"
console.log({API_URL})
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});