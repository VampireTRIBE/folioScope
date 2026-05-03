import axios from "axios";
const hostname = window.location.hostname;
const baseURL = axios.create({
  baseURL: `http://${hostname}:3000`,
  withCredentials: true,
});
export default baseURL;
