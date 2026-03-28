const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = obj[prop];

    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
};

module.exports = { deepFreeze };
