module.exports.normalizeToCurrentFinancialYear = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const fyYear = now.getUTCMonth() < 3 ? year - 1 : year;
  return new Date(Date.UTC(fyYear, 3, 1, 10, 0, 0));
};

module.exports.normalizeToISTMidnight = (date = null) => {
  const d = new Date(date);
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  if (Number.isNaN(d.getTime())) {
    return new Date(NaN);
  }

  const istTime = new Date(d.getTime() + IST_OFFSET_MS);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  // IST midnight = UTC previous day 18:30.
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0) - IST_OFFSET_MS);
};

module.exports.normalizeToISTEndOfDay = (inputDate) => {
  const date = new Date(inputDate);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  return new Date(Date.UTC(year, month, day, 18, 29, 59, 999));
};

module.exports.normalizeToIST5PM = (inputDate) => {
  const date = new Date(inputDate);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  return new Date(Date.UTC(year, month, day, 11, 30, 0));
};

module.exports.normalizeToIST330PM = (inputDate) => {
  const date = new Date(inputDate);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  return new Date(Date.UTC(year, month, day, 10, 0, 0));
};