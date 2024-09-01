const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Photo = require("../models/photo");
const LogEntry = require("../models/logEntry");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

router.post("/logEntry/:logEntryId", verifyToken, async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    req.body.url = result.secure_url;
    req.body.logEntry = req.params.logEntryId;
    const photo = await Photo.create(req.body);
    logEntry.photos.push(photo._id);
    await logEntry.save();
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload photo" });
  }
});

router.get("/logEntry/:logEntryId", async (req, res) => {
  try {
    const photos = await Photo.find({ logEntry: req.params.logEntryId });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching photos" });
  }
});

router.delete("/:photoId", verifyToken, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    if (photo.logEntry.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this photo" });
    }
    await photo.remove();
    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting photo" });
  }
});

module.exports = router;
