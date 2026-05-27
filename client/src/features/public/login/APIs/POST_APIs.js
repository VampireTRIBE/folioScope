import { BASE_URL } from "../../../../constants/axiosIntance";

export const POST_LOGINFORM = async (data) => {
  const response = await BASE_URL.post("/login", data);
  return response.data;
};
