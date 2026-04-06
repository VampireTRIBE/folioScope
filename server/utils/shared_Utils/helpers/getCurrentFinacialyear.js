module.exports.getCurrentFinancialDate = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const fyYear = now.getUTCMonth() < 3 ? year - 1 : year;
  return new Date(Date.UTC(fyYear, 2, 31, 18, 30, 0));
};

module.exports.toISTMidnight = (date=null) => {
  const d = new Date(date);
  const IST_OFFSET = 330;
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const ist = new Date(utc + IST_OFFSET * 60000);
  ist.setHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET * 60000);
};
