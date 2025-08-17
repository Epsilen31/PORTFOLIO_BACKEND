import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Timeline from "../models/timelineSchema.js";

// Implement post timeline logic here
export const postTimeline = catchAsynError(async (req, res, next) => {
  const { title, description, from, to, location, type, achievements, skills } = req.body;
  
  if (!title || !description || !from) {
    return next(new ErrorHandler(400, "Please provide title, description, and from date"));
  }

  // Validate type if provided
  if (type && !["education", "internship", "fulltime", "freelance"].includes(type)) {
    return next(new ErrorHandler(400, "Invalid type. Must be one of: education, internship, fulltime, freelance"));
  }

  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: { from, to: to || null },
    location: location || "",
    type: type || "fulltime",
    achievements: achievements || [],
    skills: skills || [],
  });

  res.status(201).json({
    success: true,
    message: "Timeline created successfully",
    data: newTimeline,
  });
});

// Implement get timeline logic here
export const getAllTimelines = catchAsynError(async (req, res, next) => {
  const timelines = await Timeline.find().sort({ "timeline.from": -1 });
  res.status(200).json({
    success: true,
    count: timelines.length,
    data: timelines,
  });
});

// Implement delete timeline logic here
export const deleteTimelines = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(new ErrorHandler(400, "Timeline ID is required"));
  }

  const timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler(404, "Timeline not found"));
  }
  
  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: "Timeline deleted successfully",
  });
});

// Implement update timeline logic here
export const updateTimeline = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, from, to, location, type, achievements, skills } = req.body;
  
  if (!id) {
    return next(new ErrorHandler(400, "Timeline ID is required"));
  }

  const timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler(404, "Timeline not found"));
  }

  // Update fields
  if (title) timeline.title = title;
  if (description) timeline.description = description;
  if (from) timeline.timeline.from = from;
  if (to !== undefined) timeline.timeline.to = to;
  if (location !== undefined) timeline.location = location;
  if (type) {
    if (!["education", "internship", "fulltime", "freelance"].includes(type)) {
      return next(new ErrorHandler(400, "Invalid type. Must be one of: education, internship, fulltime, freelance"));
    }
    timeline.type = type;
  }
  if (achievements !== undefined) timeline.achievements = achievements;
  if (skills !== undefined) timeline.skills = skills;

  await timeline.save();

  res.status(200).json({
    success: true,
    message: "Timeline updated successfully",
    data: timeline,
  });
});
