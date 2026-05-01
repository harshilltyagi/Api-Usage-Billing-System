import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiProduct",
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    requestCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ApiKey", apiKeySchema);
