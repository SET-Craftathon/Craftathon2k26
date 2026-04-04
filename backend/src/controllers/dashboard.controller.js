const Report = require('../models/reportModel');
const { updateReportStatusOnChain } = require("../services/blockchainService");

/**
 * GET /api/admin/dashboard
 * Returns dashboard data - only accessible by authenticated admin.
 */
const getDashboardData = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [pieData, weeklyData, totalReports, pendingReports, resolvedReports] = await Promise.all([
      // Group by contentType
      Report.aggregate([
        { $group: { _id: '$contentType', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } },
      ]),
      // Count reports per day for the last 7 days
      Report.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            value: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', value: 1, _id: 0 } },
      ]),
      // Counts for KPI cards
      Report.countDocuments(),
      Report.countDocuments({ status: "PENDING" }),
      Report.countDocuments({ status: "RESOLVED" }),
    ]);

    // Fill missing days for the last 7 days to ensure graph continuity
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = weeklyData.find((w) => w.date === dateStr);
      last7Days.push({
        name: dateStr,
        value: found ? found.value : 0,
      });
    }

    const dashboardData = {
      stats: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
      },
      chartData: {
        weeklyReports: last7Days,
        categories: pieData,
      },
    };

    return res.status(200).json({
      status: 'success',
      data: dashboardData,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data.',
    });
  }
};

/**
 * GET /api/admin/dashboard/reports
 * Returns all reports for the Threads view
 */
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      status: 'success',
      data: reports,
    });
  } catch (err) {
    console.error('Fetch reports error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reports.',
    });
  }
};

/**
 * PUT /api/admin/dashboard/reports/:id/status
 * Updates the status of a specific report
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const updatedReport = await Report.findOneAndUpdate(
      { reportId: id }, 
      { status }, 
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ status: 'error', message: 'Report not found' });
    }

      let txHash = null;
    try {
      txHash = await updateReportStatusOnChain(id, status);
    } catch (err) {
      console.error("Blockchain update error:", err.message);
    }

    return res.status(200).json({
      status: 'success',
      data: updatedReport,
      txHash,
    });
  } catch (err) {
    console.error('Update status error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update report status.',
    });
  }
};

module.exports = { getDashboardData, getAllReports, updateReportStatus };
