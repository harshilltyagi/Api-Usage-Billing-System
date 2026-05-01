import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);
router.get("/my", authMiddleware, getMyProducts);

export default router;
