import express from "express";
import User from "../models/User.js";
import ApiProduct from "../models/ApiProduct.js";
import ApiKey from "../models/ApiKey.js";
import UsageLog from "../models/UsageLog.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};

router.get("/stats", authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await ApiProduct.countDocuments();
    const totalKeys = await ApiKey.countDocuments();
    const totalLogs = await UsageLog.countDocuments();

    const keys = await ApiKey.find();
    const totalRequests = keys.reduce(
      (sum, key) => sum + (key.requestCount || 0),
      0,
    );

    const extra = Math.max(totalRequests - 5, 0);
    const revenue = (extra * 0.5).toFixed(2);

    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentKeys = await ApiKey.find()
      .populate("user", "name email")
      .populate("product", "name slug")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalProducts,
      totalKeys,
      totalLogs,
      totalRequests,
      revenue,
      recentUsers,
      recentKeys,
    });
  } catch (error) {
    res.status(500).json({ message: "Admin stats failed" });
  }
});

export default router;
