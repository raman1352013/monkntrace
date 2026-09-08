const ReviewComment = require('../../models/ReviewComment');
const LcaProject = require('../../models/LcaProject');

// Post review comment on a project field
exports.createComment = async (req, res) => {
  try {
    const { projectId, section, fieldKey, comment } = req.body;

    // reviewerId comes from authenticated user via JWT middleware
    const reviewerId = req.user?.userId || req.user?.id || req.user?._id;

    if (!projectId || !comment) {
      return res.status(400).json({ success: false, message: 'projectId and comment are required' });
    }

    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: reviewer identity could not be determined' });
    }

    const reviewComment = await ReviewComment.create({
      projectId,
      reviewerId,
      section: section || 'GENERAL',
      fieldKey,
      comment,
      status: 'OPEN'
    });

    res.status(201).json({ success: true, data: reviewComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all comments for a project
exports.getCommentsByProjectId = async (req, res) => {
  try {
    const comments = await ReviewComment.find({ projectId: req.params.projectId })
      .populate('reviewerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project status (Request Corrections / Approve)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { projectId, action } = req.body; // action = 'REQUEST_CHANGES' or 'APPROVE'
    if (!projectId || !action) {
      return res.status(400).json({ success: false, message: 'projectId and action are required' });
    }

    let newStatus = 'UNDER_REVIEW';
    if (action === 'REQUEST_CHANGES') {
      newStatus = 'CORRECTIONS_REQUIRED';
    } else if (action === 'APPROVE') {
      newStatus = 'APPROVED';
    }

    const updateObj = { status: newStatus };
    if (newStatus === 'APPROVED') {
      updateObj.approvedAt = new Date();
    }

    const project = await LcaProject.findByIdAndUpdate(projectId, updateObj, { new: true })
      .populate('productId')
      .populate('vendorId');

    res.status(200).json({
      success: true,
      message: `Project status updated to ${newStatus}`,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
