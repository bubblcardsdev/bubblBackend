import config from "../config/config.js";
import { sendMail } from "../middleware/email.js";


const baseUrl = config.backendUrl || "http://devapii.bubbl.cards";
async function EmailVerificationMail(email,emailVerificationId){
    const emailMessage = `

    <h2>Hi</h2>
    
    <p>Welcome to Bubbl.cards! We’re thrilled to have you with us and can’t wait for you to experience the future of networking with our innovative digital business cards.</p>
    
    <p>Please use the link given below to verify your account and start exploring our range of cutting-edge products.</p>
    
    <p>Verification Link: <a target="_blank" href="${baseUrl}/api/verify?email=${encodeURIComponent(
          email
        )}&emailVerificationId=${encodeURIComponent(
          emailVerificationId
        )}">link</a>.</p>
    
    <p>Once verified, you can complete your profile setup!</p>
    
    <p>Check out our range of bubbl products and discover how we can streamline and enhance your professional connections today!</p>
    
    <p>Should you have any questions or need support, our team is here for you. Welcome to the future of Networking!</p>
    
    <p>Best wishes,</p>
    
    <p>The Bubbl.cards team.</p>`;
    
        const subject = "Welcome to Bubbl.cards – Let’s Get Started!";
    
        await sendMail(email, subject, emailMessage);
}
async function ForgetPasswordMail(email, emailVerificationId, user){
    const subject = "Bubbl - Change Password";
      const emailMessage = `
    <h2>Hello <strong>${user}</strong>,</h2>

    <p>Please use the link given below to verify your account to change your Bubbl Password.</p>
    
    <p>Verification Link: <a target="_blank" href="${baseUrl}/api/verify?email=${encodeURIComponent(
          email
        )}&emailVerificationId=${encodeURIComponent(
          emailVerificationId
        )}">link</a>.</p>`;

      await sendMail(email, subject, emailMessage);
    
}

async function bannerEmailClient(email,name){
  const subject = "Your Bubbl NFC Card design request is received 🚀";
    const emailMessage = `
    <h2>Dear <strong>${name}</strong>,</h2>

    <p>Thank you for your request , Your Bubbl NFC business card design request is being processed, and we’re excited to showcase it to you.</p>

    <p>What happens next?</p>
    <p>✅ Processing & designing :We’re preparing your cards design with your provided details.</p>
    <p>✅ Quality Check: Our team ensures everything is perfect before sending it to you. 
</p>
  
    <p>Estimated time for mockup: 60 minutes after we have received the high quality logo file.  if you have any updates or special requests, feel free to reply to this email we’re here to help!</p>
    <p>Stay tuned for further updates, and get ready to elevate your networking game with Bubbl!</p>

    <p>Best regards,</p>
    <p><a href="https://bubbl.cards/" >Bubbl.cards</a></p>`;
    
    await sendMail(email,subject,emailMessage);
    return "Email sent successfully";
}
async function bannerEmailSales(email,phoneNumber,name){
  const subject = `New Bubbl Card Design Assistance – ${name}`;
  const emailMessage = `
  <h2>Hey Team</strong>,</h2>

  <p>A new Bubbl card  design order has come!  🎉 Here are the details:</p>

    <p>Customer Details:</p>
    <p>👤 Name:  ${name}</p>
    <p>📧 Email: ${email}</p>
    <p>📞 Phone: ${phoneNumber}</p>

    <p>Next Steps:</p>
    <p>✅ Confirm details & process the request.</p>
    <p>✅ Print & encode the NFC card</p>
    <p>✅ Perform a quality check</p>


  <p>Let’s get this design ready! 🚀</p>

  <p>Bubbl</p>
  <p>Bubbl Support Team</p>`;
    await sendMail(email,subject,emailMessage);
    return "Email sent successfully";
}
export {EmailVerificationMail,ForgetPasswordMail,bannerEmailClient,bannerEmailSales};