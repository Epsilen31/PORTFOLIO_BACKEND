import jwt from "jsonwebtoken";

export const generateToken = async (user, message, statuscode, res) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    res
      .status(statuscode)
      .cookie("token", token, {
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Set expiration time for the cookie
        httpOnly: true, // Cookie is not accessible via JavaScript (prevents XSS attacks)
        sameSite: "strict", // Cookie is sent only for same-site requests
      })
      .json({ success: true, message, user, token });
  } catch (error) {
    console.error("Error generating token:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
