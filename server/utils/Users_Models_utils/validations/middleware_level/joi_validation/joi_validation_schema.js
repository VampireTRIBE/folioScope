const Joi = require("joi");

const JoiValidation_Schema = {
  userRegistrationData_Validation: Joi.object({
    newUser: Joi.object({
      firstName: Joi.string().trim().max(50).required().messages({
        "string.base": "First name must be a string",
        "string.empty": "First name is required",
        "string.max": "First name cannot exceed 50 characters",
      }),

      lastName: Joi.string().trim().max(50).required().messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name is required",
        "string.max": "Last name cannot exceed 50 characters",
      }),

      email: Joi.string().trim().lowercase().email().required().messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
      }),
      username: Joi.string().alphanum().min(3).max(30).required().messages({
        "string.empty": "Username is required",
        "string.alphanum": "Username must only contain letters and numbers",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username cannot exceed 30 characters",
      }),

      role: Joi.string().valid("client", "admin").default("client").messages({
        "any.only": "Role must be either client or admin",
      }),

      isActive: Joi.boolean().default(true),
    }).required(),

    password: Joi.string().min(6).max(128).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 128 characters",
    }),
  }),
};

module.exports = JoiValidation_Schema;
