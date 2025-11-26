import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";
import config from "./../config/config.js";
import * as path from "path";
import * as fs from "fs";
import { pdfImageUpload } from "../controllers/fileUpload.js";

const s3 = new S3Client({
  region: config.awsRegion,
});

const s3Storage = multerS3({
  s3: s3,
  bucket: config.awsS3BucketName,
  key: function (req, file, cb) {
    const fileName = path.parse(file.originalname).name;
    const extName = path.parse(file.originalname).ext;
    const keyName =
      config.awsS3BucketPath + fileName + "-" + Date.now().toString() + extName;
    cb(null, keyName);
  },
});
const csvUpload = multer({ storage: multer.memoryStorage() });


const upload = multer({ storage: s3Storage });

const generateSignedUrl = async function (Key) {
  const getCommand = new GetObjectCommand({
    Bucket: config.awsS3BucketName,
    Key: Key,
  });

  return getSignedUrl(s3, getCommand, { expiresIn: 604800 });
};

async function uploadFileToS3(res, userId, filePath,email="") {
  //create finale file name
  const fileName = path.parse(filePath).base;
  const keyFileName =
    config.awsS3BucketPath + fileName + "-" + Date.now().toString();

  const command = new PutObjectCommand({
    Bucket: config.awsS3BucketName,
    Key: fileName,
    Body: fs.createReadStream(filePath),
  });

  pdfImageUpload(res, keyFileName, userId,email);

  try {
     await s3.send(command);
  } catch (err) {
    console.error(err);
  }

  // const params = {
  // Bucket: config.awsS3BucketName,
  // Key: fileName,
  // Body: fs.createReadStream(filePath),
  // };

  // console.log(params, "params");

  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     console.error("Error uploading file:", err);
  //   } else {
  //     console.log("File uploaded successfully:", data.Location);
  //   }
  // });
}

export { upload, generateSignedUrl, uploadFileToS3,csvUpload };
