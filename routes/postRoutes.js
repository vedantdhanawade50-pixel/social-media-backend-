const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getSinglePost,
  deletePost,
  likePost,
  unlikePost,
  updatePost
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Route: GET all posts (public) and POST create post (protected)
router
  .route('/')
  .get(getAllPosts)
  .post(protect, createPost);

// Route: GET single post (public), PUT update post (protected), and DELETE post (protected)
router
  .route('/:id')
  .get(getSinglePost)
  .put(protect, updatePost)
  .delete(protect, deletePost);


// Route: POST like post (protected) and DELETE unlike post (protected)
router
  .route('/:id/like')
  .post(protect, likePost)
  .delete(protect, unlikePost);

module.exports = router;
