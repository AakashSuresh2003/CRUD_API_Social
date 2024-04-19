const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { CustomError } = require("../middlewares/error");
const upload = require("../middlewares/upload");
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
  uploadProfilePictureController,
  uploadCoverPictureController
} = require("../controller/userController");
const uploads = require("../middlewares/upload");

router.get("/:id", getUserByIdController);

router.put("/update/:id", updateUserController);

router.post("/follow/:UserId", followUserController);

router.post("/unfollow/:UserId", unfollowUserController);

router.post("/block/:UserId", blockUserController);

router.post("/unblock/:UserId", unBlockUserController);

router.get("/blocked/:UserId", getBlockedUsersController);

router.delete("/delete/:UserId", deleteUserController);

router.get("/search/:query", searchUserController);

router.put(
  "/update-profile-picture/:userId",
  upload.single("profilePic"),
  uploadProfilePictureController
);

router.put(
  "/update-cover-picture/:userId",
  upload.single("coverPic"),
  uploadCoverPictureController
);

module.exports = router;
