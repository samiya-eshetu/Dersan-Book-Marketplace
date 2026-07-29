const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Listing = require("../models/Listing");
const auth = require("../middleware/auth");

const router = express.Router();

// START a conversation
router.post("/", auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    let conversation = await Conversation.findOne({
      listing: listingId,
      buyer: req.userId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listing: listingId,
        buyer: req.userId,
        seller: listing.seller,
      });
      listing.interestCount += 1;
      await listing.save();
    }

    res.status(201).json(conversation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all conversations for logged in user
router.get("/", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ buyer: req.userId }, { seller: req.userId }],
    })
      .populate("listing", "title images price")
      .populate("seller", "name profilePicture")
      .populate("buyer", "name profilePicture")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET messages in one conversation
router.get("/:id/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate("replyTo", "text sender") // ← add this
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEND a message
router.post("/:id/messages", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ error: "Message cannot be empty" });

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.userId,
      text,
      replyTo: req.body.replyTo || null, 
    });

    const conversation = await Conversation.findById(req.params.id);
    const isSeller = conversation.seller.toString() === req.userId.toString();
    const update = {
      lastMessage: text,
      lastMessageAt: new Date(),
    };
    if (isSeller) {
      update.unreadBuyer = (conversation.unreadBuyer || 0) + 1;
    } else {
      update.unreadSeller = (conversation.unreadSeller || 0) + 1;
    }
    await Conversation.findByIdAndUpdate(req.params.id, update);

    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// MARK as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    const isSeller = conversation.seller.toString() === req.userId.toString();
    const update = isSeller ? { unreadSeller: 0 } : { unreadBuyer: 0 };
    await Conversation.findByIdAndUpdate(req.params.id, update);
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIKE / UNLIKE a message
router.patch("/:id/messages/:messageId/like", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const alreadyLiked = message.likes.includes(req.userId);
    if (alreadyLiked) {
      message.likes = message.likes.filter(
        (id) => id.toString() !== req.userId.toString(),
      );
    } else {
      message.likes.push(req.userId);
    }
    await message.save();
    res.json({ likes: message.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
