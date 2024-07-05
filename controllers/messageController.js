import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Message from "../models/messageSchema.js";

// Create Message controller
export const createMessage = catchAsynError(async (req, res, next) => {
  const { senderName, message, subject } = req.body;

  // Check if all required fields are provided
  if (!senderName || !message || !subject) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Create a new message document in the database
  const newMessage = await Message.create({ senderName, message, subject });

  // Respond with success message and data
  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
});

// Get all messages controller
export const getAllMessages = catchAsynError(async (req, res, next) => {
  // Get all messages from the database in descending order of creation date
  const messages = await Message.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

// Get a single message controller
export const getSingleMessage = catchAsynError(async (req, res, next) => {
  // Find the message by its ID
  const message = await Message.findById(req.params.id);

  // If the message is not found, return a 404 error
  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// delete Message
export const deleteMessage = catchAsynError(async (req, res, next) => {
  // find ID from params
  const { id } = req.params;
  // Find the message by its ID
  const message = await Message.findById(id);
  // print message
  console.log("Message :", message);
  // If the message is not found, return a 404 error
  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }
  // If the message is found, delete it
  await message.deleteOne();
  // return response
  res.status(201).json({
    success: true,
    message: "Message deleted successfully",
  });
});
