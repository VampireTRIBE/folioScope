var cors = require("cors");
var corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin || 
      origin.startsWith("http://192.168.") || 
      origin.startsWith("http://localhost:5173")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PUT, PATCH, DELETE", 
  credentials: true,
};

const corsAuth = {
  async corAuth(app) {
    app.use(cors(corsOptions));
  },
};
module.exports = corsAuth;
