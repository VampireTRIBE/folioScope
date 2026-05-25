import { BASE_URL } from "../../../../constants/axiosIntance";

export const POST_VERIFYEMAIL = async (token) => {
  const response = await BASE_URL.post(
    "/verifyemail",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
