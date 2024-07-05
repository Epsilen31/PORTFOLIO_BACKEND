import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import SoftwareApplication from "../models/softwareApplicationSchema.js";
import { v2 as cloudinary } from "cloudinary";

// Implement add application logic here
export const addNewApplication = catchAsynError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(
      new ErrorHandler(400, "Software Application Icon/Svg are required")
    );
  }
  const { svg } = req.files;
  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler(400, "Software Application Name is required"));
  }

  try {
    // Upload avatar to Cloudinary
    const svgResult = await cloudinary.uploader.upload(svg.tempFilePath, {
      folder: "APPLICATION SOFTWARE",
    });
    console.log(svgResult);
    if (!svgResult || svgResult.error) {
      return next(
        new ErrorHandler(500, "Failed to upload Software Application Svg")
      );
    }

    // Create a new timeline with the uploaded avatar
    const newApplication = new SoftwareApplication({
      svg: {
        public_id: svgResult.public_id,
        url: svgResult.secure_url,
      },
      name,
    });
    await newApplication.save();
    res.status(201).json({
      success: true,
      message: "Software Application Created Successfully",
      data: newApplication,
    });
  } catch (error) {
    console.error("Error generating application software:", error.message);
    return next(
      new ErrorHandler(500, "Failed to upload Software Application Svg")
    );
  }
});

// Implement get timeline logic here
export const getAllApplication = catchAsynError(async (req, res, next) => {
  const applications = await SoftwareApplication.find({});
  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// Implement delete timeline logic here
export const deleteApplication = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  const application = await SoftwareApplication.findById(id);
  if (!application) {
    return next(new ErrorHandler(404, "Software Application not found"));
  }
  // Delete the Software Application from Cloudinary
  await cloudinary.uploader.destroy(application.svg.public_id);
  // Delete the Software Application from the database
  await application.deleteOne();
  res.status(200).json({
    success: true,
    message: "Software Application deleted successfully",
  });
});
