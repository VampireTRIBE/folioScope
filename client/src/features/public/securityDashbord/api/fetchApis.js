import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_SECURITYOVERVIEW = async (securityID) => {
  const response = await baseURL.get(`/security/${securityID}`);
  return response.data.data;
};
