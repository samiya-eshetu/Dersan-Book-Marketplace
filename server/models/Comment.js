const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true, maxlength: 300 },
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;