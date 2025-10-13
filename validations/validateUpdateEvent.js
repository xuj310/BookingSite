const Joi = require("joi");

const updateEventSchema = Joi.object({
  id: Joi.string(),
  imgUrl: Joi.string()
    .messages({
      "string.empty": "An image url is required.",
    })
    .required(),
  title: Joi.string().min(3).max(50).messages({
    "string.min": "Title must be at least 3 characters long.",
    "string.max": "Title must not exceed 50 characters.",
  }),
  description: Joi.string().messages({
    "string.min": "Description must be at least 3 characters long.",
    "string.max": "Description must not exceed 255 characters.",
  }),
  date: Joi.number().integer().messages({
    "number.base": "Date must be an integer.",
  }),
});

const validateUpdateEvent = (req, res, next) => {
  const { error } = updateEventSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateUpdateEvent;
