const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// POST /api/conversations   body: { recipientId, listingId? }
// Finds an existing conversation between the two users (for that listing, if
// given) or creates a new one.
async function startConversation(req, res) {
  try {
    const { recipientId, listingId } = req.body;
    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }
    if (recipientId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You can't start a conversation with yourself" });
    }

    const filter = {
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    };
    if (listingId) filter.listing = listingId;
    else filter.listing = { $exists: false };

    let conversation = await Conversation.findOne(filter);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        listing: listingId || undefined,
      });
    }

    conversation = await conversation.populate([
      { path: "participants", select: "name avatar" },
      { path: "listing", select: "title images price currency" },
    ]);

    return res.status(201).json(conversation);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not start conversation", error: err.message });
  }
}

// GET /api/conversations   - the logged-in user's conversation list, newest first
async function getMyConversations(req, res) {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name avatar")
      .populate("listing", "title images price currency")
      .sort({ lastMessageAt: -1 });

    // unread count per conversation: messages not sent by me, that I haven't read
    const withUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });
        return { ...c.toObject(), unreadCount };
      }),
    );

    return res.json(withUnread);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not load conversations", error: err.message });
  }
}

// GET /api/conversations/:id/messages
async function getMessages(req, res) {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString(),
    );
    if (!isParticipant)
      return res.status(403).json({ message: "Not your conversation" });

    const messages = await Message.find({
      conversation: conversation._id,
    }).sort({ createdAt: 1 });

    // mark everything not sent by me as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } },
    );

    return res.json(messages);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not load messages", error: err.message });
  }
}

// POST /api/conversations/:id/messages   body: { text }
async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString(),
    );
    if (!isParticipant)
      return res.status(403).json({ message: "Not your conversation" });

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    conversation.lastMessage = message.text;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    return res.status(201).json(message);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not send message", error: err.message });
  }
}

module.exports = {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};
