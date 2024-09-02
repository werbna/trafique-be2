const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Trip = require('../models/trip');
const LogEntry = require('../models/logEntry');
const Comment = require('../models/comment');
const verifyToken = require('../middleware/verify-token');

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId && !req.user.isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'trips',
        model: Trip,
        populate: {
          path: 'logEntries',
          model: LogEntry,
          populate: {
            path: 'comments',
            model: Comment,
            populate: {
              path: 'author',
              select: 'username email'
            }
          }
        }
      })
      .populate('logEntries', 'title content')
      .populate('comments', 'content')
      .exec();
      
    if (!user) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId && !req.user.isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId && !req.user.isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
