const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    condition: {
      type: String,
      enum: ["new", "like new", "good", "worn"],
      required: true,
    },
    images: {
      type: [String],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one image is required",
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: { type: String },
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
    category: {
      type: String,
      enum: [
        "fiction",
        "manga",
        "textbook",
        "biography",
        "self-help",
        "science",
        "history",
        "children",
        "poetry",
        "other",
      ],
      required: true,
    },
    interestCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
