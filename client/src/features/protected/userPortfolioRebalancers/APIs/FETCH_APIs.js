import { BASE_URL } from "../../../../constants/axiosInstance";

const getAuthConfig = (accessToken) => {
  if (!accessToken) {
    throw new Error("User session is missing");
  }

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

export const FETCH_REBALANCERLIST = async (accessToken) => {
  const response = await BASE_URL.get(
    "/portfolio/rebalancer/list",
    getAuthConfig(accessToken),
  );

  return response.data;
};

export const FETCH_REBALANCER = async (accessToken, rebalancerId) => {
  if (!rebalancerId) {
    throw new Error("Rebalancer id is missing");
  }

  const response = await BASE_URL.get(
    `/portfolio/rebalancer/${rebalancerId}`,
    getAuthConfig(accessToken),
  );

  return response.data;
};
