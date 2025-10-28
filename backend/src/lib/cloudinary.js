import cloudinary from "cloudinary";
import dataurl from "dataurl"; 
const { format } = dataurl;      
import path from "path";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const dataUri = (req) => {
  const ext = path.extname(req.file.originalname).toString();
  
  return format({
    data: req.file.buffer,
    mimetype: req.file.mimetype,
  });
};

export const uploader = cloudinary.v2.uploader;
export { dataUri };