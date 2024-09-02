const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Trip = require("../models/trip");
const router = express.Router();

// ========== Public Routes ===========

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate('author', 'username email');
    res.json(trips);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error fetching trips" });
  }
});

router.get("/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate('author', 'username email');
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error fetching trip" });
  }
});

// ========= Protected Routes =========
router.use(verifyToken);

router.post("/", async (req, res) => {
  try {
    req.body.author = req.user._id;
    let trip = await Trip.create(req.body);
    trip = await trip.populate('author', 'username email');
    res.status(201).json(trip);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to create trip" });
  }
});

router.put("/:tripId", async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.tripId).populate('author', 'username email');
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    if (trip.author._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to update this trip" });
    }
    Object.assign(trip, req.body);
    await trip.save();
    res.json(trip);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error updating trip" });
  }
});

router.delete("/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate('author', 'username email');
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    if (trip.author._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this trip" });
    }
    await Trip.findByIdAndDelete(req.params.tripId);
    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error deleting trip" });
  }
});

module.exports = router;
