import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js"
import { mailTrapClient, mailTrapSender } from "./mailtrap.config.js"

export const sendVerificationEmail = async(params)=>{
    const {email, verificationToken, verificationTokenExpiresAt} = params

    const recipient = [{email}]


    try {
        const response = await mailTrapClient.send({
            from    : mailTrapSender,
            to      : recipient,
            subject : "Verify your email",
            html    : VERIFICATION_EMAIL_TEMPLATE({
                verificationToken,
                verificationTokenExpiresAt
            }), 
            category : "Email Verification"
        })

        console.log("Email sent successfully: ", response)

    } catch (error) {
        throw new Error (`Error sending verification email: ${error.message}`)
    }
}