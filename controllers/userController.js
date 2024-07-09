import { catchAsynError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js"; // Import ErrorHandler class
import User from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwtToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail.js";

// Register controller
export const register = catchAsynError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    aboutme,
    phone,
    portfolioURL,
    gitHubURL,
    linkedInURL,
    instagramURL,
    twitterURL,
  } = req.body;

  // Check if user already exists
  const user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler(400, "User already exists"));
  }

  // Check if files are uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(400, "Avatar and resume are required"));
  }

  const { avatar, resume } = req.files;

  try {
    // Upload avatar to Cloudinary
    const avatarResult = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: "AVATAR",
    });
    if (!avatarResult || avatarResult.error) {
      return next(new ErrorHandler(500, "Failed to upload avatar"));
    }

    // Upload resume to Cloudinary
    const resumeResult = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "RESUME",
    });
    if (!resumeResult || resumeResult.error) {
      return next(new ErrorHandler(500, "Failed to upload resume"));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with the uploaded avatar and resume
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      aboutme,
      phone,
      portfolioURL,
      gitHubURL,
      linkedInURL,
      instagramURL,
      twitterURL,
      avatar: {
        public_id: avatarResult.public_id,
        url: avatarResult.secure_url,
      },
      resume: {
        public_id: resumeResult.public_id,
        url: resumeResult.secure_url,
      },
    });

    // Respond with success
    generateToken(newUser, "User Registered", 201, res);
  } catch (error) {
    console.error("An error occurred:", error.message);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

// Login controller
export const login = catchAsynError(async (req, res, next) => {
  try {
    // Get email and password from the request body
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new ErrorHandler(400, "Email and password are required"));
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler(404, "User not found"));
    }

    // Log the user and password information
    // console.log("Password from request:", password);
    // console.log("User from database:", user);

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler(401, "Invalid Email or Password"));
    }
    // console.log(isMatch ? "Password" : "Invalid Email");
    // Generate and send JWT token
    generateToken(user, "User logged in", 200, res);
  } catch (error) {
    console.error("An error occurred:", error.message);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

// Logout controller
export const logout = catchAsynError(async (req, res, next) => {
  try {
    // Remove the token from the response header
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "User logged out" });
  } catch (error) {
    console.error("An error occurred:", error.message);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

// Get user for admin dashboard -> authentication required
export const getUser = catchAsynError(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler(404, "User not found"));
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("An error occurred:", error.message);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

// Update user
export const updateUser = catchAsynError(async (req, res, next) => {
  try {
    const {
      name,
      email,
      aboutme,
      phone,
      portfolioURL,
      gitHubURL,
      linkedInURL,
      instagramURL,
      twitterURL,
    } = req.body;

    // Fetch user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler(404, "User not found"));
    }

    // Update avatar if uploaded
    if (req.files && req.files.avatar) {
      // Delete existing avatar from Cloudinary
      const avatarId = user.avatar.public_id;
      await cloudinary.uploader.destroy(avatarId);

      // Upload new avatar to Cloudinary
      const avatar = req.files.avatar;
      const avatarResult = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "AVATAR",
        }
      );
      if (!avatarResult || avatarResult.error) {
        return next(new ErrorHandler(500, "Failed to upload avatar"));
      }

      // Update user's avatar with new public_id and url
      user.avatar = {
        public_id: avatarResult.public_id,
        url: avatarResult.secure_url,
      };
    }

    // Update resume if uploaded
    if (req.files && req.files.resume) {
      // Delete existing resume from Cloudinary
      const resumeId = user.resume.public_id;
      await cloudinary.uploader.destroy(resumeId);

      // Upload new resume to Cloudinary
      const resume = req.files.resume;
      const resumeResult = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {
          folder: "RESUME",
        }
      );
      if (!resumeResult || resumeResult.error) {
        return next(new ErrorHandler(500, "Failed to upload resume"));
      }

      // Update user's resume with new public_id and url
      user.resume = {
        public_id: resumeResult.public_id,
        url: resumeResult.secure_url,
      };
    }

    // Update other user fields
    user.name = name;
    user.email = email;
    user.aboutme = aboutme;
    user.phone = phone;
    user.portfolioURL = portfolioURL;
    user.gitHubURL = gitHubURL;
    user.linkedInURL = linkedInURL;
    user.instagramURL = instagramURL;
    user.twitterURL = twitterURL;

    // Save updated user
    await user.save();

    // Respond with success message or token
    generateToken(user, "User updated Successfully", 200, res);
  } catch (error) {
    console.error("An error occurred:", error.message);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

// Update password
export const updatePassword = catchAsynError(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler(400, "All fields are required"));
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorHandler(401, "Incorrect current password"));
  }
  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler(400, "New password and confirm password do not match")
    );
  }
  if (newPassword === currentPassword) {
    return next(
      new ErrorHandler(
        400,
        "New password cannot be the same as current password"
      )
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// get user for portfolio -> authentication not required
export const getPortfolioUser = catchAsynError(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return next(new ErrorHandler(404, "User not found"));
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("An error occurred:", error.message);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

// Forgot Password
export const forgotPassword = catchAsynError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  try {
    if (!user) {
      return next(new ErrorHandler(404, "User not found"));
    }

    // Generate a random token for reset
    const token = crypto.randomBytes(20).toString("hex");

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Update the user's resetToken and resetTokenExpiration
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send the email with the {hashed token -> which is saved in database tempreroly}
    const resetUrl = `${process.env.DASHBOARD_URL}/password/reset/${token}`;
    console.log(resetUrl);

    // HTML email content
    const emailHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f4f4f4;">
        <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
        <p>Dear ${user.name || "User"},</p>
        <p>You are receiving this email because you requested a password reset. If you did not make this request, please ignore this email.</p>
        <p>If you did request a password reset, click the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>Thank you,<br>From Abhishek Mishra</p>
        <p>If you have any questions, please contact us at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>.</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="text-align: center; color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} MERN_PORTFOLIO. All rights reserved.</p>
        <p style="font-size: 12px;">You are receiving this email because you requested a password reset.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: emailHtmlContent,
    });

    res.status(200).json({
      success: true,
      message: "Reset link sent to the registered email",
    });
  } catch (error) {
    console.error("An error occurred:", error.message);
    user.resetPasswordToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password
export const resetPassword = catchAsynError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  console.log(resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        400,
        "Reset password token is invalid or has been expired."
      )
    );
  }

  if (!req.body.password || !req.body.confirmPassword) {
    return next(new ErrorHandler(400, "All fields are required"));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler(410, "Password & Confirm Password do not match")
    );
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetTokenExpiration = undefined;

  await user.save();
  generateToken(user, "Reset Password Successfully!", 200, res);
});
