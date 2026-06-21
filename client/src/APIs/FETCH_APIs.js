import { BASE_URL, BASE_URL_withCredentials } from "../constants/axiosInstance";

export const POST_TOKENROTATION = async () => {
  const response = await BASE_URL_withCredentials.post("/refreshtoken");
  return response.data;
};

export const FETCH_SECURITIESLIST = async () => {
  const response = await BASE_URL.get("/allsecuritieslist");
  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Failed to fetch securities list",
    );
  }
  return response.data.data;
};
