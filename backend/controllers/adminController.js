const AIRequest = require('../models/AIRequest');
const User = require('../models/User');
const Note = require('../models/Note');

// @desc    Admin usage statistics using aggregation pipeline (requests per user per day)
// @route   GET /api/admin/usage-stats
// @access  Private (Admin only)
const getUsageStats = async (req, res, next) => {
  try {
    // 1. Aggregation Pipeline: Requests per user per day
    const requestsPerUserPerDay = await AIRequest.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            user: '$user'
          },
          requestCount: { $sum: 1 },
          successfulCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          avgDurationMs: { $avg: '$durationMs' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          userId: '$_id.user',
          userName: '$user.name',
          userEmail: '$user.email',
          requestCount: 1,
          successfulCount: 1,
          failedCount: 1,
          avgDurationMs: { $round: ['$avgDurationMs', 2] }
        }
      },
      { $sort: { date: -1, requestCount: -1 } },
      { $limit: 100 }
    ]);

    // 2. Aggregation Pipeline: Requests by type (summary vs practice_questions)
    const requestsByType = await AIRequest.aggregate([
      {
        $group: {
          _id: '$requestType',
          count: { $sum: 1 },
          avgDurationMs: { $avg: '$durationMs' }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          avgDurationMs: { $round: ['$avgDurationMs', 2] }
        }
      }
    ]);

    // 3. Aggregation Pipeline: Daily system-wide requests trend (last 14 days)
    const dailyTrend = await AIRequest.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
          success: 1,
          failed: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        requestsPerUserPerDay,
        requestsByType,
        dailyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin overall summary metrics
// @route   GET /api/admin/overview
// @access  Private (Admin only)
const getAdminOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalAdmins, totalNotes, totalAIRequests] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Note.countDocuments(),
      AIRequest.countDocuments()
    ]);

    const recentRequests = await AIRequest.find()
      .populate('user', 'name email role')
      .populate('note', 'title subject')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalStudents,
          totalAdmins,
          totalNotes,
          totalAIRequests
        },
        recentRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list for admin
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsageStats,
  getAdminOverview,
  getAllUsers
};
