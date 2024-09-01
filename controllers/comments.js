const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Comment = require("../models/comment");
const LogEntry = require("../models/logEntry");
const router = express.Router();

router.post("/logEntry/:logEntryId", verifyToken, async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    req.body.logEntry = req.params.logEntryId;
    req.body.author = req.user._id;
    const comment = await Comment.create(req.body);
    logEntry.comments.push(comment._id);
    await logEntry.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment" });
  }
});

router.get("/logEntry/:logEntryId", async (req, res) => {
  try {
    const comments = await Comment.find({ logEntry: req.params.logEntryId }).populate('author', 'username');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments" });
  }
});

router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }
    await comment.remove();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
});

module.exports = router;
