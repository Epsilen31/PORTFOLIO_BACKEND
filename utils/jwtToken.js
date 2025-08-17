import jwt from "jsonwebtoken";

export const generateToken = async (user, message, statusCode, res) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h", // Token expires in 10 hours
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Configure the cookie with cross-origin support and secure settings
    res
      .status(statusCode)
      .cookie("token", token, {
        expires: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours expiration
        httpOnly: true, // Prevents JavaScript from accessing the cookie (for security)
        secure: isProduction, // Send cookie only over HTTPS in production
        sameSite: isProduction ? "none" : "lax", // Allow cross-site cookie in production
      })
      .json({ success: true, message, user, token });
  } catch (error) {
    console.error("Error generating token:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
