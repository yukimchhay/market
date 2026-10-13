const express = require("express");
const {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} = require("../controllers/conversationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", startConversation);
router.get("/", getMyConversations);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);

module.exports = router;
