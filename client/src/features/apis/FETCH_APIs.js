import { BASE_URL } from "../../constants/axiosInstance";

export const FETCH_RANGEPRICE = async (securityID, range = null) => {
  if (!range) {
    const response = await BASE_URL.get(`/price/security/${securityID}`);
    return response.data.data;
  }
  const response = await BASE_URL.get(
    `/price/security/${securityID}?range=${range}`,
  );
  return response.data.data;
};

export const FETCH_RANGENAVGROUP = async (
  groupID,
  accessToken = null,
  range = null,
) => {
  if (!range) {
    const response = await BASE_URL.get(`/price/group/${groupID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  }
  const response = await BASE_URL.get(
    `/price/group/${groupID}?range=${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data.data;
};

export const FETCH_USERDETAILS = async (accessToken) => {
  const response = await BASE_URL.get(`/userdetails`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const FETCH_GROUPDRAWDOWN = async (groupId, accessToken) => {
  const response = await BASE_URL.get(`/analytic/drawdown/group/${groupId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data.data;
};
