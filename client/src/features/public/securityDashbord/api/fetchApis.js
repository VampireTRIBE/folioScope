import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_SECURITYOVERVIEW = async (securityID) => {
  const response = await baseURL.get(`/security/${securityID}`);
  return response.data.data;
};

export const FETCH_SECURITYDRAWDOWN = async (securityID) => {
  const response = await baseURL.get(`/analytic/drawdown/${securityID}`);
  return response.data.data;
};
