import { Schema, model } from "mongoose";

const savedSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    postsId: {
      type: [String],
    },
  },
  { timestamps: true }
);

const SavedSchema = model("ibm-saved-posts", savedSchema);
export default SavedSchema;
