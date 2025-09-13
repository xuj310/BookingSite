const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  description: { type: String, required: true, minlength: 3, maxlength: 255 },
  date: { type: Number, required: true },
   participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This should match the model name of your user schema
      required: true,
    }
  ],
});

const Event = mongoose.model("event", eventSchema);

module.exports = { Event };
