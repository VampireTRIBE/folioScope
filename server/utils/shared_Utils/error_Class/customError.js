class customError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "customError";
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = customError;
