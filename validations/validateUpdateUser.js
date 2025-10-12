const Joi = require("joi");

const updateUserSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string().min(3).max(50).messages({
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 50 characters.",
  }),
  phoneNum: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({ "string.pattern.base": "Phone number must have 10 digits." })
    .required(),
  age: Joi.number().integer().min(1).max(100).messages({
    "number.base": "Age must be a number.",
    "number.min": "Age must be at least 1.",
    "number.max": "Age must not exceed 100.",
  }),
  password: Joi.string().min(6).max(30).messages({
    "string.min": "Password must be at least 6 characters long.",
    "string.max": "Password must not exceed 30 characters.",
  })
});

const validateUpdateUser = (req, res, next) => {
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateUpdateUser;
