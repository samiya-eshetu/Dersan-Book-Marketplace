const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const { upload, cloudinary } = require("../config/cloudinary");

const createToken = (userId) => {
  return jwt.sign(
    { userId },                       
    process.env.JWT_SECRET,              
    { expiresIn: "7d" }                  
  );
};

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "dersan-avatars" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
};

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }


    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
    });


    const token = createToken(user._id);


    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });

 
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
   
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// public profile info — used by the Community page when someone clicks an author
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name profilePicture createdAt"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch(
  "/update-profile",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const updateData = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.file) {
        updateData.profilePicture = await uploadToCloudinary(req.file.buffer);
      }

      const user = await User.findByIdAndUpdate(req.userId, updateData, {
        new: true,
      }).select("-password");

      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.patch("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete-account", auth, async (req, res) => {
  try {
    // delete all their listings too
    await Listing.deleteMany({ seller: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;