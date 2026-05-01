import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema({
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApiKey",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApiProduct",
  },
  endpoint: String,
  statusCode: Number,
  latency: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UsageLog = mongoose.model("UsageLog", usageLogSchema);

export default UsageLog;
