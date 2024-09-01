const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Trip = require("../models/trip");
const router = express.Router();

// ========== Public Routes ===========

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate('author', 'username');
    res.json(trips);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error fetching trips" });
  }
});

router.get("/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate('author', 'username');
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

router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to create trip" });
  }
});

router.put("/:tripId", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    if (trip.author.toString() !== req.user._id.toString() || !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to update this trip" });
    }
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.tripId, req.body, { new: true });
    res.json(updatedTrip);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Error updating trip" });
  }
});

router.delete("/:tripId", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    if (trip.author.toString() !== req.user._id.toString() || !req.user.isAdmin) {
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
