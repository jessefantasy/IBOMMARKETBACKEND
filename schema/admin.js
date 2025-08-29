import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    username: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      required: true,
      immutable: true,
    },

    twoFaSecret: {
      type: String,
      default: "",
    },
    twoFaEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const AdminSchema = mongoose.model("ibommarket-admins", schema);

export default AdminSchema;
