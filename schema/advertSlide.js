import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    id: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
    },
    url: {
      type: String,
      required: true,
    },
    asset_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AdvertSlideModel = mongoose.model("ibm-adverts", schema);

export default AdvertSlideModel;
