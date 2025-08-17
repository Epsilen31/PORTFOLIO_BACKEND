import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title required"],
  },
  description: {
    type: String,
    required: [true, "description required"],
  },
  timeline: {
    from: {
      type: String,
      required: [true, "From date required"],
    },
    to: String, // Can be null for "Present"
  },
  location: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["education", "internship", "fulltime", "freelance"],
    default: "fulltime",
  },
  achievements: [{
    type: String,
  }],
  skills: [{
    type: String,
  }],
}, {
  timestamps: true
});

export default mongoose.model("Timeline", timelineSchema);
