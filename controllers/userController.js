const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    // req.user is already set by authMiddleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving profile',
      data: null
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Update fields if they are sent in request body
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;

    const updatedUser = await user.save();

    // Prepare updated user response (excluding password)
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      followers: updatedUser.followers,
      following: updatedUser.following,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
      data: null
    });
  }
};

/**
 * @desc    Follow a user
 * @route   POST /api/users/:id/follow
 * @access  Private
 */
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Prevent following self
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
        data: null
      });
    }

    // Find both target and current user
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found',
        data: null
      });
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user',
        data: null
      });
    }

    // Add target to following array
    currentUser.following.push(targetUserId);
    await currentUser.save();

    // Add current user to target's followers array
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Successfully followed ${targetUser.name}`,
      data: {
        following: currentUser.following
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during follow operation',
      data: null
    });
  }
};

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:id/follow
 * @access  Private
 */
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Prevent unfollowing self
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unfollow yourself',
        data: null
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to unfollow not found',
        data: null
      });
    }

    // Check if actually following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user',
        data: null
      });
    }

    // Remove target from current user's following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove current user from target's followers list
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Successfully unfollowed ${targetUser.name}`,
      data: {
        following: currentUser.following
      }
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during unfollow operation',
      data: null
    });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving users',
      data: null
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving user',
      data: null
    });
  }
};

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUserById = async (req, res) => {
  try {
    // Check if the logged-in user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user profile',
        data: null
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Update allowed fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.password) {
      user.password = req.body.password; // Pre-save hook will hash it
    }

    const updatedUser = await user.save();
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      followers: updatedUser.followers,
      following: updatedUser.following,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating user',
      data: null
    });
  }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @access  Private
 */
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the logged-in user is deleting their own account
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user account',
        data: null
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Clean up all related resources
    // 1. Delete user's comments
    await Comment.deleteMany({ user: userId });

    // 2. Find and delete user's posts, and clean up their comments
    const userPosts = await Post.find({ user: userId });
    const postIds = userPosts.map(post => post._id);
    await Comment.deleteMany({ post: { $in: postIds } });
    await Post.deleteMany({ user: userId });

    // 3. Delete messages where user is sender or recipient
    await Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });

    // 4. Remove user from other users' followers and following lists
    await User.updateMany({}, { $pull: { followers: userId, following: userId } });

    // 5. Delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'User account and all associated data deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting user',
      data: null
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
};

