import UiConfigSchema from "../schema/uiconfig.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
// import { verifyToken } from "../utils/jwt.js";

const UiConfigRouter = Router();

UiConfigRouter.get("/admin-uiconfig", async (req, res) => {
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
    if (
      verifiedToken.role !== "admin" &&
      (verifiedToken.username !== "AJ" || verifiedToken.username !== "Jess")
    ) {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin",
        },
      });
    }

    // Fetch the UI configuration from the database
    const uiConfig = await UiConfigSchema.find();

    res.json(uiConfig);
  } catch (error) {
    console.error("Error fetching UI config:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

UiConfigRouter.post("/admin-uiconfig", async (req, res) => {
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
    if (
      verifiedToken.role !== "admin" &&
      (verifiedToken.username !== "AJ" || verifiedToken.username !== "Jess")
    ) {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin",
        },
      });
    }

    // Create a new UI configuration
    const newUiConfig = new UiConfigSchema(req.body);
    await newUiConfig.save();

    res.status(201).json(newUiConfig);
  } catch (error) {
    console.error("Error creating UI config:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default UiConfigRouter;
