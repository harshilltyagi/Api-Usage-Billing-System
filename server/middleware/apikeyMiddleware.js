import ApiKey from "../models/ApiKey.js";

const apiKeyMiddleware = async (req, res, next) => {
  try {
    const key = req.headers["x-api-key"];

    if (!key) {
      return res.status(401).json({ message: "API key missing" });
    }

    const apiKey = await ApiKey.findOne({ key }).populate("product");

    if (!apiKey) {
      return res.status(403).json({ message: "Invalid API key" });
    }

    if (!apiKey.active) {
      return res.status(403).json({ message: "API key inactive" });
    }

    // attach to request
    req.apiKey = apiKey;
    req.apiProduct = apiKey.product;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Middleware failed" });
  }
};

export default apiKeyMiddleware;
