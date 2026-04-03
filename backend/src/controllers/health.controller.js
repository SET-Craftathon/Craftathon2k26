const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};
