const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Story = require("../models/Story");
const { CustomError } = require("../middlewares/error");

const getUserByIdController = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) throw new CustomError("User not found", 404);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const updateUserController = async (req, res, next) => {
  const { id } = req.params;
  const user = req.body;
  try {
    const updateUser = await User.findById(id);
    if (!updateUser) throw new CustomError("No user found", 404);
    Object.assign(updateUser, user);
    await updateUser.save();
    res
      .status(200)
      .json({ message: "User updated Successfully", user: updateUser });
  } catch (err) {
    next(err);
  }
};

const followUserController = async (req, res, next) => {
  const { UserId } = req.params;
  const { _id } = req.body;
  try {
    if (UserId === _id)
      throw new CustomError("You cannot follow yourself", 500);
    const UserToBeFollowed = await User.findById(UserId); // (Followers will be incremented)
    const loggedInUser = await User.findById(_id); // This user will follow the UserToBeFollowed (Following will be incremente)
    if (!UserToBeFollowed || !loggedInUser)
      throw new CustomError("User not found", 404);
    if (loggedInUser.following.includes(UserId))
      throw new CustomError("Already following this user", 400);
    loggedInUser.following.push(UserId);
    UserToBeFollowed.followers.push(_id);
    await loggedInUser.save();
    await UserToBeFollowed.save();
    res.status(200).json({
      message: `${loggedInUser.username} Successfully followed user ${UserToBeFollowed.username} (ID: ${UserId})`,
    });
  } catch (err) {
    next(err);
  }
};

const unfollowUserController = async (req, res, next) => {
  const { UserId } = req.params;
  const { _id } = req.body;
  try {
    if (UserId === _id)
      throw new CustomError("You cannot unfollow yourself", 404);
    const UserToBeUnfollowed = await User.findById(UserId);
    const loggedInUser = await User.findById(_id);
    if (!UserToBeUnfollowed || !loggedInUser)
      throw new CustomError("User not found", 404);
    if (!loggedInUser.following.includes(UserId))
      throw new CustomError("Not following this User", 400);
    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== UserId
    );
    UserToBeUnfollowed.followers = UserToBeUnfollowed.followers.filter(
      (id) => id.toString() !== _id
    );
    await loggedInUser.save();
    await UserToBeUnfollowed.save();
    res.status(200).json({
      message: `${loggedInUser.username} Successfully Unfollowd user ${UserToBeUnfollowed.username} !`,
    });
  } catch (err) {
    next(err);
  }
};

const blockUserController = async (req, res, next) => {
  const { UserId } = req.params;
  const { _id } = req.body;
  try {
    if (UserId === _id) throw new CustomError("You cannot block yourself", 500);
    const UserToBeBlocked = await User.findById(UserId);
    const loggedInUser = await User.findById(_id);
    if (!UserToBeBlocked || !loggedInUser)
      throw new CustomError("User not found", 404);
    if (loggedInUser.blocklist.includes(UserId))
      throw new CustomError("This user is already blocked", 400);
    loggedInUser.blocklist.push(UserId);
    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== UserId
    );
    UserToBeBlocked.followers = loggedInUser.followers.filter(
      (id) => id.toString() !== _id
    );
    await loggedInUser.save();
    await UserToBeBlocked.save();
    res.status(200).json({
      message: `${loggedInUser.username} user Successfully blocked ${UserToBeBlocked.username} user!`,
    });
  } catch (err) {
    next(err);
  }
};

const unBlockUserController = async (req, res, next) => {
  const { UserId } = req.params;
  const { _id } = req.body;
  try {
    if (UserId === _id) throw new CustomError("You Cannot Unblock Yourself");
    const UserToBeUnBlocked = await User.findById(UserId);
    const loggedInUser = await User.findById(_id);
    if (!UserToBeUnBlocked || !loggedInUser)
      throw new CustomError("User not found!", 404);
    if (!loggedInUser.blocklist.includes(UserId))
      throw new CustomError("This User is not in your blocklist");
    loggedInUser.blocklist = loggedInUser.blocklist.filter(
      (id) => id.toString() !== UserId
    );
    await loggedInUser.save();
    res.status(200).json({
      message: `You have successfully Unblocked the user ${UserToBeUnBlocked.username}`,
    });
  } catch (err) {
    next(err);
  }
};

const getBlockedUsersController = async (req, res, next) => {
  const { UserId } = req.params;
  try {
    const user = await User.findById(UserId).populate(
      "blocklist",
      "username fullName profilePic"
    );
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res.status(200).json(user.blocklist);
  } catch (err) {
    next(err);
  }
};

const deleteUserController = async (req, res, next) => {
  const { UserId } = req.params;
  console.log(UserId);

  try {
    const userToDelete = await User.findById(UserId);

    if (!userToDelete) {
      throw new CustomError("User not found!", 404);
    }

    await Post.deleteMany({ user: UserId });
    await Post.deleteMany({ "comments.user": UserId });
    await Post.deleteMany({ "comments.replies.user": UserId });
    await Comment.deleteMany({ user: UserId });
    await Story.deleteMany({ user: UserId });
    await Post.updateMany({ likes: UserId }, { $pull: { likes: UserId } });
    await User.updateMany(
      { _id: { $in: userToDelete.following } },
      { $pull: { followers: UserId } }
    );

    await Comment.updateMany({}, { $pull: { likes: UserId } });
    await Comment.updateMany(
      { "replies.likes": UserId },
      { $pull: { "replies.$.likes": UserId } }
    );

    await Post.updateMany({}, { $pull: { likes: UserId } });

    const replyComments = await Comment.find({ "replies.user": UserId });

    await Promise.all(
      replyComments.map(async (comment) => {
        comment.replies = comment.replies.filter(
          (reply) => reply.user.toString() !== UserId
        );
        await comment.save();
      })
    );

    await userToDelete.deleteOne();
    res
      .status(200)
      .json({
        message: "Everything associated with user is deleted successfully!",
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const searchUserController = async (req, res, next) => {
  const { query } = req.params;
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: new RegExp(query, "i") } },
        { fullName: { $regex: new RegExp(query, "i") } },
      ],
    });

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserByIdController,
  updateUserController,
  followUserController,
  unfollowUserController,
  blockUserController,
  unBlockUserController,
  getBlockedUsersController,
  deleteUserController,
  searchUserController,
};
