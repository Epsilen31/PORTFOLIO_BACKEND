import express from "express";
import connectDB from "./database/db.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import { globalErrorHandler } from "./middlewares/error.js";
import messageRouter from "./Routes/messageRoute.js";
import userRouter from "./Routes/userRoute.js";
import timelineRoute from "./Routes/timelineRoute.js";
import softwareApplicationRoute from "./Routes/softwareApplicationRoute.js";
import skillRoute from "./Routes/skillRoute.js";
import projectRoute from "./Routes/projectRoute.js";

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Middleware to handle file uploads
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "http://localhost:5174", // Local development (if applicable)
  "https://epsilon-dashboard.netlify.app", // Production
  "https://epsilen-portfolio.netlify.app", // Add any other production URLs here
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: "include",
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Connect to the database
connectDB();

// Define routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRoute);
app.use("/api/v1/softwareApplication", softwareApplicationRoute);
app.use("/api/v1/skills", skillRoute);
app.use("/api/v1/project", projectRoute);

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Error handling middleware
app.use(globalErrorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
