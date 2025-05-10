import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    ownerId: {
      type: String,
      required: true,
      immutable: true,
    },
    urgentRequestType: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    linkToPortfolio: {
      type: String,
    },
    budgetMin: {
      type: Number,
    },
    budgetMax: {
      type: Number,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    linkToBusinessPage: {
      type: String,
    },
    status: {
      type: String,
      default: "pending", //active,reviewing,rejected,closed
    },
  },
  { timestamps: true }
);

const UrgentRequestModel = mongoose.model("ibm-urgent-requests", schema);

export default UrgentRequestModel;
