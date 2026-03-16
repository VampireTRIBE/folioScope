const ISIN_REGEX = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

function validateISIN(isin) {
  if (!ISIN_REGEX.test(isin)) return false;
  let converted = "";
  for (let char of isin) {
    if (isNaN(char)) {
      converted += char.charCodeAt(0) - 55;
    } else {
      converted += char;
    }
  }
  let sum = 0;
  let shouldDouble = true;
  for (let i = converted.length - 1; i >= 0; i--) {
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
