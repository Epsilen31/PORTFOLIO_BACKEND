import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Skill from "../models/skillSchema.js";
import { v2 as cloudinary } from "cloudinary";

// addNewSkill
export const addNewSkill = catchAsynError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, "skill Svg are required"));
  }
  const { svg } = req.files;
  const { name, level } = req.body;
  console.log(name, level);
  if (!name || !level) {
    return next(new ErrorHandler(400, "Skill Name or level is required"));
  }

  try {
    // Upload avatar to Cloudinary
    const svgResult = await cloudinary.uploader.upload(svg.tempFilePath, {
      folder: "SKILL",
    });
    console.log(svgResult);
    if (!svgResult || svgResult.error) {
      return next(new ErrorHandler(500, "Failed to upload skill Svg"));
    }

    // Create a new timeline with the uploaded avatar
    const newSkill = new Skill({
      svg: {
        public_id: svgResult.public_id,
        url: svgResult.secure_url,
      },
      name,
      level,
    });
    console.log(newSkill);
    await newSkill.save();
    res.status(201).json({
      success: true,
      message: "Skill Created Successfully",
      data: newSkill,
    });
  } catch (error) {
    console.error("Error generating skill:", error.message);
    return next(new ErrorHandler(500, "Failed to upload skill Svg"));
  }
});

// deleteSkill
export const deleteSkill = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  const skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandler(404, "Skill not found"));
  }
  // Delete the skill from Cloudinary
  await cloudinary.uploader.destroy(skill.svg.public_id);
  // Delete the skill from the database
  await skill.deleteOne();
  res.status(200).json({
    success: true,
    message: "Skill deleted successfully",
  });
});

// updateSkill
export const updateSkill = catchAsynError(async (req, res, next) => {
  const { id } = req.params; // Extract the skill ID from the request parameters
  const { svg } = req.files; // Extract the SVG file from the request files
  const { name, level } = req.body; // Extract the name and level from the request body

  // Find the skill in the database by ID
  const skill = await Skill.findById(id);
  if (!skill) {
    // If the skill is not found, return a 404 error
    return next(new ErrorHandler(404, "Skill not found"));
  }

  // Store the public ID of the current SVG to delete it later if needed
  let oldSvgPublicId = skill.svg.public_id;

  // If a new SVG file is provided, upload it to Cloudinary
  if (svg) {
    const svgResult = await cloudinary.uploader.upload(svg.tempFilePath, {
      folder: "SKILL", // Specify the folder in Cloudinary to upload the file
    });
    if (!svgResult || svgResult.error) {
      // If the upload fails, return a 500 error
      return next(new ErrorHandler(500, "Failed to upload skill Svg"));
    }
    // Update the skill's SVG with the new public ID and URL from Cloudinary
    skill.svg = {
      public_id: svgResult.public_id,
      url: svgResult.secure_url,
    };
  }

  // Update the skill properties if new values are provided
  if (name) skill.name = name;
  if (level) skill.level = level;

  // Save the updated skill to the database
  await skill.save();

  // Delete the old SVG from Cloudinary if a new one was uploaded and it's different from the old one
  if (svg && oldSvgPublicId && oldSvgPublicId !== skill.svg.public_id) {
    await cloudinary.uploader.destroy(oldSvgPublicId);

    // Send a success response with the updated skill data
    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  }
});

// getAllSkills
export const getAllSkills = catchAsynError(async (req, res, next) => {
  const skills = await Skill.find();
  res.status(200).json({
    success: true,
    count: skills.length,
    data: skills,
  });
});
