const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  unreadBuyer: { type: Number, default: 0 },
  unreadSeller: { type: Number, default: 0 },
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;