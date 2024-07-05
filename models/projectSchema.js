import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Name is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  technologyStack: {
    type: [String],
    validate: [arrayLimit, "At least one technology is required"],
  },
  githublink: String,
  deployementlink: String,
  projectBanner: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

function arrayLimit(val) {
  return val.length > 0;
}

export default mongoose.model("Project", projectSchema);
