import { BASE_URL_withCredentials } from "../../../../constants/axiosInstance";

export const POST_LOGOUT = async (accessToken) => {
  const response = await BASE_URL_withCredentials.post("/logoutuser", null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const POST_LOGOUTALL = async (accessToken) => {
  const response = await BASE_URL_withCredentials.post("/logoutalluser", null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
