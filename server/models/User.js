const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // will store the HASHED version, never plain text
    profilePicture: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    categoryInterests: [
      {
        category: { type: String },
        count: { type: Number, default: 0 },
      },
      
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;