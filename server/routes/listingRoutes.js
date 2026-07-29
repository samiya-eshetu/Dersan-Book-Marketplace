const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { upload, cloudinary } = require("../config/cloudinary");
const auth = require("../middleware/auth");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "dersan-books" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
};

// create listing
router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const imageUrls = await Promise.all(
      (req.files || []).map((file) => uploadToCloudinary(file.buffer)),
    );
    const listing = await Listing.create({
      ...req.body,
      images: imageUrls,
      seller: req.userId,
    });

    // notify users who've shown interest in this category
    User.find({
      _id: { $ne: req.userId },
      categoryInterests: { $elemMatch: { category: listing.category, count: { $gt: 0 } } },
    })
      .select("_id")
      .then((interestedUsers) => {
        const notifications = interestedUsers.map((u) => ({
          recipient: u._id,
          type: "interest",
          listing: listing._id,
        }));
        if (notifications.length > 0) {
          Notification.insertMany(notifications).catch(() => {});
        }
      })
      .catch(() => {});

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// read all listings
router.get("/", async (req, res) => {
  try {
    const { sort } = req.query;
    let query = Listing.find({ status: "available" });
    if (sort === "newest") query = query.sort({ createdAt: -1 });
    if (sort === "bestseller") query = query.sort({ interestCount: -1 });
    if (req.query.search) {
      query = query.where("title").regex(new RegExp(req.query.search, "i"));
    }
    if (req.query.category) {
      query = query.where("category").equals(req.query.category);
    }
    const listings = await query.limit(20);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// my listings — MUST be before /:id
router.get("/my-listings", auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.userId }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// public listings by a specific seller — used by public profile pages, MUST be before /:id
router.get("/user/:userId", async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// read one listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "name email profilePicture",
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user) {
        const existingInterest = user.categoryInterests.find(
          (interest) => interest.category === listing.category,
        );
        if (existingInterest) {
          existingInterest.count += 1;
        } else {
          user.categoryInterests.push({ category: listing.category, count: 1 });
        }
        await user.save();
      }
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update listing
router.patch("/:id", auth, upload.array("images", 5), async (req, res) => {
  try {
    let imageUrls;
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer)),
      );
    }
    const updateData = {
      ...req.body,
      ...(imageUrls && { images: imageUrls }),
    };
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, seller: req.userId },
      updateData,
      { new: true },
    );
    if (!listing)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// delete listing
router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      seller: req.userId,
    });
    if (!listing)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Listing deleted successfully", listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;