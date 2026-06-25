const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route: GET all users (protected)
router.route('/')
  .get(protect, getAllUsers);

// Route: GET and PUT for user profile (both protected)
router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Route: GET, PUT, and DELETE for specific user by ID (all protected)
router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUserById)
  .delete(protect, deleteUserById);

// Route: POST and DELETE for following a user (both protected)
router
  .route('/:id/follow')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

module.exports = router;

