import baseURL from "../constants/apiEndpoints";

export const FETCH_RANGEPRICE = async (securityID, range = null) => {
  if (!range) {
    const response = await baseURL.get(`/price/${securityID}`);
    return response.data.data;
  }
  const response = await baseURL.get(`/price/${securityID}?range=${range}`);
  return response.data.data;
};
