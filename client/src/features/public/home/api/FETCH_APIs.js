import { BASE_URL } from "../../../../constants/axiosInstance";

export const FETCH_MARKETGLANCE = async () => {
  const response = await BASE_URL.get("/defaultmetadata");
  return response.data.data;
};

export const FETCH_TODAYS_MARKETS = async () => {
  const response = await BASE_URL.get("/top/securities");
  return response.data.data;
};
