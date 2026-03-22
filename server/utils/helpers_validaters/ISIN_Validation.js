const ISIN_REGEX = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

function validateISIN(isin) {
  if (!isin || typeof isin !== "string") return false;

  if (!ISIN_REGEX.test(isin)) return false;

  let converted = "";

  for (let char of isin) {
    if (/[A-Z]/.test(char)) {
      converted += char.charCodeAt(0) - 55;
    } else {
      converted += char;
    }
  }

  let sum = 0;
  let shouldDouble = converted.length % 2 === 0;

  for (let i = 0; i < converted.length; i++) {
    let digit = parseInt(converted[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

module.exports = validateISIN;