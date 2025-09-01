import ReportAbuseSchema from "../schema/reportAbuse.js";
import { Router } from "express";
import upload from "../utils/multer.js";
import cloud from "../utils/cloudinary.js";
import { promisify } from "util";

const ReportAbuseRouter = Router();

ReportAbuseRouter.post(
  "/user-report-abuse",
  upload.fields([{ name: "images" }]),
  async (req, res) => {
    try {
      const { reporterId, productId, reason, details } = req.body;

      if (!reporterId || !productId || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const report = new ReportAbuseSchema({
        reporterId,
        productId,
        reason,
        details,
      });

      // Handle optional images and imagesIds if provided
      if (req.files && req.files.images) {
        const imageUrls = [];
        const imageIds = [];
        await Promise.all(
          req.files.images.map(async (image) => {
            const uploadPromise = promisify(cloud.uploader.upload);
            const result = await uploadPromise(image.path);
            const { public_id, secure_url } = result;
            imageUrls.push(secure_url);
            imageIds.push(public_id);
          })
        );
        console.log("Uploaded images:", imageUrls); // Log the uploaded images
        console.log("Image IDs:", imageIds); // Log the image IDs

        report.images = imageUrls;
        report.imagesIds = imageIds;
      }

      await report.save();
      res
        .status(201)
        .json({ message: "Report submitted successfully", report });
    } catch (error) {
      console.error("Error submitting report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

ReportAbuseRouter.get("/reports", async (req, res) => {
  try {
    const reports = await ReportAbuseSchema.find();

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default ReportAbuseRouter;
