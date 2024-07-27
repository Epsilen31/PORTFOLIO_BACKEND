import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Project from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

// Function to add a new project
export const addNewProject = catchAsynError(async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler(400, "Project Banner Images are required"));
    }

    const { projectBanner } = req.files;
    if (!projectBanner) {
      return next(new ErrorHandler(400, "Project Banner is required"));
    }

    const {
      title,
      description,
      technologyStack,
      githublink,
      deployementlink,
      stack,
      deployed = "No", // Default value if not provided
    } = req.body;

    if (!title || !description || !technologyStack || !githublink) {
      return next(new ErrorHandler(400, "All fields are required"));
    }

    const bannerResult = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PROJECT BANNER",
      }
    );

    if (!bannerResult || bannerResult.error) {
      return next(new ErrorHandler(500, "Failed to upload project banner"));
    }

    const newProject = await Project.create({
      title,
      description,
      technologyStack: technologyStack.split(","),
      stack: stack || technologyStack.split(",").join(", "), // Default to a comma-separated string of technologies
      deployed, // Use the provided value or the default "No"
      githublink,
      deployementlink,
      projectBanner: {
        public_id: bannerResult.public_id,
        url: bannerResult.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      data: newProject,
    });
  } catch (error) {
    return next(new ErrorHandler(error));
  }
});

// Delete project
export const deleteProject = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler(400, "Project ID is required"));
  }

  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler(404, "Project not found"));
  }

  const bannerId = project.projectBanner.public_id;
  await cloudinary.uploader.destroy(bannerId);

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

// Function to update an existing project
export const updateProject = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHandler(400, "Project ID is required"));
  }

  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler(404, "Project not found"));
  }

  const {
    title,
    description,
    technologyStack,
    githublink,
    deployementlink,
    stack,
    deployed,
  } = req.body;
  const { projectBanner } = req.files || {};

  let oldBannerPublicId = project.projectBanner.public_id;
  if (projectBanner) {
    const bannerResult = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PROJECT BANNER",
      }
    );

    if (!bannerResult || bannerResult.error) {
      return next(new ErrorHandler(500, "Failed to upload project banner"));
    }

    project.projectBanner = {
      public_id: bannerResult.public_id,
      url: bannerResult.secure_url,
    };
  }

  if (title) project.title = title;
  if (description) project.description = description;
  if (technologyStack) project.technologyStack = technologyStack.split(",");
  if (stack) project.stack = stack;
  if (deployed) project.deployed = deployed;
  if (githublink) project.githublink = githublink;
  if (deployementlink) project.deployementlink = deployementlink;

  await project.save();

  if (
    projectBanner &&
    oldBannerPublicId &&
    oldBannerPublicId !== project.projectBanner.public_id
  ) {
    await cloudinary.uploader.destroy(oldBannerPublicId);
  }

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

// Function to Get All Projects
export const getAllProjects = catchAsynError(async (req, res, next) => {
  const projects = await Project.find({});
  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// Function to Get Single Project by ID
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
