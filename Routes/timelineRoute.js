import express from "express";
const timelineRoute = express.Router();

import {
  postTimeline,
  getAllTimelines,
  deleteTimelines,
  updateTimeline,
} from "../controllers/timelineController.js";
import { authenticateUser } from "../middlewares/auth.js";

timelineRoute.post("/add", postTimeline);
timelineRoute.get("/getAll", getAllTimelines);
timelineRoute.put("/update/:id", authenticateUser, updateTimeline);
timelineRoute.delete("/delete/:id", authenticateUser, deleteTimelines);

export default timelineRoute;
