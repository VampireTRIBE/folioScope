let cors = require("cors");
const customError = require("../utils/shared/error/customError");
let corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://localhost:5173")
    ) {
      callback(null, true);
    } else {
      callback(new customError("Not allowed by CORS", 403));
    }
  },
  methods: "GET, POST, PUT, PATCH, DELETE",
  credentials: true,
};

module.exports.corAuth = async (app) => {
  app.use(cors(corsOptions));
};
