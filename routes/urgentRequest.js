import { Router } from "express";
import UrgentRequestModel from "../schema/urgentRequest.js";
import change from "../utils/change.js";
import {
  sendUrgentRequestDeleteEmail,
  sendUrgentRequestActivationEmail,
} from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const UrgentRequestRouter = Router();

UrgentRequestRouter.get("/urgentRequests", async (req, res) => {
  try {
    const requests = await UrgentRequestModel.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
UrgentRequestRouter.get(
  "/urgentrequests/randomurgentrequests",
  async (req, res) => {
    try {
      let requests = await UrgentRequestModel.find({ status: "active" }).limit(
        50
      );

      const firstThree = [];
      shuffleArray(requests).forEach((one, index) => {
        if (index < 3) {
          firstThree.push(one);
        }
      });

      function shuffleArray(array) {
        // Create a copy of the original array to avoid modifying it directly
        let shuffledArray = array.slice();

        // Fisher-Yates shuffle algorithm
        for (let i = shuffledArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledArray[i], shuffledArray[j]] = [
            shuffledArray[j],
            shuffledArray[i],
          ];
        }

        return shuffledArray;
      }
      const sendRequests = firstThree.map((request) => {
        return {
          ...request._doc,
          createdAt: request.createdAt?.toString(),
          updatedAt: request.updatedAt?.toString(),
          _id: request._id.toString(),
        };
      });
      res
        .status(200)
        .json(change.arrayChangeFunction(shuffleArray(sendRequests)));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
// get one
UrgentRequestRouter.get("/urgentRequests/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const request = await UrgentRequestModel.findOne({ _id });
    if (!request) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// get all for specific user
UrgentRequestRouter.get(
  "/urgentrequests/get-for-specific-user/:ownerId",
  async (req, res) => {
    const { ownerId } = req.params;
    const { authorization } = req.headers;

    try {
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

      if (verifiedToken.Id !== ownerId) {
        return res.status(400).json({
          message: "You can only edit your own post",
        });
      }

      const urgentRequests = await UrgentRequestModel.find({ ownerId });

      res.status(200).json(urgentRequests);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

UrgentRequestRouter.post("/urgentRequests", async (req, res) => {
  try {
    const newRequest = new UrgentRequestModel(req.body);

    const result = await newRequest.save();
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

UrgentRequestRouter.get("/urgentRequests-admin", async (req, res) => {
  try {
    const requests = await UrgentRequestModel.find({}).sort({
      createdAt: -1,
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

UrgentRequestRouter.delete("/urgentRequests-delete/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await UrgentRequestModel.findOneAndDelete({ _id });

    if (!result) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    sendUrgentRequestDeleteEmail(result.email, req.body.reason);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
UrgentRequestRouter.delete(
  "/user-urgentRequests-delete/:ownerId/:_id",
  async (req, res) => {
    const { _id } = req.params;

    const { ownerId } = req.params;
    const { authorization } = req.headers;

    try {
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

      if (verifiedToken.Id !== ownerId) {
        return res.status(400).json({
          message: "You can only edit your own post",
        });
      }
      const result = await UrgentRequestModel.findOneAndDelete({ _id });

      if (!result) {
        return res.status(404).json({ message: "urgent request not found" });
      }
      sendUrgentRequestDeleteEmail(result.email, req.body.reason);
      res.status(200).json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
UrgentRequestRouter.patch("/urgentRequests-activate/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await UrgentRequestModel.findOneAndUpdate(
      { _id },
      { status: "active" }
    );

    if (!result) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    sendUrgentRequestActivationEmail(result.email);
    res.status(200).json({ message: "Activated" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

UrgentRequestRouter.patch("/urgentRequests/:_id", async (req, res) => {
  const { authorization } = req.headers;
  const { _id } = req.params;
  try {
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
    if (!verifiedToken.role == "admin" || !verifiedToken.role == "manager") {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin",
        },
      });
    }
    const result = await UrgentRequestModel.findOneAndUpdate(
      { _id },
      req.body,
      { new: false }
    );
    if (!result) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    res.status(200).json({ message: "Updated", old: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
export default UrgentRequestRouter;
