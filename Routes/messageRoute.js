import express from "express";
const messageRouter = express.Router();

import {
  createMessage,
  getAllMessages,
  getSingleMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import { authenticateUser } from "../middlewares/auth.js";

messageRouter.post("/send", createMessage);
messageRouter.get("/getAll", getAllMessages);
messageRouter.get("/getSingle/:id", getSingleMessage);
messageRouter.delete("/delete/:id", authenticateUser, deleteMessage);

export default messageRouter;
