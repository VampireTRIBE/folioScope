const axios = require("axios");
const customError = require("../../utils/shared/error/customError");

module.exports.callAppsScript = async (
  BASE_URL,
  API_KEY,
  action,
  data = null,
) => {
  try {
    const res = await axios.post(BASE_URL, {
      apiKey: API_KEY,
      action,
      data,
    });
    if (res.data?.error) {
      throw new customError(res.data.error, 400);
    }
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.error || err.response?.data?.details || err.message;
    throw new customError(message, err.response?.status || 500);
  }
};
