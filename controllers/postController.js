const Post = require('../models/Post');
const Comment = require('../models/Comment');

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a caption',
        data: null
      });
    }

    const post = await Post.create({
      caption,
      user: req.user._id,
      likes: []
    });

    // Populate user's name for response
    const populatedPost = await Post.findById(post._id).populate('user', 'name');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating post',
      data: null
    });
  }
};

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Public
 */
const getAllPosts = async (req, res) => {
  try {
    // Populate user name and sort by latest first (createdAt: -1)
    const posts = await Post.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: posts
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving posts',
      data: null
    });
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: post
    });
  } catch (error) {
    console.error('Get single post error:', error);
    // Cast error handling for invalid ObjectIds
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving post',
      data: null
    });
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Check if currently authenticated user is post owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
        data: null
      });
    }

    // Delete post using findByIdAndDelete or deleteOne
    await Post.findByIdAndDelete(req.params.id);

    // Clean up associated comments
    await Comment.deleteMany({ post: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting post',
      data: null
    });
  }
};

/**
 * @desc    Like a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Prevent duplicate likes
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this post',
        data: null
      });
    }

    post.likes.push(req.user._id);
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: {
        likes: post.likes
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error liking post',
      data: null
    });
  }
};

/**
 * @desc    Unlike a post
 * @route   DELETE /api/posts/:id/like
 * @access  Private
 */
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Check if user has liked the post
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this post yet',
        data: null
      });
    }

    // Remove user ID from likes
    post.likes = post.likes.filter(
      (likeId) => likeId.toString() !== req.user._id.toString()
    );
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
      data: {
        likes: post.likes
      }
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error unliking post',
      data: null
    });
  }
};

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
const updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        data: null
      });
    }

    // Check if user is the post owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
        data: null
      });
    }

    if (caption !== undefined) {
      post.caption = caption;
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('user', 'name');

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: populatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating post',
      data: null
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  deletePost,
  likePost,
  unlikePost,
  updatePost
};

