const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  try {
    const { password, username, email } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) throw new Error("User name or e-mail already exists");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) return res.status(404).json("User not found");
    const matched = await bcrypt.compareSync(password, user.password);
    if (!matched) return res.status(401).json("UnAuthorised User");
    const { password: _, ...data } = user._doc;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET , { expiresIn: process.env.JWT_EXPIRE });
    res.cookie("token", token).status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Logout
router.get("/logout", async (req, res) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .json("User logged out successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});
// Refetch
router.get("/refetch", async (req, res) => {
  try {
    const token = req.cookies.token;
    jwt.verify(token, process.env.JWT_SECRET , {}, async (err, data) => {
      console.log(data);
      if (err) {
        res.status(404).json(err);
      }
      try {
        const id = data._id;
        const user = await User.findOne({ _id: id });
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json("User Not found");
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
