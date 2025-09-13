const Joi = require("joi");

const createEventSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must not exceed 50 characters.",
    })
    .required(),
  description: Joi.string()
    .messages({
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must not exceed 255 characters.",
    })
    .required(),
  price: Joi.number()
    .integer()
    .min(1)
    .max(100000) // Cents, $1000
    .messages({
      "number.base": "Price must be an integer.",
      "number.min": "Age must be at least 1.",
      "number.max": "Age must not exceed 100.",
    })
    .required(),
});

const validateCreateEvent = (req, res, next) => {
  const { error } = createEventSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateCreateEvent;
