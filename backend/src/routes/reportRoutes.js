const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { handleReport } = require("../controllers/reportController");

router.post("/evidence", upload.array("evidence",5), handleReport);

module.exports = router;