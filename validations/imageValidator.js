import path from "path";
import { fileTypeFromBuffer } from "file-type"

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedExtensions = [".jpeg", ".jpg", ".png", ".webp"];

function isValidFileName(name) {
  const pattern = /^[\w,\s-]+\.[A-Za-z]{3,4}$/;
  return pattern.test(name);
}
function isValidFileExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

async function ImageValidator(req,res,next){

    const file = req.file;
 // 1. File presence validation
  if (!file) {
    return res.status(400).json({ success: false, message: "File is required" });
  }

  // 2. File empty/corruption check
  if (file.size === 0) {
    return res.status(400).json({ success: false, message: "File is empty or corrupted" });
  }

  const fileSizeMB = file.size / 1024 /1024;

  if(fileSizeMB >= 5){
 return res.status(400).json({
      success: false,
      message: "File size must be less than 5MB",
    });
  }

   // 4. File name format validation
  if (!isValidFileName(file.originalname)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file name",
    });
  }

   
 const typeResult = await fileTypeFromBuffer(file.buffer);
const actualMimeType = typeResult?.mime;

if (!allowedMimeTypes.includes(actualMimeType)) {
  return res.status(400).json({
    success: false,
    message: "Invalid file type. Only PNG, WEBP, JPEG allowed",
  });
}

    if (!isValidFileExtension(file.originalname)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file extension",
    });
  }

   req.fileMeta = {
    filename: file.originalname,
    sizeMB: fileSizeMB,
    contentType: actualMimeType,
    buffer: file.buffer,
  };


next()

}


export {ImageValidator};