const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// GET /api/notifications — full list, newest first
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name profilePicture")
      .populate("post", "content")
      .populate("listing", "title images category");

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications/unread-count — for the header badge
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/read-all — mark everything read (e.g. on page open)
router.patch("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/:id/read — mark a single one read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;