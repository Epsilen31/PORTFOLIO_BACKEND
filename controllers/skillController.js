import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Skill from "../models/skillSchema.js";
import { v2 as cloudinary } from "cloudinary";

// addNewSkill
const validLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const addNewSkill = catchAsynError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, "Skill SVG is required"));
  }
  const { svg } = req.files;
  const { title, proficiency } = req.body;

  if (!title || !proficiency) {
    return next(
      new ErrorHandler(400, "Skill title and proficiency are required")
    );
  }

  if (!validLevels.includes(proficiency)) {
    return next(new ErrorHandler(400, "Invalid proficiency level"));
  }

  try {
    // Upload SVG to Cloudinary
    const svgResult = await cloudinary.uploader.upload(svg.tempFilePath, {
      folder: "SKILL",
    });

    if (!svgResult || svgResult.error) {
      return next(new ErrorHandler(500, "Failed to upload skill SVG"));
    }

    // Create a new skill with the uploaded SVG
    const newSkill = new Skill({
      svg: {
        public_id: svgResult.public_id,
        url: svgResult.secure_url,
      },
      title,
      proficiency,
    });

    await newSkill.save();
    res.status(201).json({
      success: true,
      message: "Skill Created Successfully",
      data: newSkill,
    });
  } catch (error) {
    console.error("Error creating skill:", error.message);
    return next(new ErrorHandler(500, "Failed to create skill"));
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
  const { id } = req.params;
  let skill = await Skill.findById(id);
  if (!skill) {
    return next(new ErrorHandler("Skill not found!", 404));
  }
  const { proficiency } = req.body;
  skill = await Skill.findByIdAndUpdate(
    id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Skill Updated!",
    skill,
  });
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
