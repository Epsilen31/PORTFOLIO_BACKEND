import express from "express";
const userRouter = express.Router();

import {
  register,
  login,
  logout,
  getUser,
  updateUser,
  updatePassword,
  getPortfolioUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { authenticateUser } from "./../middlewares/auth.js";

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", authenticateUser, logout);
userRouter.get("/getuser", authenticateUser, getUser);
userRouter.put("/update/profile", authenticateUser, updateUser);
userRouter.put("/update/password", authenticateUser, updatePassword);
userRouter.get("/getPortfolioUser/me", getPortfolioUser);
userRouter.post("/password/forgot", forgotPassword);
userRouter.put("/password/reset/:token", resetPassword);

export default userRouter;
