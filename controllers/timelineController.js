import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Timeline from "../models/timelineSchema.js";

// Implement post timeline logic here
export const postTimeline = catchAsynError(async (req, res, next) => {
  const { title, description, from, to } = req.body;
  if (!title || !description || !from || !to) {
    return next(new ErrorHandler(400, "Please provide all required fields"));
  }
  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: { from, to },
  });
  res.status(201).json({
    success: true,
    message: "Timeline created successfully",
    data: newTimeline,
  });
});

// Implement get timeline logic here
export const getAllTimelines = catchAsynError(async (req, res, next) => {
  const timelines = await Timeline.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: timelines.length,
    data: timelines,
  });
});

// Implement delete timeline logic here
export const deleteTimelines = catchAsynError(async (req, res, next) => {
  const { id } = req.params;
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
