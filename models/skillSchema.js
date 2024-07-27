import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  proficiency: {
    type: String,
    required: true,
  },
  svg: {
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

export default mongoose.model("Skill", skillSchema);
