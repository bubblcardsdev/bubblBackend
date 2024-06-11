import puppeteer from "puppeteer";
import model from "../models/index.js";
import { generateSignedUrl } from "../middleware/fileUpload.js";
import qr from "qrcode";
import { v4 as uuidv4 } from "uuid";
import loggers from "../config/logger.js";

async function htmlImageConversion(name, userId, OrderId) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let getSignedImage = "";
    let qrCodeDataURI = "";
    let dynamicColor = "";

    const checkCardImageId = await model.CustomCards.findOne({
      where: {
        orderId: OrderId,
        productStatus: 20,
      },
    });
    if (checkCardImageId) {
      const getCardImage = await model.Profile.findOne({
        where: {
          id: 1,
        },
      });

      getSignedImage = await generateSignedUrl(getCardImage.profileImage);
      const rqColor = "#0000FF";

      const uuid = uuidv4(); // Generate a new UUID
      const data = `https://www.example.com/${uuid}`; // Use the UUID in the QR code data
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
      qrCodeDataURI = await qr.toDataURL(data, options);
    }
    let combinedHTMLContent = "";

    const checkOrderId = await model.CustomCards.findAll({
      include: [
        {
          model: model.DeviceInventory,
        },
      ],
    });

    checkOrderId.forEach(async (card, index) => {
      combinedHTMLContent += `
    <html>
    <head>
    </head>
    <body>
      <div>
      <p>pdf image</p>
      <img src=${getSignedImage} alt="image" width="100" height="100">
      <p>qr</p>
      <img src=${qrCodeDataURI} alt="qrCode">
      <p>Name</p>
      <p style="color: ${dynamicColor}">${card.customName}</p>
      </div>
    </body>
    </html> `;
      if (index < checkOrderId.length - 1) {
        combinedHTMLContent += "<p style='page-break-before: always'></p>"; // Add page break between contents
      }
    });

    // Generate multiple PDF files

    await page.setContent(combinedHTMLContent);

    const pdfBuffer = await page.pdf({
      path: "result.pdf",
      margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
      printBackground: true,
      format: "A4",
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error sending email:", error);
    loggers.error(error+"from htmlImageConversion function");
  }
}

export default htmlImageConversion;
