import { Router } from "express";
import UrgentRequestModel from "../schema/urgentRequest.js";
import change from "../utils/change.js";

const UrgentRequestRouter = Router();

UrgentRequestRouter.get("/urgentRequests", async (req, res) => {
  try {
    const requests = await UrgentRequestModel.find();
    res.status(200).json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
UrgentRequestRouter.get(
  "/urgentrequests/randomurgentrequests",
  async (req, res) => {
    try {
      let requests = await UrgentRequestModel.find().limit(50);

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
        .json(change.arrayChangeFunctin(shuffleArray(sendRequests)));
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
// get one
UrgentRequestRouter.get("/urgentRequests/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const request = await UrgentRequestModel.findOne({ _id });
    console.log(request);
    if (!request) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

UrgentRequestRouter.delete("/urgentRequests/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await UrgentRequestModel.findOneAndDelete({ _id });
    console.log(result);
    if (!result) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
UrgentRequestRouter.patch("/urgentRequests/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await UrgentRequestModel.findOneAndUpdate(
      { _id },
      req.body,
      { new: false }
    );
    console.log(result);
    if (!result) {
      return res.status(404).json({ message: "urgent request not found" });
    }
    res.status(200).json({ message: "Updated", old: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default UrgentRequestRouter;
