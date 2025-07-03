import mongoose, { Schema, model } from "mongoose";

const schema = new Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ["spam", "fraud", "offensive", "scam", "other"],
    },
    details: { type: String },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "resolved"],
    },
    images: {
      type: [String],
      default: [],
    },
    imagesIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const ReportAbuseSchema = model("ReportAbuse", schema);
export default ReportAbuseSchema;
