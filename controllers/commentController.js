const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * @desc    Add a comment to a post
 * @route   POST /api/comments/:postId
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please enter comment text',
        data: null
      });
    }

    // Check if target post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Create the comment
    const comment = await Comment.create({
      text,
      user: req.user._id,
      post: postId
    });

    // Populate user's name for response
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name');

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding comment',
      data: null
    });
  }
};

/**
 * @desc    Get all comments for a post
 * @route   GET /api/comments/:postId
 * @access  Public
 */
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if target post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Get all comments for the post and populate user's name
    const comments = await Comment.find({ post: postId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving comments',
      data: null
    });
  }
};

/**
 * @desc    Get single comment by ID
 * @route   GET /api/comments/comment/:id
 * @access  Public
 */
const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('user', 'name')
      .populate('post', 'caption');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Comment retrieved successfully',
      data: comment
    });
  } catch (error) {
    console.error('Get comment by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving comment',
      data: null
    });
  }
};

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please enter comment text',
        data: null
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        data: null
      });
    }

    // Only owner of the comment can update it
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
        data: null
      });
    }

    comment.text = text;
    const updatedComment = await comment.save();
    const populatedComment = await Comment.findById(updatedComment._id).populate('user', 'name');

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: populatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating comment',
      data: null
    });
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('post');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        data: null
      });
    }

    // Comment owner or post owner can delete the comment
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = comment.post.user.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
        data: null
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting comment',
      data: null
    });
  }
};

module.exports = {
  addComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment
};
