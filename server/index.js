require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);

const express = require("express");
const mongoose = require ("mongoose");
const cors = require("cors");
const http = require("http");
const app = express()

const userRoutes = require("./routes/userRoute");
const listingRoutes = require("./routes/listingRoutes");
const conversationRoutes = require("./routes/conversationroutes");
const postRoutes = require("./routes/postRoutes");

app.use(cors({
  origin: "http://localhost:5173",
  credentials : true
}));

app.use(express.json());

app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes );
app.use("/api/conversations", conversationRoutes );
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });