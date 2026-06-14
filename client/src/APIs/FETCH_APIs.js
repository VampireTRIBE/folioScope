import { BASE_URL_withCredentials } from "../constants/axiosInstance";

export const POST_TOKENROTATION = async () => {
  const response = await BASE_URL_withCredentials.post("/refreshtoken");
  return response.data;
};
