import { BASE_URL } from "../../../../constants/axiosInstance";

export const POST_SENDOTPEMAIL = async (data) => {
  const response = await BASE_URL.post("/forgotpassword", data);
  return response.data;
};
