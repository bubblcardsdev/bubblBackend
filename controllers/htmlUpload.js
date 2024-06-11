import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import config from "./../config/config.js";
import * as path from "path";

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

const upload = multer({ storage: s3Storage });

export { upload };
