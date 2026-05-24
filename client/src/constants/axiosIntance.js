import axios from "axios";
const hostname = window.location.hostname;

const BASE_URL = axios.create({
  baseURL: `http://${hostname}:3000`,
});

const BASE_URL_withCredentials = axios.create({
  ...BASE_URL,
  withCredentials: true,
});

export { BASE_URL, BASE_URL_withCredentials };
