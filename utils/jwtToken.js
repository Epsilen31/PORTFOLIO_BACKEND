import jwt from "jsonwebtoken";

export const generateToken = async (user, message, statuscode, res) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    res
      .status(statuscode)
      .cookie("token", token, {
        expiresIn: 10 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      .json({ success: true, message, user, token });
  } catch (error) {
    console.error("Error generating token:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
