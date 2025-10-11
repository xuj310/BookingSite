const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 50,
  },
  phoneNum: { type: String, required: true },
  age: { type: Number, required: true, min: 1, max: 200 },
  role: {
    type: String,
    enum: ["admin", "standard_member"],
    default: "standard_member",
  },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
