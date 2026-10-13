require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/favorites", favoriteRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
