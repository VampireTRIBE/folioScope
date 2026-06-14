import { BASE_URL } from "../../../../constants/axiosInstance";

export const POST_VERIFYOTP = async ({ email, otp }) => {
  const response = await BASE_URL.post(`/verifyotp/${email}`, { otp });
  return response.data;
};
