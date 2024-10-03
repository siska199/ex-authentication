import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js";
import { mailTrapClient, mailTrapSender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (params) => {
  const { email, verificationToken, verificationTokenExpiresAt } = params;

  const recipient = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: mailTrapSender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE({
        verificationToken,
        verificationTokenExpiresAt,
      }),
      category: "Email Verification",
    });

    console.log(`Email Verification send successfully ${response}`);
  } catch (error) {
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (params) => {
  const { email, name } = params;
  const receipt = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: mailTrapSender,
      to: receipt,
      subject: "Welcome Email",
      template_uuid: "1830c18d-2f12-4e33-9167-cd5308b2a314",
      template_variables: {
        company_info_name: "Ex Authentication Nodejs",
        name,
      },
    });

    console.log(`Email sent successfully ${response}`);
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};
