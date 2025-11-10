const express = require("express");
const router = express.Router();
const aiController = require("../../controllers/ai/aiAssistantController");

// POST /api/ai/chat
router.post("/chat", aiController.chatWithAI);

/*router.get("/history/:userId", async (req, res) => {
  try {
    const history = await AiConversation.findAll({
      where: { userId: req.params.userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/

module.exports = router;
