import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Project from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

// Function to add a new project
export const addNewProject = catchAsynError(async (req, res, next) => {
  // Check if any files are uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, "Project Banner Images are required"));
  }

  // Extract the project banner from the uploaded files
  const { projectBanner } = req.files;

  // Check if the project banner is provided
  if (!projectBanner) {
    return next(new ErrorHandler(400, "Project Banner is required"));
  }

  // Extract data from the request body
  const { title, description, technologyStack, githublink, deployementlink } =
    req.body;

  // Check if all required fields are provided
  if (
    !title ||
    !description ||
    !technologyStack ||
    !githublink ||
    !deployementlink
  ) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  // Upload the project banner to Cloudinary
  const bannerResult = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    {
      folder: "PROJECT BANNER",
    }
  );

  // Check if the banner upload was successful
  if (!bannerResult || bannerResult.error) {
    return next(new ErrorHandler(500, "Failed to upload project banner"));
  }

  // Create a new project with the provided data and uploaded banner details
  const newProject = await Project.create({
    title,
    description,
    technologyStack,
    githublink,
    deployementlink,
    projectBanner: {
      public_id: bannerResult.public_id,
      url: bannerResult.secure_url,
    },
  });

  // Send a success response with the new project data
  res.status(201).json({
    success: true,
    message: "Project added successfully",
    data: newProject,
  });
});

// Delete project
export const deleteProject = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler(400, "Project ID is required"));
  }
  // check project available or not
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler(404, "Project not found"));
  }
  //   delete banner from cloudinary
  const bannerId = project.projectBanner.public_id;
  await cloudinary.uploader.destroy(bannerId);
  //   delete from db
  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

// Function to update an existing project
export const updateProject = catchAsynError(async (req, res, next) => {
  const { id } = req.params; // Extract the project ID from request parameters

  // Check if project ID is provided
  if (!id) {
    return next(new ErrorHandler(400, "Project ID is required"));
  }

  // Find the project by ID in the database
  const project = await Project.findById(id);

  // If the project is not found, return a 404 error
  if (!project) {
    return next(new ErrorHandler(404, "Project not found"));
  }

  // Extract data from the request body
  const { title, description, technologyStack, githublink, deployementlink } =
    req.body;
  const { projectBanner } = req.files || {}; // Extract the banner image from the request files, if any

  let oldBannerPublicId = project.projectBanner.public_id;
  // If a new banner image is provided, upload it to Cloudinary
  if (projectBanner) {
    const bannerResult = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PROJECT BANNER", // Specify the folder in Cloudinary to upload the file
      }
    );

    // If the upload fails, return a 500 error
    if (!bannerResult || bannerResult.error) {
      return next(new ErrorHandler(500, "Failed to upload project banner"));
    }

    // Save the new banner image details in the project object
    project.projectBanner = {
      public_id: bannerResult.public_id,
      url: bannerResult.secure_url,
    };
  }

  // Update the project fields with the new data from the request body, if provided
  if (title) project.title = title;
  if (description) project.description = description;
  if (technologyStack) project.technologyStack = technologyStack;
  if (githublink) project.githublink = githublink;
  if (deployementlink) project.deployementlink = deployementlink;

  // Save the updated project to the database
  await project.save();

  // Delete the old projectBanner from Cloudinary if a new one was uploaded and it's different from the old one
  if (
    projectBanner &&
    oldBannerPublicId &&
    oldBannerPublicId !== project.projectBanner.public_id
  ) {
    await cloudinary.uploader.destroy(oldBannerPublicId);

    // Send a success response with the updated project data
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  }
});

// Function to Get All Project an existing project
export const getAllProjects = catchAsynError(async (req, res, next) => {
  const projects = await Project.find({});
  res.status(200).json({
    success: true,
    data: projects,
  });
});

// Function to Get Single Project an existing project  by ID
export const getSingleProject = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler(400, "Project ID is required"));
  }
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler(404, "Project not found"));
  }
  res.status(200).json({
    success: true,
    data: project,
  });
});
