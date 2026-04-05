module.exports.getCurrentFinancialDate = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const fyYear = now.getUTCMonth() < 3 ? year - 1 : year;
  return new Date(Date.UTC(fyYear, 2, 31, 18, 30, 0));
};