import axios from "axios";
const hostname = window.location.hostname;

export const BASE_URL = axios.create({
  baseURL: `http://${hostname}:3000`,
});

export const BASE_URL_withCredentials = axios.create({
  baseURL: `http://${hostname}:3000`,
  withCredentials: true,
});
