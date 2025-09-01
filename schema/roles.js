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
    role: {
      type: String, //marketer, manager , designer
      required: true,
      immutable: true,
    },
    profileIconUrl: {
      type: String,
      default: "",
    },
    profileIconId: {
      type: String,
      defualt: "",
    },
    password: String,
    status: {
      type: String,
      default: "pending", //active, paused
    },
    advertCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const RolesSchema = mongoose.model("ibommarket-roles", schema);

export default RolesSchema;
