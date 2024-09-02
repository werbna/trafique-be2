const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Photo = require("../models/photo");
const LogEntry = require("../models/logEntry");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
// ========== Public Routes ===========

router.get("/:logEntryId", async (req, res) => {
  try {
    const photos = await Photo.find({ logEntry: req.params.logEntryId }).populate('logEntry', 'author').populate('author', 'username email');
    res.json(photos);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error fetching photos" });
  }
});

// ========= Protected Routes =========
router.use(verifyToken);

router.post("/:logEntryId", verifyToken, async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId).populate('author', 'username email');
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    req.body.url = result.secure_url;
    req.body.logEntry = req.params.logEntryId;
    req.body.author = req.user._id;
    const photo = await Photo.create(req.body);
    logEntry.photos.push(photo._id);
    await logEntry.save();
    const populatedPhoto = await photo.populate('author', 'username email').execPopulate();
    res.status(201).json(populatedPhoto);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to upload photo" });
  }
});


router.delete("/:photoId", verifyToken, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId).populate('logEntry', 'author').populate('author', 'username email');
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    if (photo.logEntry.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this photo" });
    }
    const logEntry = await LogEntry.findById(photo.logEntry);
    if (logEntry) {
      logEntry.photos.pull(photo._id); 
      await logEntry.save();
    }
    await Photo.findByIdAndDelete(req.params.photoId);

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error deleting photo" });
  }
});

module.exports = router;
