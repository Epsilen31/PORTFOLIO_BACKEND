import express from "express";
const skillRouter = express.Router();

import {
  addNewSkill,
  deleteSkill,
  updateSkill,
  getAllSkills,
} from "../controllers/skillController.js";
import { authenticateUser } from "./../middlewares/auth.js";

skillRouter.post("/addSkill", authenticateUser, addNewSkill);
skillRouter.delete("/delete/:id", authenticateUser, deleteSkill);
skillRouter.put("/update/:id", authenticateUser, updateSkill);
skillRouter.get("/getAllSkills", getAllSkills);

export default skillRouter;
