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

// Enable CORS for both frontend and backend
app.use(
  "*",
  cors({
    origin: [
      process.env.MONGO_URL,
      process.env.DASHBOARD_URL,
      process.env.PORTFOLIO_URL,
    ],
    credentials: true,
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Connect to the database
connectDB();

// Define routes here (example route)
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRoute);
app.use("/api/v1/softwareApplication", softwareApplicationRoute);
app.use("/api/v1/skills", skillRoute);
app.use("/api/v1/project", projectRoute);

// set cloudinary

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
