const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const registerController = async (req, res, next) => {
  try {
    const { password, username, email } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      throw new CustomError("Username or email already exists", 400);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new CustomError("Username not found", 404);
    const matched = await bcrypt.compareSync(password, user.password);
    if (!matched) throw new CustomError("UnAuthorised User", 401);
    const { password: _, ...data } = user._doc;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie("token", token).status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const logoutController = async (req, res) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .json("User logged out successfully");
  } catch (err) {
    next(err);
  }
};

const refetchController = async (req, res) => {
  try {
    const token = req.cookies.token;
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(404).json({ err: "JsonWebTokenError" });
      }
      try {
        const id = data._id;
        const user = await User.findOne({ _id: id });
        if (!user) throw new CustomError("User not logged in", 401);
        res.status(200).json(user);
      } catch (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  refetchController,
};
