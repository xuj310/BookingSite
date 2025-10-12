const { User } = require("../models/userModel");
const { hashPassword } = require("../utilities");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
  try {
    // If an id is provided, retrieve the specific user
    if (req.query.id) {
      const user = await User.findById(req.query.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    }
    // If there's no id provided, return all users
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error, error });
  }
};

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        errors: ["Email is already registered."],
      });
    }

    const hashedPassword = await hashPassword(req.body.password);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phoneNum: req.body.phoneNum,
      age: req.body.age,
      password: hashedPassword,
    });

    try {
      const token = jwt.sign(
        {
          _id: newUser._id,
          name: newUser.name,
          phoneNum: newUser.phoneNum,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      req.token = token;
    } catch (error) {
      console.error("Token generation error:", error);
      return res.status(500).json({
        error: "Token generation failed",
        details: error.message,
      });
    }

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      newUser,
      token: req.token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let hashedPassword;
    if (req.query.password) {
      hashedPassword = await hashPassword(req.body.password);
    }

    // Changing the fields is optional
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.phoneNum) updateFields.phoneNum = req.body.phoneNum;
    if (req.body.age) updateFields.age = req.body.age;
    if (req.body.password) updateFields.password = hashedPassword;

    const updatedUser = await User.findByIdAndUpdate(
      req.query.id,
      // Only includes changed fields
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.query.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Check for existing token
    const authHeader = req.headers.authorization;
    const existingToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (existingToken) {
      try {
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
        console.log("Valid token found:", decoded);

        return res.status(200).json({
          message: "Already logged in",
          token: existingToken,
        });
      } catch (err) {
        console.warn("Token invalid or expired:", err.message);
        // Continue to login flow
      }
    }

    // 🔐 Proceed with login
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ errors: ["E-mail not found"] });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ errors: ["Invalid Password"] });

    // 🧾 Issue new token
    const newToken = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        phoneNum: user.phoneNum,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "Logged in successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};
