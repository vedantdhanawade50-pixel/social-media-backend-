

const Message = require('../models/Message');
const User = require('../models/User');

/**
 * @desc    Send a direct message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipientId and message content',
        data: null
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found',
        data: null
      });
    }

    // Prevent sending message to self
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself',
        data: null
      });
    }

    // Create the message
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error sending message',
      data: null
    });
  }
};

/**
 * @desc    Get conversation between logged-in user and target user
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
const getConversation = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Conversation partner not found',
        data: null
      });
    }

    // Find messages where:
    // (sender = currentUser AND recipient = targetUser) OR (sender = targetUser AND recipient = currentUser)
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId }
      ]
    })
      .populate('sender', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: 1 }); // chronological order

    return res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving conversation',
      data: null
    });
  }
};

/**
 * @desc    Get single message by ID
 * @route   GET /api/messages/:id
 * @access  Private
 */
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
        data: null
      });
    }

    // Verify logged-in user is sender or recipient
    const isSender = message.sender._id.toString() === req.user._id.toString();
    const isRecipient = message.recipient._id.toString() === req.user._id.toString();

    if (!isSender && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this message',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: message
    });
  } catch (error) {
    console.error('Get message error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving message',
      data: null
    });
  }
};

/**
 * @desc    Get all messages sent or received by logged-in user
 * @route   GET /api/messages
 * @access  Private
 */
const getUserMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }]
    })
      .populate('sender', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    });
  } catch (error) {
    console.error('Get user messages error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving messages',
      data: null
    });
  }
};

/**
 * @desc    Update a message's content
 * @route   PUT /api/messages/:id
 * @access  Private
 */
const updateMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message content',
        data: null
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
        data: null
      });
    }

    // Only sender can update their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message',
        data: null
      });
    }

    message.content = content;
    const updatedMessage = await message.save();
    const populatedMessage = await Message.findById(updatedMessage._id)
      .populate('sender', 'name')
      .populate('recipient', 'name');

    return res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Update message error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating message',
      data: null
    });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
        data: null
      });
    }

    // Only sender or recipient can delete the message
    const isSender = message.sender.toString() === req.user._id.toString();
    const isRecipient = message.recipient.toString() === req.user._id.toString();

    if (!isSender && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
        data: null
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete message error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting message',
      data: null
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getMessageById,
  getUserMessages,
  updateMessage,
  deleteMessage
};