const multer = require("multer");
const path = require("path");

// 📦 Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

// accept any file type 
const fileFilter = (req, file, cb) => {
  cb(null, true); // allow everything
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (adjust if needed)
  },
});

module.exports = upload;