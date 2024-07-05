import nodemailer from "nodemailer";

// Create a reusable transporter object using the default SMTP transport
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Changed from SMTP_SERVICE to SMTP_HOST
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT == 465, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email with defined transport object
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to,
      subject,
      html,
      headers: {
        "X-Priority": "1", // High priority
        "X-MSMail-Priority": "High", // High priority
        Importance: "High", // High priority
      },
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};
