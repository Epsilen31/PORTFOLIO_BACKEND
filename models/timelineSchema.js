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
      type: Date,
      required: [true, "From date required"],
    },
    to: String,
  },
});

export default mongoose.model("Timeline", timelineSchema);
