/* eslint-disable linebreak-style */
import { nanoid } from "nanoid";
import { sendMailSchema, verifyEmailSchema } from "../validations/auth.js";
import model from "../models/index.js";
import { EmailVerificationMail, ForgetPasswordMail } from "./mailer.js";

const clients = {};
const verificationStatus = {};
const verificationId = {};
async function SSE(req, res) {
  const email = req.query.email;
  if (!email) {
    return res.status(400).send("Client email is required");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    clients[email] = res;
    if (!email) {
      return res.status(400).send("Client email is required");
    }
    res.write(`data: ${JSON.stringify({ status: "Pending" })}\n\n`);
  } catch (error) {
    console.error("Error in /events endpoint:", error);
    res.status(500).send("Internal server error");
  }
}

async function verifyMail(req, res) {
  const { email, emailVerificationId } = req.query;
  // Decode the email and verification ID
  const decodedEmail = decodeURIComponent(email);
  const decodedEmailVerificationId = decodeURIComponent(emailVerificationId);
  const { error } = verifyEmailSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    console.log(error, "setError");

    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }
  try {
    if (!decodedEmail || !decodedEmailVerificationId) {
      return res.status(400).send("Email and token are required");
    }
    if (verificationStatus[decodedEmail] === "Pending") {
      verificationStatus[decodedEmail] = "Verified";
      if (clients[decodedEmail]) {
        if(verificationId[decodedEmail] !== decodedEmailVerificationId){
          return res.json({
            success: false,
            message: "Verification Failed, please try again"
          });
        }
        clients[decodedEmail].write(
          `data: ${JSON.stringify({ status: 200, message: "Verified" })}\n\n`
        );
        // clients[decodedEmail].write(` ${JSON.stringify({ message: "Verified" })}\n\n`);
        clients[decodedEmail].end();
        delete clients[decodedEmail];
      }
      return res.redirect(
        `/api/email-verified?email=${encodeURIComponent(decodedEmail)}`
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
}

async function sendForgetPassword(req, res) {
  const { email  } = req.body;
  const { error } = sendMailSchema.validate(req.body, {
    abortEarly: false,
  });
  const checkEmail = await model.User.findOne({
    where: { email: email },
  });
  if (!checkEmail) {
    return res.json({
      success: false,
      data: {
        message: "Couldn't find User",
      },
    });
  }
  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    verificationStatus[email] = "Pending";
    const emailParse = email.toLowerCase();
    const emailVerificationId = nanoid();
    verificationId[email] = emailVerificationId;
    let forgotPasswordId;
    if(checkEmail){
       forgotPasswordId = nanoid();

      await model.User.update(
        { forgotPasswordId: forgotPasswordId },
        {
          where: {
            id: checkEmail.id,
          },
        }
      );
      await ForgetPasswordMail(emailParse, emailVerificationId,checkEmail.firstName);
    };
    return res.json({
      success: true,
      data: {
        message: "Email sent successfully",
        forgotPasswordId: forgotPasswordId,
      },
    });
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    return res.status(500).send("Internal server error");
  }
}

async function sendEmail(req, res) {
  const { email  } = req.body;
  const { error } = sendMailSchema.validate(req.body, {
    abortEarly: false,
  });
  const checkEmail = await model.User.findOne({
    where: { 
      email: email,
      emailVerified: true
     },
  });
  if (checkEmail) {
    return res.json({
      success: false,
      data: {
        message: "Email already exists",
      },
    });
  }
  if (error) {
    return res.json({
      success: false,
      data: {
        error: error.details,
      },
    });
  }

  try {
    verificationStatus[email] = "Pending";
    const emailParse = email.toLowerCase();
    const emailVerificationId = nanoid();
    verificationId[email] = emailVerificationId;
    await EmailVerificationMail(emailParse,emailVerificationId);
    return res.json({
      success: true,
      data: {
        message: "Email sent successfully",
      },
    });
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    return res.status(500).send("Internal server error");
  }
}

async function emailVerified(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Email is required");
  }

  // Show the "Email Verified" page with a thumbs-up icon
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified</title>
      <style>
      body, html {
      height: 100%;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
      background-image: url("./Image/bubbl-patter-img.png");
      background-repeat: no-repeat;
      background-size: cover; /* Make the background stretch to fit the page */
      background-color: #050505; /* Light background color */
    }

    /* Box container styles */
    .container {
      padding: 20px;
      border-radius: 8px; /* Rounded corners */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
      text-align: center;
      width: 300px; /* You can adjust the width */
      border: 1px solid #ddd; /* Optional border */
    }

    /* Heading style */
    h1 {
      color: #4CAF50; /* Green color */
      font-size: 34px;
      margin-bottom: 10px;
      text-align: center;
    }

    div {
      padding: 5%;
      border-radius: 20px;
      background-color: #18171E;
    }

    /* Paragraph style */
    p {
      color: #fff;;
      font-size: 19px;
      margin: 10px 0;
      text-align: center;
    }
  </style>
    </head>
    <body>
    <div>
      <h1>Email Verified! 👍</h1>
      <p>Congratulations! Your email ${email} has been successfully verified.</p>
    <div>
    </body>
    </html>
  `;

  res.send(htmlContent);
}

export { SSE, verifyMail, sendEmail, emailVerified, sendForgetPassword };
