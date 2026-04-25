module.exports.statusCode = {
  200: { message: "OK", success: true, retryable: false, category: "success" },
  201: {
    message: "Created",
    success: true,
    retryable: false,
    category: "success",
  },
  202: {
    message: "Accepted",
    success: true,
    retryable: true,
    category: "success",
  },
  204: {
    message: "No Content",
    success: true,
    retryable: false,
    category: "success",
  },

  400: {
    message: "Bad Request",
    success: false,
    retryable: false,
    category: "client",
  },
  401: {
    message: "Unauthorized",
    success: false,
    retryable: false,
    category: "client",
  },
  403: {
    message: "Forbidden",
    success: false,
    retryable: false,
    category: "client",
  },
  404: {
    message: "Not Found",
    success: false,
    retryable: false,
    category: "client",
  },
  409: {
    message: "Conflict",
    success: false,
    retryable: true,
    category: "client",
  },
  422: {
    message: "Unprocessable Entity",
    success: false,
    retryable: false,
    category: "client",
  },
  429: {
    message: "Too Many Requests",
    success: false,
    retryable: true,
    category: "client",
  },

  500: {
    message: "Internal Server Error",
    success: false,
    retryable: true,
    category: "server",
  },
  502: {
    message: "Bad Gateway",
    success: false,
    retryable: true,
    category: "server",
  },
  503: {
    message: "Service Unavailable",
    success: false,
    retryable: true,
    category: "server",
  },
  504: {
    message: "Gateway Timeout",
    success: false,
    retryable: true,
    category: "server",
  },
};
