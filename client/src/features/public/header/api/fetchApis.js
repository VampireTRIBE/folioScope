import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_SECURITIESLIST = async () => {
  const response = await baseURL.get("/allsecuritieslist");
  return response.data.data;
};
