import mongoose, { Schema, SchemaType } from "mongoose";

const imageSchema = new Schema({
  url: {
    type: String,
  },
  public_id: {
    type: String,
  },
});
const schema = new Schema(
  {
    ownerId: {
      type: mongoose.ObjectId,
      required: true,
      immutable: true,
    },
    title: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      required: true,
    },
    postImages: {
      type: [],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Number,
      required: true,
    },
    subcategoryId: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    localGovernment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending", //active,reviewing,rejected,closed
    },
    postRejectReasons: {
      type: [],
      default: [],
    },
    categoryName: {
      type: String,
      required: true,
    },
    subcategoryName: {
      type: String,
      required: true,
    },
    activeAdvertsCount: {
      type: Number,
      required: true,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    visits: {
      type: [],
      default: [],
    },
    phoneViews: {
      type: [],
      default: [],
    },
    businessName: {
      type: String,
    },
    others: {},
  },
  { timestamps: true }
);

const PostSchema = mongoose.model("ibommarket-posts", schema);

export default PostSchema;
