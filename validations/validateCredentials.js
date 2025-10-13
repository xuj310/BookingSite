const Joi = require("joi");

const loginUserSchema = Joi.object({
  email: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must not exceed 50 characters.",
    })
    .required(),
  password: Joi.string()
    .min(6)
    .max(30)
    .messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.max": "Password must not exceed 30 characters.",
    })
    .required(),
});

const validateCredentials = (req, res, next) => {
  const { error } = loginUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateCredentials;
