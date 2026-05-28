import { BASE_URL } from "../../../../constants/axiosIntance";

export const POST_CHANGEPASSWORD = async ({ email, data }) => {
  const response = await BASE_URL.post(`/confirmpassword/${email}`, {
    ...data,
  });
  return response.data;
};
