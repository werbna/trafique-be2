const express = require("express");
const verifyToken = require("../middleware/verify-token");
const LogEntry = require("../models/logEntry");
const Trip = require("../models/trip");
const router = express.Router();

// Create a new log entry
router.post("/", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.body.trip);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    req.body.author = req.user._id;
    const logEntry = await LogEntry.create(req.body);
    trip.logEntries.push(logEntry._id);
    await trip.save();
    res.status(201).json(logEntry);
  } catch (error) {
    res.status(500).json({ message: "Failed to create log entry" });
  }
});

// Get a specific log entry
router.get("/:logEntryId", async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId).populate('author', 'username');
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    res.json(logEntry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching log entry" });
  }
});

// Update a specific log entry
router.put("/:logEntryId", verifyToken, async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    if (logEntry.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to update this log entry" });
    }
    const updatedLogEntry = await LogEntry.findByIdAndUpdate(req.params.logEntryId, req.body, { new: true });
    res.json(updatedLogEntry);
  } catch (error) {
    res.status(500).json({ message: "Error updating log entry" });
  }
});

// Delete a specific log entry
router.delete("/:logEntryId", verifyToken, async (req, res) => {
  try {
    const logEntry = await LogEntry.findById(req.params.logEntryId);
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }
    if (logEntry.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this log entry" });
    }
    await logEntry.remove();
    res.json({ message: "Log entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting log entry" });
  }
});

module.exports = router;
