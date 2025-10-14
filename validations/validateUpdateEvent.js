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

  const messages = [];

  // Collect all the validation errors
  if (error && error.details) {
    error.details.forEach((detail) => {
      messages.push(detail.message);
    });
  }

  // Set the time of day to 0 so we don't have to deal with hour/minute issues.
  const submittedDate = new Date(req.body.date);
  const today = new Date();

  submittedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (req.body.date != null && submittedDate < today) {
    messages.push("Event date cannot be in the past");
  }

  if (messages.length > 0) {
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateUpdateEvent;
