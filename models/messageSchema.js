import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      minlength: [2, "Name must contain atleast 2 character"],
      required: [true, "Sender's name is required"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      minlength: [2, "Subject must contain atleast 2 character"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [5, "Message must contain atleast 5 character"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
