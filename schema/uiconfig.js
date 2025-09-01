import { Schema, model } from "mongoose";

const uiConfigSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    key: {
      type: String,
      default: "",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
const UiConfigSchema = model("ibm-ui-config", uiConfigSchema);
export default UiConfigSchema;
