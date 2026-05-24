import { BASE_URL } from "../../constants/axiosIntance";

export const FETCH_RANGEPRICE = async (securityID, range = null) => {
  if (!range) {
    const response = await BASE_URL.get(`/price/${securityID}`);
    return response.data.data;
  }
  const response = await BASE_URL.get(`/price/${securityID}?range=${range}`);
  return response.data.data;
};


