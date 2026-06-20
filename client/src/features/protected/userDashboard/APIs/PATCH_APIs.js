import { BASE_URL } from "../../../../constants/axiosInstance";

export const PATCH_UPDATEGROUPFORM = async ({ accessToken, groupId, data }) => {
  if (!accessToken || !groupId) {
    throw new Error("Group context is missing");
  }

  const response = await BASE_URL.patch(`/portfolio/${groupId}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
