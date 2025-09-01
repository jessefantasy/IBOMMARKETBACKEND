import jwt from "jsonwebtoken";
import { Router } from "express";
import RequestCallbackSchema from "../schema/requestedCallbacks.js";
import UserSchema from "../schema/user.js";

const RequestCallbackRouter = Router();

// add new request
RequestCallbackRouter.post(
  "/requested-callbacks/:ownerId",
  async (req, res) => {
    try {
      const { name, phoneNumber } = req.body;
      const { ownerId } = req.params;
      const userExist = await UserSchema.findOne({ _id: ownerId });

      if (!userExist) {
        res.statusMessage = "This user does not exist";
        return res.status(404).json({ message: "This user does not exist" });
      }
      const user = await RequestCallbackSchema.findOne({ ownerId });
      if (!user) {
        const makeCallback = new RequestCallbackSchema({
          ownerId,
          requests: [],
        });
        await makeCallback.save();

        makeCallback.requests.push({ name, phoneNumber, addressed: false });
        await makeCallback.save();
        res.statusMessage = "Message sent";
        return res.status(200).json({ message: "Request sent" });
      }
      user.requests.push({ name, phoneNumber, addressed: false });
      await user.save();
      res.statusMessage = "Message sent";
      return res.status(200).json({ message: "Request sent" });
    } catch (error) {
      return res.status(500).json({ message: "Request sent" });
    }
  }
);

// get all requests
RequestCallbackRouter.get("/requested-callbacks/:ownerId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { ownerId } = req.params;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({ message: "Invalid token in header" });
    }

    const token = authorization.split("Bearer ")[1];
    const userId = jwt.verify(token, process.env.JWTSECRET);
    const user = await UserSchema.findOne({ _id: userId.Id });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    if (userId.Id !== ownerId) {
      return res.status(400).json({
        message: "You can only view your requests",
      });
    }
    const callBack = await RequestCallbackSchema.findOne({ ownerId });

    if (!callBack) {
      const newCallback = new RequestCallbackSchema({
        ownerId,
        requests: [],
      });
      await newCallback.save();
      return res.status(200).json(newCallback);
    }
    return res.status(200).json(callBack);
  } catch (error) {
    res.statusMessage = "Something went wrong";
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// mark as addressed

// deleted addressed callback
// RequestCallbackRouter.delete();

export default RequestCallbackRouter;
