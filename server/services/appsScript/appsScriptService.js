const axios = require("axios");
const customError = require("../../utils/errorClass/customError");

module.exports.callAppsScript = async (BASE_URL, API_KEY, action) => {
  try {
    const res = await axios.post(BASE_URL, {
      apiKey: API_KEY,
      action,
    });
    return res.data;
  } catch (err) {
    throw new customError(err.message, 500);
  }
};
