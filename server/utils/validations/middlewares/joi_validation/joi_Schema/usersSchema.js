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

module.exports.changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(128).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 6 characters",
    "string.max": "New password cannot exceed 128 characters",
    "any.required": "New password is required",
  }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "string.empty": "Confirm password is required",
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
});

module.exports.emailSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
});

module.exports.otpSchema = Joi.object({
  otp: Joi.string().max(6).min(6).required().messages({
    "string.base": "otp must be a string",
    "string.empty": "otp is required",
    "string.max": "otp must be 6 digit",
    "string.min": "otp must be 6 digit",
  }),
});
