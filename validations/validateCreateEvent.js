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
  date: Joi.number()
    .integer()
    .messages({
      "number.base": "Date must be an integer.",
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
