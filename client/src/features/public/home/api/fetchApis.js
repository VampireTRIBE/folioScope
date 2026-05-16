import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_MARKETGLANCE = async () => {
  const response = await baseURL.get("/defaultmetadata");
  return response.data.data;
};


export const FETCH_TODAYS_MARKETS = async () => {
  const response = await baseURL.get("/top/securities");
  return response.data.data;
};



