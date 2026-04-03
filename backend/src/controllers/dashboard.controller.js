/**
 * GET /api/admin/dashboard
 * Returns dashboard data - only accessible by authenticated admin.
 * This is a placeholder that returns mock stats.
 * Connect to your actual data sources as needed.
 */
const getDashboardData = async (req, res) => {
  try {
    // Mock dashboard data — replace with real DB queries
    const dashboardData = {
      stats: {
        totalReports: 142,
        pendingReports: 23,
        resolvedReports: 104,
        criticalReports: 15,
      },
      recentReports: [
        {
          id: 'rep_001',
          type: 'phishing',
          riskScore: 'HIGH',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          description: 'Suspicious email claiming to be from bank...',
        },
        {
          id: 'rep_002',
          type: 'scam',
          riskScore: 'MEDIUM',
          status: 'RESOLVED',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          description: 'Fake job offer requiring upfront payment...',
        },
        {
          id: 'rep_003',
          type: 'identity_theft',
          riskScore: 'CRITICAL',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          description: 'Personal data found on dark web marketplace...',
        },
        {
          id: 'rep_004',
          type: 'fraud',
          riskScore: 'LOW',
          status: 'RESOLVED',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          description: 'Unauthorized charges on credit card statement...',
        },
        {
          id: 'rep_005',
          type: 'phishing',
          riskScore: 'HIGH',
          status: 'IN_REVIEW',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          description: 'SMS link redirecting to fake login page...',
        },
      ],
      chartData: {
        weeklyReports: [12, 19, 8, 15, 22, 14, 10],
        categories: {
          phishing: 45,
          scam: 32,
          identity_theft: 18,
          fraud: 28,
          other: 19,
        },
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

module.exports = { getDashboardData };
