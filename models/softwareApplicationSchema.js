import mongoose from "mongoose";

const softwareApplicationSchema = new mongoose.Schema({
  name: String,
  svg: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

export default mongoose.model("SoftwareApplication", softwareApplicationSchema);
