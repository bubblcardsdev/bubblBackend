import * as nodemailer from "nodemailer";
import config from "../config/config.js";
import puppeteer from "puppeteer";
import model from "../models/index.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import qr from "qrcode";
import { v4 as uuidv4 } from "uuid";
import loggers from "../config/logger.js";

async function NameCustomEmail(getCustomName, OrderId) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const rqColor = "#0000FF";

    const uuid = uuidv4(); // Generate a new UUID
    const data = `https://bubbl.cards/profile/${uuid}`; // Use the UUID in the QR code data

    await model.Device.create({
      deviceUid: uuid,
      deviceType: "Card",
    });
    // await model.Device.create({
    //   deviceUid: uuid,
    //   deviceType: "Card",
    // });

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
      <section> 
      <div>
  <!-- Back View -->
  <div  style="
  margin-bottom:90px
  ">  
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
          font-family: ${card.fontStyle};
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
    </section>
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
        orderId: OrderId,
      },
    });
    const mailOptions = {
      from: config.smtpFromEmail,
      to: getUserMailId.emailId,
      // to: "shunmugapriya@rvmatrix.in",
      subject: "NameCustom Preview PDF",
      text: "Please find the attached PDF file.",
      attachments: [
        {
          filename: "Name Custom Preview.pdf",
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    loggers.error(err + "from nameCustomEmail.js");
  }
}

export default NameCustomEmail;
