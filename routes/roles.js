import { Router } from "express";
import RolesSchema from "../schema/roles.js";
import {
  verifyToken,
  signToken,
  processRoleAuthorizationToken,
} from "../utils/jwt.js";
import { hashFunction } from "../utils/hash.js";
import { sendRoleActvationMail } from "../utils/sendEmail.js";

const RolesRouter = Router();

// admin add role
RolesRouter.post("/add-role", async (req, res) => {
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
    const newRole = RolesSchema({
      ...roleDetails,
    });

    const role = await newRole.save();

    const activationToken = signToken(
      {
        Id: role._id,
      },
      "10m"
    );
    const sendEmailResponse = sendRoleActvationMail();
    res.status(200).json({ ...role._doc, defaultPassword });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// activate role
RolesRouter.get("/activate-role", async (req, res) => {
  console.log("TRYING");
  try {
    const { token } = req.query;
    const verifiedToken = verifyToken(token);

    if (!verifiedToken.Id) {
      return res.status(400).json({ message: "Invalid tokn" });
    }

    const role = await RolesSchema.findOneAndUpdate(
      { _id: verifiedToken.Id },
      { status: "active" },
      { new: true }
    );

    return res.status(200).json(role);
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ error });
  }
});

RolesRouter.patch("/role/edit-password", async (req, res) => {
  try {
    const verifiedToken = processRoleAuthorizationToken(req, res);
    console.log(verifiedToken);
    const hashedPassword = await hashFunction(req.body.password);
    const role = await RolesSchema.findOneAndUpdate(
      { _id: verifiedToken.Id },
      { password: hashedPassword },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    req.status(500).json(error);
  }
});

RolesRouter.post("/role/rend-password-reset", async (req, res) => {
  try {
    const { authorization } = req.headers;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

RolesRouter.post("/role/edit-post", async (req, res) => {});
export default RolesRouter;
