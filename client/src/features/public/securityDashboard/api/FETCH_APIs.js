import { BASE_URL } from "../../../../constants/axiosInstance";

export const FETCH_SECURITYOVERVIEW = async (securityID) => {
  const response = await BASE_URL.get(`/security/${securityID}`);
  return response.data.data;
};

export const FETCH_SECURITYDRAWDOWN = async (securityID) => {
  const response = await BASE_URL.get(`/analytic/drawdown/security/${securityID}`);
  return response.data.data;
};
