const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Route: GET all comments for a post (public) and POST add a comment to a post (protected)
router
  .route('/:postId')
  .get(getComments)
  .post(protect, addComment);

// Route: GET a specific comment by ID (public)
router
  .route('/comment/:id')
  .get(getCommentById);

// Route: PUT update comment (protected) and DELETE comment (protected)
router
  .route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;