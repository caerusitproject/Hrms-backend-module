

const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "../..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});


const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024*1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) return cb(null, true);
    cb(new Error("Only .png, .jpg, and .jpeg formats are allowed!"));
  }
});


const uploadProfileImage = (req, res, next) => {
  const singleUpload = upload.single("profile");

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error:400, message: "File too large! Maximum allowed size is 50KB." });
      }
      return res.status(400).json({ error:400, message: err.message });
    } else if (err) {
      
      return res.status(400).json({ error:400, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error:400,message: "Please upload an image ." });
    }

    
    if (req.file.size < 10 * 1024) {
      return res.status(400).json({ error:400, message: "File too small! Minimum allowed size is 10KB." });
    }

    next(); 
  });
};

module.exports = uploadProfileImage;

