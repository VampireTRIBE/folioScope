import { BASE_URL } from "../../../../constants/axiosIntance";

export const FETCH_GROUPMETADATA = async (accessToken, gp_id = "null") => {
  const response = await BASE_URL.get(`/portfolio/${gp_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
