const { User } = require("../models/userModel");
const { hashPassword } = require("../utilities");

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
    const hashedPassword = await hashPassword(req.body.password);

    const newUser = new User({
      name: req.body.name,
      phoneNum: req.body.phoneNum,
      age: req.body.age,
      role: req.body.role,
      password: hashedPassword,
    });
    await newUser.save();
    // We are appending the token to the response so the user can use it
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
    if (req.body.role) updateFields.role = req.body.role;
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
