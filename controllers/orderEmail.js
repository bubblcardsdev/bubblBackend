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
          customerId: userId,
          cancelledOrder: false,
        };

    const order = await model.Order.findAll({
      where: whereClause,
      include: [
        {
          model: model.OrderBreakDown,
        },
      ],
    });

    console.log(order, "gdfdf");

    const filterOrder = order[0].Carts.filter((val) =>
      val.productType.includes("NC-")
    );

    // func for getting the images for corresponding orders
    let deviceImages = [];
    let deviceInventory = "";

    deviceImages = await Promise.all(
      order[0].Carts.map(async (cartVal) => {
        if (cartVal.productType.includes("NC-")) {
          const getImageId = await model.NameDeviceImageInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });
          if (getImageId) {
            const deviceInventory = await model.NameCustomImages.findOne({
              where: {
                NameCustomDeviceId: getImageId.id,
                cardView: false,
              },
            });

            const itemImg = await generateSignedUrl(deviceInventory.imageUrl);

            return itemImg;
          }
        } else {
          deviceInventory = await model.DeviceInventory.findOne({
            where: {
              deviceType: cartVal.productType,
              deviceColor: cartVal.productColor,
            },
          });

          const itemImg = await generateSignedUrl(deviceInventory.deviceImage);
          return itemImg;
        }
      })
    );

    if (filterOrder.length === 0) {
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
          ${order[0].Carts.map(
            (val, index) => `
            <table>
            <tr>
            <td class="qr">
              <img src=${deviceImages[index]} alt="Card Img" width="100" height="100"/>
            </td>
            <td class="order_details" style="padding-left: 20px">
              <h2 class="order_details_head">BUBBL <br/> ${val.productType}</h2>
              <p class="details_p">QTY: ${val.quantity} | Rs.${val.productPrice}</p>
            </td>
          </tr>
          </table>
        
  `
          ).join("")}
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
        // to: "shunmugapriya@rvmatrix.in",
        subject: `Bubbl order Confirmation, Order no: #${orderId}`,
        html: orderMailContent,
      };

      await transporter.sendMail(mailOptions);
    } else {
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
          ${order[0].Carts.map(
            (val, index) => `
            <table>
            <tr>
            <td class="qr">
              <img src=${deviceImages[index]} alt="Card Img" width="100" height="100"/>
            </td>
            <td class="order_details">
              <h2 class="order_details_head">BUBBL <br/> ${val.productType}</h2>
              <p class="details_p">QTY: ${val.quantity} | Rs.${val.productPrice}</p>
            </td>
          </tr>
          </table>
        
  `
          ).join("")}
          <p>Best regards,</p>
          <p>The Bubbl.cards team.</p>
          <p>Customer Care Number:${7845861552}</p>
          </div>
      
         
            
          </body>
          </html>`;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const rqColor = "#0000FF";

      const uuid = uuidv4(); // Generate a new UUID
      const data = `https://bubbl.cards/profile/${uuid}`; // Use the UUID in the QR code data

      await model.Device.create({
        deviceUid: uuid,
        deviceType: "Card",
      });

      const options = {
        errorCorrectionLevel: "H",
        type: "image/jpeg",
        quality: 0.92,
        margin: 1,
        color: {
          dark: rqColor, // Set the color for the dark modules (red)
          light: "#FFFFFF", // Set the color for the light modules (white)
        },
      };

      let combinedHTMLContent = `
    <html>
    <head>
    <style>
      @font-face {
        font-family: "amenti";
        src: url("http://localhost:8000/fonts/AmentiBold.woff2") format("woff2");
      }
      @font-face {
        font-family: "muller";
        src: url("http://localhost:8000/fonts/Muller-ExtraBold.woff2") format("woff2");
      }
      @font-face {
        font-family: "romeliosans";
        src: url("http://localhost:8000/fonts/Romeliosans-z8y7L.woff2") format("woff2");
      }
    </style>
    </head>
    <body>
  `;
      await qr.toDataURL(data, options);
      await Promise.all(
        getCustomName.map(async (card, index) => {
          let getCardTypeDevice = await model.NameDeviceImageInventory.findAll({
            where: {
              id: card.deviceInventorId,
            },
            include: [
              {
                model: model.NameCustomImages,
              },
            ],
          });

          let frontImg = "";
          let backImg = "";
          const fontColor = getCardTypeDevice[0].fontColor;

          await Promise.all(
            getCardTypeDevice[0].NameCustomImages.map(async (device) => {
              if (device.cardView) {
                frontImg = await generateSignedUrl(device.printImgUrl);
                // frontImg = encodeURI(frontImg);
              } else {
                backImg = await generateSignedUrl(device.printImgUrl);
              }
            })
          );

          combinedHTMLContent += `
  <!-- Back View -->

<div>  
  <img
    src=${frontImg}
    width="443px"
    height="279px"
    style="position: absolute"
  />
  <div>
    <p
      style="
        font-size: 22px;
        font-family:${card.fontStyle};
        padding-left: 20px;
        color:${fontColor};
        position: relative;
        top: 235px;
      "
    >
    ${card.customName}
    </p>
    </div>
  </div>

  <div style="height:250px; visibility: hidden">pp</div>

  <!-- Front View -->
      <div>
        <img
        src=${backImg}
        width="443px"
        height="279px"
    />
      </div>
      `;

          if (index < getCustomName.length - 1) {
            combinedHTMLContent += "<p style='page-break-before: always'></p>"; // Add page break between contents
          }
        })
      );

      combinedHTMLContent += `
    </body>
    </html>
  `;

      await page.setContent(combinedHTMLContent);
      try {
        await page.waitForSelector("body", { timeout: 60000 });
      } catch (error) {
        loggers.error(error + "Timeout waiting for selector '#content");
        await browser.close();
        return;
      }
      await page.waitForNetworkIdle();

      const pdfBuffer = await page.pdf({
        path: "result.pdf",
        margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
        printBackground: true,
        format: "A4",
      });

      await browser.close();

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
        to: [getUserMailId.emailId, config.smtpFromEmail],
        subject: `Bubbl order Confirmation, Order no: #${orderId}`,
        html: orderMailContent,
        attachments: [
          {
            filename: "Name Custom Preview.pdf",
            content: pdfBuffer,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    loggers.error(err + "from orderEmail.js");
  }
}

export default OrderConfirmationMail;
