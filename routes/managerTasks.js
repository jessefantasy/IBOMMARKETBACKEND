import { Router } from "express";
import jwt from "jsonwebtoken";
import ManagerTaskSchema from "../schema/managerTasks.js";

const ManagerTasksRouter = Router();

ManagerTasksRouter.get("/admin-manager-get-tasks", async (req, res) => {
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
    if (!verifiedToken.role == "admin" || !verifiedToken.role == "manager") {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin or manager",
        },
      });
    }

    const tasks = await ManagerTaskSchema.find({});

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json(error);
  }
});

ManagerTasksRouter.post("/admin-manager-post-tasks", async (req, res) => {
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
    if (!verifiedToken.role == "admin") {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin",
        },
      });
    }
    const task = new ManagerTaskSchema(req.body);

    const savedTask = await task.save();

    res.status(200).json({ ...savedTask._doc });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default ManagerTasksRouter;
