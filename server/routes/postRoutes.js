const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { upload, cloudinary } = require("../config/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "dersan-community" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
};

// GET all posts (feed)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name profilePicture")
      .populate("listing", "title images price")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET posts by a specific author — used by public profile pages
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name profilePicture")
      .populate("listing", "title images price")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a post
router.post("/", auth, upload.array("images", 4), async (req, res) => {
  try {
    const { content, listingId } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: "Post must have text or images" });
    }

    const imageUrls = await Promise.all(
      (req.files || []).map((file) => uploadToCloudinary(file.buffer))
    );

    const post = await Post.create({
      author: req.userId,
      content: content || "",
      images: imageUrls,
      listing: listingId || null,
    });

    const populated = await post.populate("author", "name profilePicture");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIKE / UNLIKE a post
router.patch("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(req.userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    if (!alreadyLiked && post.author.toString() !== req.userId) {
      Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: "like",
        post: post._id,
      }).catch(() => {});
    }

    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name profilePicture")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD a comment
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Comment cannot be empty" });

    const comment = await Comment.create({
      post: req.params.id,
      author: req.userId,
      content,
    });

    const post = await Post.findByIdAndUpdate(req.params.id, {
      $inc: { commentsCount: 1 }
    });

    if (post && post.author.toString() !== req.userId) {
      Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: "comment",
        post: post._id,
        commentText: content,
      }).catch(() => {});
    }

    const populated = await comment.populate("author", "name profilePicture");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.userId,
    });
    if (!post) return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;