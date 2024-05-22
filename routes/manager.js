import { Router } from "express";
import { signToken } from "../utils/jwt.js";
import { sendRoleActvationMail } from "../utils/sendEmail.js";
import ManagerSchema from "../schema/manager.js";
import jwt from "jsonwebtoken";

const ManagerRouter = Router();

// add manager
ManagerRouter.post("/admin-add-manager", async (req, res) => {
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
    console.log(token);
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(verifiedToken);
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
    const roleDetails = { ...req.body };
    const defaultPassword =
      req.body.fullName.split(" ")[0].toLowerCase() + "@ibmommarket.com";
    console.log(defaultPassword);

    if (req.body.role !== "manager") {
      return res.status(400).json({
        message: {
          name: "Role type Error",
          message: "You ccan only add manager!",
        },
      });
    }
    const newRole = ManagerSchema({
      ...roleDetails,
      password: defaultPassword,
    });

    const role = await newRole.save();

    const activationToken = signToken(
      {
        Id: role._id,
      },
      "10m"
    );
    sendRoleActvationMail();
    res.status(200).json(role);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// admin get managers
ManagerRouter.get("/admin-get-manager", async (req, res) => {
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
    console.log(token);
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(verifiedToken);
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

    const managers = await ManagerSchema.find({}).sort({ updatedAt: -1 });

    return res.status(200).json({ managers });
  } catch (error) {}
});

export default ManagerRouter;