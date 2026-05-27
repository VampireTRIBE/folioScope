import { BASE_URL } from "../../../../constants/axiosIntance";

export const POST_SENDVERIFICATIONEMAIL = async (data) => {
  const response = await BASE_URL.post("/sendverificationemail", data);
  return response.data;
};
