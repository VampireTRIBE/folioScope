import baseURL from "../../../../constants/apiEndpoints";

export const FETCH_SECTION1 = async () => {
  try {
    const response = await baseURL.get("/defaultmetadata");
    return response.data.data;
  } catch (error) {
    console.error("FETCH_SECTION ERROR:", error);
    return [];
  }
};
