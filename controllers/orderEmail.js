import * as nodemailer from "nodemailer";
import config from "../config/config.js";
import model from "../models/index.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import qr from "qrcode";
import { v4 as uuidv4 } from "uuid";
import puppeteer from "puppeteer";
import loggers from "../config/logger.js";

async function OrderConfirmationMail(
  getCustomName,
  orderId,
  userId,
  email = ""
) {
  try {
    let orderMailContent = "";
    const whereClause = email
      ? {
          id: orderId,
          email,
          cancelledOrder: false,
        }
      : {
          id: orderId,
          // customerId: userId,
          cancelledOrder: false,
        };

  
    console.log(getCustomName, "gdfdf");
    let productPrimaryImage = getCustomName[0].productPrimaryImage || null;
    let productSecondaryImage = getCustomName[0].productSecondaryImage || null;
    const data = getCustomName.map((f) => {});

    console.log(productPrimaryImage, productSecondaryImage);

    orderMailContent = `
    <html>
          <head>
            <title>HTML Image Wrapper</title>
            <style>
          
            .order_details_head {
              font-family: "Oxygen";
              font-weight: 700;
              font-size: 24px;
            }
         
            .details_p {
              font-family: "Oxygen";
              font-weight: 400;
              font-size: 14px;
              opacity: 0.6;
            }
            .details_h {
              font-family: "Oxygen";
              font-weight: 400;
              font-size: 16px;
              padding-left: 15px;
            }
            .details_span {
              opacity: 0.6;
            }
         
            </style>
        
          </head>
          <body>
          <div>
          <p>Dear Customer,</p>
          <p>Thank you for placing an order with Bubbl.cards! Your order #${orderId} has been confirmed and is now being processed.</p>
          <p>We will keep you updated on the status of your order and notify you as soon as it's shipped. If you have any questions or concerns, please don't hesitate to contact us at ${7845861552}.</p>
          <p>Thank you for choosing Bubbl.cards, and we hope you enjoy your purchase!</p>
           ${getCustomName
             .map((val) => {
               const totalprice =
                 Number(val.quantity) * Number(val.productPrice);
               return `
            <table>
            <tr>
            <td class="qr">
              <img src=${val?.productPrimaryImage} alt="Card Img" width="100" height="100"/> 
                 <img src=${val?.productSecondaryImage} alt="Card Img" width="100" height="100"/> 
            </td>
            <td class="order_details">
              <h2 class="order_details_head">BUBBL <br/> ${val.productName}</h2>
              <p class="details_p">QTY: ${val.quantity} | Rs.${val.productPrice}</p>
              <p class="details_p">Total: ${totalprice} </p>
            </td>
          </tr>
          </table>
  `;
             })
             .join("")}
          <p>Best regards,</p>
          <p>The Bubbl.cards team.</p>
          <p>Customer Care Number:${7845861552}</p>
          </div>
      
         
            
          </body>
          </html>`;
    //   });

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: config.sesSmtpHost,
      port: config.sesSmtpPort,
      secure: false,
      auth: {
        user: config.sesSmtpUsername,
        pass: config.sesSmtpPassword,
      },
    });

    const getUserMailId = await model.Shipping.findOne({
      where: {
        orderId: orderId,
      },
    });
    const mailOptions = {
      from: config.smtpFromEmail,
      to: getUserMailId.emailId,
      // to: "testemailatm@gmail.com",
      subject: `Bubbl order Confirmation, Order no: #${orderId}`,
      html: orderMailContent,
    };

    await transporter.sendMail(mailOptions);

  } catch (err) {
    loggers.error(err + "from orderEmail.js");
    
  }
}

export default OrderConfirmationMail;
