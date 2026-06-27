import { BASE_URL } from "../../../../constants/axiosInstance";

export const POST_NEWREBALANCER = async ({ accessToken, data }) => {
  if (!accessToken) {
    throw new Error("User session is missing");
  }

  const response = await BASE_URL.post("/portfolio/rebalancer/new", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
