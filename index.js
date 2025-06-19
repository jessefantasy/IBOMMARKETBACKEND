import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import PostsRoute from "./routes/posts.js";
import AdvertSlideRoute from "./routes/advertSlide.js";
import UrgentRequestRouter from "./routes/urgentRequest.js";
import CategoriesRouter from "./routes/categories.js";
import UserRouter from "./routes/user.js";
import BusinessesRouter from "./routes/business.js";
import RolesRouter from "./routes/roles.js";
import ManagerRouter from "./routes/manager.js";
import ManagerTasksRouter from "./routes/managerTasks.js";
import RequestCallbackRouter from "./routes/requestedCallbacks.js";
import SavedRouter from "./routes/saved.js";
import UiConfigRouter from "./routes/uiconfig.js"; // Assuming you have a UiConfigRouter for UI configuration

// import

dotenv.config();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://ibommarketfrontend.onrender.com",
    "https://ibommarketbackendmin.onrender.com",
    "https://ibommarketfrontend-a0qt.onrender.com",
  ],
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
  credentials: true,
};

const server = express();
server.use(cors(corsOptions));
server.use(express.json());
server.use(cookieParser());
server.use((req, res, next) => {
  res.cookie("ibm-post-visits", "", {
    secure: true,
    sameSite: "none",
    domain: "https://ibommarketfrontend-a0qt.onrender.com",
  });
  next();
});

server.use("/", PostsRoute);
server.use("/", AdvertSlideRoute);
server.use("/", UrgentRequestRouter);
server.use("/", CategoriesRouter);
server.use("/", UserRouter);
server.use("/", BusinessesRouter);
server.use("/", RolesRouter);
server.use("/", ManagerRouter);
server.use("/", ManagerTasksRouter);
server.use("/", RequestCallbackRouter);
server.use("/", SavedRouter);
server.use("/", UiConfigRouter);
server.get("/", (req, res) => {
  console.log(res.cookie["ibm-device-id"]);
  console.log(res.cookies);
  res
    .status(200)
    .json({ message: "Done", cookie: req.cookies["ibm-device-id"] });
});

async function connectMongo() {
  console.log("Starting");
  try {
    await mongoose.connect(process.env.MONGOCONNECTIONSTRING);
    console.log("CONNECTED");
    server.listen(3000, () => {
      console.log("Server running on port 3000");
    });
    // makeAnalytics();
  } catch (error) {
    console.log(error);
  }
}

connectMongo();
// server.listen(3000, () => {
//   console.log("Server running on port 3000");
// });
