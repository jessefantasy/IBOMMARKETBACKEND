import { Router } from "express";
import FeedbackSchema from "../schema/feedbacks.js";
import upload from "../utils/multer.js";
import cloud from "../utils/cloudinary.js";
import { promisify } from "util";
import BusinessSchema from "../schema/business.js";
import jwt from "jsonwebtoken";

const FeedbackRouter = Router();

FeedbackRouter.get("/feedbacks/get-user-feedback-logs", async (req, res) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];

    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    const received = await FeedbackSchema.find({
      ownerId: verifiedToken.Id,
    }).sort({ createdAt: 1 });
    const sent = await FeedbackSchema.find({
      $or: [{ "senderDetails.id": verifiedToken.Id }],
    }).sort({ createdAt: 1 });
    const receivedWithType = received.map((item) => ({
      ...item.toObject(),
      fromMe: false,
    }));
    const sentWithType = sent.map((item) => ({
      ...item.toObject(),
      fromMe: true,
    }));

    res.status(201).json({
      message: "Report submitted successfully",
      report: [...receivedWithType, ...sentWithType],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

FeedbackRouter.post(
  "/feedbacks/create/:id",
  upload.fields([{ name: "images" }]),
  async (req, res) => {
    try {
      const { authorization } = req.headers;

      if (!authorization || authorization.length < 10) {
        return res.status(400).json({
          message: {
            name: "JsonWebTokenError",
            message: "invalid token",
          },
        });
      }
      const token = authorization.split("Bearer ")[1];

      const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
      const { type, grade, description } = req.body;

      if (!type || !grade || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const body = {
        ...req.body,
      };
      const businessDeatils = await BusinessSchema.findOne({
        ownerId: req.params.id,
      });

      if (!businessDeatils) {
        return res.status(404).json({ error: "Business not found" });
      }

      body.ownerDetails = {
        name: businessDeatils.businessName,
        businessId: businessDeatils._id,
        logo: businessDeatils.logo,
      };

      const senderDetails = await BusinessSchema.findOne({
        ownerId: verifiedToken.Id,
      });

      if (!senderDetails) {
        body.senderDetails = {
          id: verifiedToken.Id,
          name: "Anonymous",
          profileImage: "https://i.ibb.co/bRschFm5/User-Octagon-Bulk-80px.png", // Default anonymous image
        };
        body.weight = 0.25;
      } else {
        body.senderDetails = {
          id: senderDetails._id,
          name: senderDetails.businessName,
          profileImage: senderDetails.logo,
        };
        if (senderDetails.isVerified) {
          body.weight = 5;
        } else {
          body.weight = 0.5;
        }
      }
      if (req.files && req.files.images) {
        const imageUrls = [];
        const imageIds = [];
        await Promise.all(
          req.files.images.map(async (image) => {
            const uploadPromise = promisify(cloud.uploader.upload);
            const result = await uploadPromise(image.path);
            imageUrls.push(result.secure_url);
            imageIds.push(result.public_id);
          })
        );

        body.images = imageUrls;
        body.imagesIds = imageIds;
      }
      body.likes = [];
      body.replies = [];

      const report = new FeedbackSchema(body);

      await report.save();
      res
        .status(201)
        .json({ message: "Report submitted successfully", report });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

FeedbackRouter.get("/feedbacks/business-feedbacks", async (req, res) => {
  try {
    const reports = await FeedbackSchema.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

FeedbackRouter.get("/feedbacks/business-feedbacks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await FeedbackSchema.find({ ownerId: id });
    // if (reports.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No feedbacks found for this business" });
    // }

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default FeedbackRouter;
