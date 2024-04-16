const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerController,
  loginController,
  logoutController,
  refetchController,
} = require("../controller/authController");

// Register
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// Logout
router.get("/logout", logoutController);
// Refetch
router.get("/refetch", refetchController);

module.exports = router;
