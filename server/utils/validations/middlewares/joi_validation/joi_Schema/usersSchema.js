const Joi = require("joi");

module.exports.newUserRegisteration_joi_Schema = Joi.object({
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

  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password cannot exceed 128 characters",
  }),

  role: Joi.string().valid("client").default("client").messages({
    "any.only": "Role must be client",
  }),
  isActive: Joi.boolean().default(true),
}).required();

module.exports.authValidationSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),

  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password cannot exceed 128 characters",
  }),
});
