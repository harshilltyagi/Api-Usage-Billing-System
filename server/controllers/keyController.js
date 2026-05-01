import crypto from "crypto";
import ApiKey from "../models/ApiKey.js";
import ApiProduct from "../models/ApiProduct.js";

const generateKey = () => {
  return "mf_sk_" + crypto.randomBytes(16).toString("hex");
};

export const createKey = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await ApiProduct.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const apiKey = await ApiKey.create({
      key: generateKey(),
      owner: req.user.id,
      apiProduct: productId,
    });

    return res.status(201).json({
      message: "API key created",
      apiKey,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Create key failed",
    });
  }
};

export const getMyKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({
      owner: req.user.id,
    })
      .populate("apiProduct", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json(keys);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch keys",
    });
  }
};

export const revokeKey = async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({
        message: "Key not found",
      });
    }

    if (key.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    key.active = false;
    await key.save();

    return res.status(200).json({
      message: "Key revoked",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Revoke failed",
    });
  }
};
