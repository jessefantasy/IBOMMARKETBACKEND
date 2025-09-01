import mongoose, { Schema } from "mongoose";

const visitDataSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  propertyId: {
    type: [String],
    default: [],
  },
});

const schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    visitData: {
      type: [visitDataSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const UserVisitsSchema = mongoose.model("user-visits", schema);

export default UserVisitsSchema;
