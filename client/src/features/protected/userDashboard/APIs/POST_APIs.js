import { BASE_URL } from "../../../../constants/axiosInstance";

export const POST_ADDGROUPFORM = async ({ accessToken, groupId, data }) => {
  if (!accessToken || !groupId) {
    throw new Error("Group context is missing");
  }
  const response = await BASE_URL.post(`/portfolio/${groupId}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const POST_GROUPTRANSACTION = async ({ accessToken, groupId, data }) => {
  if (!accessToken || !groupId) {
    throw new Error("Group context is missing");
  }
  const response = await BASE_URL.post(
    `/portfolio/${groupId}/grouptransaction`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};

export const POST_TRADETRANSACTION = async ({
  accessToken,
  groupId,
  a_id,
  data,
}) => {
  if (!accessToken || !groupId || !a_id) {
    throw new Error("Group context is missing");
  }
  const response = await BASE_URL.post(
    `/portfolio/${groupId}/trade/${a_id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};
