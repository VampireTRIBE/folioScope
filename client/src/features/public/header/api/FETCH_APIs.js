import { BASE_URL } from "../../../../constants/axiosInstance";

export const FETCH_SECURITIESLIST = async () => {
  const response = await BASE_URL.get("/allsecuritieslist");
  return response.data.data;
};
