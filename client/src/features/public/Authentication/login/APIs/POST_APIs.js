import { BASE_URL_withCredentials } from "../../../../../constants/axiosInstance";

export const POST_LOGINFORM = async (data) => {
  const response = await BASE_URL_withCredentials.post("/login", data);
  return response.data;
};
