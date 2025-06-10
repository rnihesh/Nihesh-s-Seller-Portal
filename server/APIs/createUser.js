const {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} = require("@react-email/components");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const User = require("../models/user.prod.model.js");

async function createUser(req, res) {
  try {
    const newUser = req.body;
    const userInDb = await User.findOne({ email: newUser.email });

    if (userInDb !== null) {
      return res
        .status(200)
        .send({ message: newUser.firstName, payload: userInDb });
    } else {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      newUser.verifyCode = verifyCode;
      let newUser1 = new User(newUser);
      let newUserDoc = await newUser1.save();

      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: newUser.email,
          subject: "Nihesh Seller Portal |  Verification Code",
          html: `
            <!DOCTYPE html>
            <html lang="en" dir="ltr">
              <head>
                <title>Verification Code</title>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <style>
                  @font-face {
                    font-family: 'Roboto';
                    font-style: normal;
                    font-weight: 400;
                    src: url(https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2) format('woff2');
                  }
                  body {
                    font-family: 'Roboto', Verdana, sans-serif;
                  }
                </style>
              </head>
              <body>
                <div>
                  <h2>Hello ${newUser.firstName},</h2>
                  <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
                  <p style="font-size: 20px; font-weight: bold;">${verifyCode}</p>
                  <p>If you did not request this code, please ignore this email.</p>
                </div>
              </body>
            </html>
          `,
          text: `Hello ${newUser.firstName},\n\nThank you for registering. Please use the following verification code to complete your registration:\n\n${verifyCode}\n\nIf you did not request this code, please ignore this email.`,
        });

        return res.status(201).send({
          message: newUserDoc.firstName,
          payload: newUserDoc,
          emailStatus: "Verification email sent successfully",
        });
      } catch (emailError) {
        console.log("Error sending verification email: ", emailError);
        return res.status(201).send({
          message: newUserDoc.firstName,
          payload: newUserDoc,
          emailStatus: "Failed to send verification email",
        });
      }
    }
  } catch (error) {
    console.log("Error in createUser:", error);
    return res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
}

module.exports = createUser;
