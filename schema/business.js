import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
      immutable: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    businessAddress: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    workingTime: {
      type: String,
      required: true,
    },
    workingHours: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    logo: {
      type: String,
      required: true,
    },
    logoId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BusinessSchema = mongoose.model("businesses", schema);

export default BusinessSchema;
