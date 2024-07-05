import express from "express";
const projectRoute = express.Router();

import {
  deleteProject,
  addNewProject,
  updateProject,
  getAllProjects,
  getSingleProject,
} from "../controllers/projectController.js";
import { authenticateUser } from "./../middlewares/auth.js";

projectRoute.post("/addProject", authenticateUser, addNewProject);
projectRoute.delete("/delete/:id", authenticateUser, deleteProject);
projectRoute.put("/update/:id", authenticateUser, updateProject);
projectRoute.get("/getAllProject", getAllProjects);
projectRoute.get("/getSingleProject/:id", getSingleProject);

export default projectRoute;
