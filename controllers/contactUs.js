import loggers from "../config/logger.js";
import { sendMail } from "../middleware/email.js";
import model from "../models/index.js";

async function contactUs(req, res) {
  const { name, emailId, phoneNumber, question, message, isRead } = req.body;

  try {
    const createContactUs = await model.ContactUs.create({
      name,
      emailId,
      phoneNumber,
      question,
      message,
      isRead,
    });
    if(createContactUs) {
      const subject = "Bubbl Contact Us - En-query";
      const emailMessage = `
  
      <h2>Hey</strong>,</h2>
  
      <p> We have received a new query from ${name}</p>
  
      <p>Regarding ${question} </p>
  
      <p>Contact details: </p>
      <p>Name ${name}</p>
      <p>Contact phoneNumber: ${phoneNumber}</p>
      <p>Contact email: ${emailId}</p>
      <p>Best regards,</p>
      <p>Bubbl Team</p>`;

      const mail = ["support@bubbl.cards", "sahil@bubbl.cards", "shashank@bubbl.cards", "admin@bubbl.cards"];
    

      const sendMails= await sendMail(mail, subject, emailMessage);
        return res.json({
        success: true,
        message: "Entered Successfully",
        createContactUs,
      });
    }
    
  } catch (error) {
    loggers.error(error+"from contactUs function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

async function NewsLetter(req, res) {
  const { emailId } = req.body;
  try {
    const createNewsLetter = await model.NewsLetter.create({
      emailId,
    });
    return res.json({
      success: true,
      message: "Thanks for Subscribing",
      createNewsLetter,
    });
  } catch (error) {
    loggers.error(error+"from NewsLetter function");
    return res.json({
      success: false,
      message: error.message,
    });
  }
}

export { contactUs, NewsLetter };
