const express = require('express');
const router = express.Router();
const {
  getUsageStats,
  getAdminOverview,
  getAllUsers
} = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Role-Based Access Control (RBAC): Admin only
router.use(verifyToken, requireRole('admin'));

router.get('/usage-stats', getUsageStats);
router.get('/overview', getAdminOverview);
router.get('/users', getAllUsers);

module.exports = router;
