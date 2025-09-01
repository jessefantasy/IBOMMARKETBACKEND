import mongoose, { Schema, mongo } from "mongoose";

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    businessId: {
      type: String,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("user", schema);

export default UserSchema;
