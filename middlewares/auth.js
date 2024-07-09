import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js"; // Import ErrorHandler class
import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";

// Authenticate user
export const authenticateUser = catchAsynError(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new ErrorHandler(401, "User not authenticated"));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the decoded token has an ID
    if (!decoded.id) {
      return next(new ErrorHandler(403, "Invalid token"));
    }

    // Fetch the user from the database
    const user = await User.findById(decoded.id);

    // Check if the user still exists
    if (!user) {
      return next(new ErrorHandler(404, "User no longer exists"));
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler(403, "Token expired"));
    } else if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler(403, "Invalid token"));
    } else {
      return next(new ErrorHandler(500, "Internal Server Error"));
    }
  }
});
