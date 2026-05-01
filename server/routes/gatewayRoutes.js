import express from "express";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware.js";
import { proxyRequest } from "../controllers/gatewayController.js";

const router = express.Router();

router.get("/:slug", apiKeyMiddleware, proxyRequest);

export default router;
