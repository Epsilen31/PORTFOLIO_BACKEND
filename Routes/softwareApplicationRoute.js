import express from "express";
const softwareApplicationRoute = express.Router();

import { authenticateUser } from "../middlewares/auth.js";
import {
  addNewApplication,
  deleteApplication,
  getAllApplication,
} from "./../controllers/softwareApplicationController.js";

softwareApplicationRoute.post("/add", authenticateUser, addNewApplication);
softwareApplicationRoute.get("/getAll", getAllApplication);
softwareApplicationRoute.delete(
  "/delete/:id",
  authenticateUser,
  deleteApplication
);

export default softwareApplicationRoute;
