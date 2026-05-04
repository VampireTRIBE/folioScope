import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_SECURITIESLIST = async () => {
  try {
    const response = await baseURL.get("/allsecuritieslist");
    return response.data.data;
  } catch (error) {
    console.error("FETCH_SECTION ERROR:", error);
    return [];
  }
};
