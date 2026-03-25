module.exports.parseISODate = async (dateStr) => {
  if (typeof dateStr !== "string") {
    throw new Error("Date must be a string");
  }
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  if (!isoRegex.test(dateStr)) {
    throw new Error("Invalid ISO format");
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }
  if (date.toISOString() !== dateStr) {
    throw new Error("Invalid or tampered date");
  }
  return date;
};
