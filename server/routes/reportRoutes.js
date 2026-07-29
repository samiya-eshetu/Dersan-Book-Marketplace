const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// FILE a report — any logged-in user
router.post("/", auth, async (req, res) => {
  try {
    const { postId, reason, details } = req.body;
    if (!postId || !reason) {
      return res.status(400).json({ error: "postId and reason are required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const report = await Report.create({
      reporter: req.userId,
      post: postId,
      reason,
      details,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LIST all reports — admin only
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate({
        path: "post",
        select: "content images author createdAt",
        populate: { path: "author", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RESOLVE or dismiss a report — admin only
router.patch("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body; // "resolved" or "dismissed"
    if (!["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE the reported post directly from the admin panel — admin only
router.delete("/:id/post", auth, adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    await Post.findByIdAndDelete(report.post);
    report.status = "resolved";
    await report.save();

    res.json({ message: "Post deleted and report resolved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;