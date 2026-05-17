const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

router.post("/:userId", auth, messageController.sendMessage);
router.get("/:userId", auth, messageController.getMessages);

module.exports = router;
