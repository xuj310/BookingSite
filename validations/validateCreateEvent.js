const Joi = require("joi");

const createEventSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "Title is required.",
      "string.min": "Title must be at least 3 characters long.",
      "string.max": "Title must not exceed 50 characters.",
    })
    .required(),
  description: Joi.string()
    .messages({
      "string.empty": "Description is required.",
      "string.min": "Description must be at least 3 characters long.",
      "string.max": "Description must not exceed 255 characters.",
    })
    .required(),
  date: Joi.number()
    .integer()
    .messages({
      "number.base": "Date is required.",
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
