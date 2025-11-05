
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const allowedFileTypes = /jpeg|jpg|png|pdf/;
const allowedFileList = [".jpeg", ".jpg", ".png", ".pdf"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 *1024 }, 
  fileFilter: (req, file, cb) => {
    const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedFileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Please upload a valid file type. Allowed types are: ${allowedFileList.join(", ")}.`
        )
      );
    }
  },
}).single("file"); 

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error:400,
          message: "File too large! Maximum allowed size is 5MB.",
        });
      }

      return res.status(400).json({
        error:400,
        message: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(400).json({
        error:400,
        message: err.message || "File upload failed. Please try again.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error:400,
        message: "Please upload a file.",
      });
    }

    next();
  });
};

module.exports = uploadMiddleware;
