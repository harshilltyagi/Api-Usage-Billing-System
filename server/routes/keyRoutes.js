import express from "express";
import crypto from "crypto";
import ApiKey from "../models/ApiKey.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* Generate API Key */
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    const key = "mf_sk_" + crypto.randomBytes(16).toString("hex");

    const newKey = await ApiKey.create({
      key,
      product: productId,
      user: req.user.id,
      active: true,
    });

    res.status(201).json({
      message: "Key generated",
      data: newKey,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* Get My Keys */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const keys = await ApiKey.find({ user: req.user.id }).populate("product");

    res.json(keys);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

export default router;
