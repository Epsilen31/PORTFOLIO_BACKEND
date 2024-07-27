import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Name is required"],
  },
  description: String,
  technologyStack: [String], // Change this line to an array of strings
  stack: String,
  deployed: String,
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

export default mongoose.model("Project", projectSchema);
