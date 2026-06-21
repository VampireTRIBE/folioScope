import { BASE_URL } from "../../../../constants/axiosInstance";

export const FETCH_GROUPMETADATA = async (accessToken, gp_id = "null") => {
  const response = await BASE_URL.get(`/portfolio/${gp_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const FETCH_XIRRCOMPARISION = async (accessToken, gp_id, indexId) => {
  const response = await BASE_URL.get(
    `/analytic/comparision/xirr/${gp_id}/${indexId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};

export const FETCH_NAVCOMPARISION = async (accessToken, gp_id, indexId) => {
  const response = await BASE_URL.get(
    `/analytic/comparision/nav/${gp_id}/${indexId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};
