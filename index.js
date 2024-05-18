import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import PostsRoute from "./routes/posts.js";
import AdvertSlideRoute from "./routes/advertSlide.js";
import UrgentRequestRouter from "./routes/urgentRequest.js";
import CategoriesRouter from "./routes/categories.js";
import UserRouter from "./routes/user.js";
import BusinessesRouter from "./routes/business.js";
// import

dotenv.config();
const corsOptions = {
  origin: "*",
  methods: "*",
  optionSuccessStauts: 204,
};

const server = express();
server.use(cors(corsOptions)); 
server.use(express.json());

server.use("/", PostsRoute);
server.use("/", AdvertSlideRoute);
server.use("/", UrgentRequestRouter);
server.use("/", CategoriesRouter);
server.use("/", UserRouter); 
server.use("/", BusinessesRouter);
server.get("/", (req, res) => {
  res.status(200).json({ message: "Done" });
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
