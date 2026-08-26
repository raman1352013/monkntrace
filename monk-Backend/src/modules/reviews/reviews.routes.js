const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');

router.post('/comments', reviewsController.createComment);
router.get('/comments/:projectId', reviewsController.getCommentsByProjectId);
router.post('/status', reviewsController.updateReviewStatus);

module.exports = router;
