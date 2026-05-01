import axios from "axios";
import ApiKey from "../models/ApiKey.js";
import UsageLog from "../models/UsageLog.js";

export const proxyRequest = async (req, res) => {
  const start = Date.now();

  try {
    // middleware se aaya hua api key object
    const apiKey = req.apiKey;

    // product populated object
    const apiProduct = req.apiProduct;

    // target API url
    const targetUrl = apiProduct.baseUrl;

    // query params handle
    const queryString = new URLSearchParams(req.query).toString();

    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // external api hit
    const response = await axios.get(finalUrl);

    // latency calculate
    const latency = Date.now() - start;

    // request count increase
    await ApiKey.findByIdAndUpdate(
      apiKey._id,
      { $inc: { requestCount: 1 } },
      { new: true },
    );

    // usage log save
    await UsageLog.create({
      apiKey: apiKey._id,
      product: apiProduct._id,
      endpoint: req.params.slug,
      statusCode: 200,
      latency: `${latency} ms`,
    });

    return res.status(200).json({
      message: "Request successful",
      endpoint: apiProduct.name,
      latency: `${latency} ms`,
      data: response.data,
    });
  } catch (error) {
    const latency = Date.now() - start;

    console.log("Gateway error:", error.message);

    // fail log save
    if (req.apiKey) {
      await UsageLog.create({
        apiKey: req.apiKey._id,
        product: req.apiKey.apiProduct?._id,
        endpoint: req.params.slug,
        statusCode: 500,
        latency: `${latency} ms`,
      });
    }

    return res.status(500).json({
      message: "Gateway request failed",
    });
  }
};
