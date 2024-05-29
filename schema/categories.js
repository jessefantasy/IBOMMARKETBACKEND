import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema(
  {
    Id: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
    },
    CategoryId: {
      type: Number,
      required: true,
    },
    Name: {
      type: String,
      required: true,
      unique: true,
    },
    ImageUrl: {
      type: String,
      required: true,
    },
    Public_Id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const schemas = new Schema(
  {
    Id: {
      type: Number,
      required: true,
      immutable: true,
      unique: true,
    },
    Name: {
      type: String,
      required: true,
      unique: true,
    },
    ImageUrl: {
      type: String,
      required: true,
    },
    Public_Id: {
      type: String,
      required: true,
    },
    Subcategories: {
      type: [subCategorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const CategoriesSchema = mongoose.model("ibm-category", schemas);

export default CategoriesSchema;
