import { BASE_URL } from "../../../../constants/axiosInstance";

export const POST_LOGOUT = async (accessToken) => {
  const response = await BASE_URL.get("/logoutuser", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const POST_LOGOUTALL = async (accessToken) => {
  const response = await BASE_URL.get("/logoutalluser", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
