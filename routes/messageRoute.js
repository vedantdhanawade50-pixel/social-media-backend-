const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getMessageById,
  getUserMessages,
  updateMessage,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes in this router module
router.use(protect);

// Route: GET all messages sent/received by user and POST send a message
router
  .route('/')
  .get(getUserMessages)
  .post(sendMessage);

// Route: GET conversation with target user ID
router
  .route('/conversation/:userId')
  .get(getConversation);

// Route: GET message details, PUT edit message, and DELETE message
router
  .route('/:id')
  .get(getMessageById)
  .put(updateMessage)
  .delete(deleteMessage);

module.exports = router;