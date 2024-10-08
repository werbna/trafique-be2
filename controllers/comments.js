const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Comment = require("../models/comment");
const LogEntry = require("../models/logEntry");
const router = express.Router();

// ========== Public Routes ===========

router.get("/:logEntryId", async (req, res) => {
  try {
    const comments = await Comment.find({ logEntry: req.params.logEntryId }).populate('author', 'username email');
    res.json(comments);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error fetching comments" });
  }
});

// ========= Protected Routes =========

router.use(verifyToken);

router.post("/:logEntryId", async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    req.body.logEntry = req.params.logEntryId;
    req.body.author = req.user._id;
    let comment = await Comment.create(req.body);
    logEntry.comments.push(comment._id);
    await logEntry.save();
    comment = await comment.populate('author', 'username email');
    res.status(201).json(comment);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to create comment" });
  }
});

router.put("/:commentId", async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId).populate('author', 'username email');
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.author._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to edit this comment" });
    }
    comment.content = req.body.content || comment.content;
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error updating comment" });
  }
});

router.delete("/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate('author', 'username email');
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.author._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }
    const logEntry = await LogEntry.findById(comment.logEntry);
    if (logEntry) {
      logEntry.comments.pull(comment._id);
      await logEntry.save();
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
});

module.exports = router;
