import jwt from "jsonwebtoken";

export const generateToken = async (user, message, statusCode, res) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h", // Token expires in 10 hours
    });

    // Configure the cookie with cross-origin support and secure settings
    res
      .status(statusCode)
      .cookie("token", token, {
        expires: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours expiration
        httpOnly: true, // Prevents JavaScript from accessing the cookie (for security)
        secure: process.env.NODE_ENV === "production", // Set to true in production (requires HTTPS)
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // 'none' for cross-site requests in production
      })
      .json({ success: true, message, user, token });
  } catch (error) {
    console.error("Error generating token:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
