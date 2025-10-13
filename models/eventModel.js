const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  imgUrl: { type: String, required: true },
  title: { type: String, required: true, minlength: 3, maxlength: 50 },
  description: { type: String, required: true, minlength: 3, maxlength: 255 },
  date: { type: Number, required: true },
  participants: [
    {
      type: String,
      required: true,
    },
  ],
});

const Event = mongoose.model("event", eventSchema);

module.exports = { Event };
