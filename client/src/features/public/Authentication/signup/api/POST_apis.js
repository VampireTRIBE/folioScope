import { BASE_URL } from "../../../../../constants/axiosInstance";

export const POST_SIGNUPFORM = async (data) => {
  const response = await BASE_URL.post("/signup", data);
  return response.data;
};
