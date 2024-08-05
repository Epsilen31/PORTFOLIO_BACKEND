import jwt from "jsonwebtoken";

export const generateToken = async (user, message, statuscode, res) => {
  const token = user.generateJsonWebToken();
  res
    .status(statuscode)
    .cookie("token", token, {
      expires: new Date(Date.now() + 15 * 60 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
