

const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "../../uploads");//needs to be fixed
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});


const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 1 MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|doc|docx|xls|xlsx/;

    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype.toLowerCase());

    if (extName && mimeType) return cb(null, true);

    cb(new Error("Only PDF, DOC, DOCX, XLS, XLSX formats are allowed!"));
  }
});



const uploadHandbook = (req, res, next) => {
  const singleUpload = upload.single("file"); // field name

  singleUpload(req, res, (err) => {

    // Multer specific errors
    if (err instanceof multer.MulterError) {

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: 400,
          message: "File too large! Maximum allowed size is 1MB."
        });
      }

      return res.status(400).json({
        error: 400,
        message: err.message
      });
    }

    // Other errors (mime type, extension, filter error)
    if (err) {
      return res.status(400).json({
        error: 400,
        message: err.message
      });
    }

    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 400,
        message: "Please upload a PDF/DOC/DOCX/XLS/XLSX file."
      });
    }

    // Minimum size check (optional)
    if (req.file.size < 10 * 1024) { 
      return res.status(400).json({
        error: 400,
        message: "File too small! Minimum allowed size is 10KB."
      });
    }

    next();
  });
};


module.exports = uploadHandbook;

