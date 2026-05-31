import { BASE_URL_withCredentials } from "../../../../constants/axiosIntance";

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

export const POST_SENDVERIFICATIONEMAIL = async (data) => {
  const response = await BASE_URL_withCredentials.post(
    "/sendverificationemail",
    data,
  );
  return response.data;
};
