module.exports.validateParamsEmail = (paramName = "email") => {
  return async (req, res, next) => {
    try {
      const email = req.params?.[paramName]?.trim()?.toLowerCase();
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Invalid Request EMAIL",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Email Format",
        });
      }

      req.params[paramName] = email;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Email Validation Failed",
      });
    }
  };
};
