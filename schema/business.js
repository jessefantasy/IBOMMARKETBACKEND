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
    ibmId: {
      type: Number,
      required: true,
    },
    activePosts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    postsDetails: {
      type: [],
      required: true,
      default: [
        {
          active: 0,
          pending: 0,
          rejected: 0,
          closed: 0,
        },
      ],
    },
  },
  { timestamps: true }
);

const BusinessSchema = mongoose.model("businesses", schema);

export default BusinessSchema;

const ibm = new Schema({
  IDS: {
    type: [Number],
    default: [],
  },
});

export const IbommarketBusinessIDs = mongoose.model(
  "ibm-business-id-arrays",
  ibm
);
