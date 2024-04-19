const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { CustomError } = require("../middlewares/error");
const {
  getUserByIdController,
  updateUserController,
  followUserController,
  unfollowUserController,
  blockUserController,
  unBlockUserController,
  getBlockedUsersController,
  deleteUserController,
  searchUserController,
} = require("../controller/userController");

router.get("/:id", getUserByIdController);

router.put("/update/:id", updateUserController);

router.post("/follow/:UserId", followUserController);

router.post("/unfollow/:UserId", unfollowUserController);

router.post("/block/:UserId", blockUserController);

router.post("/unblock/:UserId", unBlockUserController);

router.get("/blocked/:UserId", getBlockedUsersController);

router.delete("/delete/:UserId", deleteUserController);

router.get("/search/:query", searchUserController);

module.exports = router;
