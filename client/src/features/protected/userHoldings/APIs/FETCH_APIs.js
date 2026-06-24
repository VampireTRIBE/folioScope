import { BASE_URL } from "../../../../constants/axiosInstance";

export const FETCH_USERSHOLDINGS = async ({ accessToken, data }) => {
  if (!accessToken || !data?.groupId) {
    throw new Error("Holdings group context is missing");
  }
  const response = await BASE_URL.post(`/portfolio/holdings`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
