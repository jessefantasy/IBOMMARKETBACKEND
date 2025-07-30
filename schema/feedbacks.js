import { Schema, model } from "mongoose";

const ReplySchema = new Schema(
  {
    sender: {
      businessId: Schema.Types.ObjectId,
      name: String,
      profileImage: String,
    },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["positive", "negative", "neutral"], // Type of feedback
    },
    grade: { type: String, required: true }, // Feedback text
    description: { type: String, required: true }, // Feedback text
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
    }, // Owner profile (business or user receiving feedback)

    weight: {
      type: Number,
      default: 0,
    }, // Weight of the feedback
    ownerDetails: {
      type: { name: String, businessId: String, logo: String },
      required: true,
    }, // Owner details (business or user receiving feedback)
    senderDetails: {
      type: {
        id: Schema.Types.ObjectId,
        name: String,
        profileImage: String,
      },
      required: true,
    }, // Sender profile

    images: [{ type: String }], // Array of image URLs
    imagesIds: [{ type: String }], // Array of image IDs
    likes: [{ type: Schema.Types.ObjectId }], // Users who liked this feedback
    replies: [ReplySchema], // Array of replies
  },
  { timestamps: true }
);

const FeedbackSchema = model("Feedback", schema);

export default FeedbackSchema;
