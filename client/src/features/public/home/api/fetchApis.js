import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_MARKETGLANCE = async () => {
  const response = await baseURL.get("/defaultmetadata");
  return response.data.data;
};
