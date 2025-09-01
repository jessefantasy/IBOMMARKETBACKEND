import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  ownerId: {
    type: String,
    required: true,
    immutable: true,
  },
  requests: {
    type: [],
    default: [],
  },
});

const RequestCallbackSchema = mongoose.model("ibm-request-callbacks", schema);

export default RequestCallbackSchema;
