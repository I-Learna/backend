const getDashboard = (req, res) => {
  const roleDashboards = {
    user: {
      dashboard: 'User Dashboard',
      analytics: 'Your booked courses, tracking, invoice history',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      analytics: 'Admin-specific analytics, role management',
    },
    operation_team: {
      dashboard: 'Operation Team Dashboard',
      analytics: 'Student and instructor data, live tracking',
    },
    payment_team: {
      dashboard: 'Payment Team Dashboard',
      analytics: 'Invoice and payment tracking',
    },
  };

  const role = req.user.role;
  res.json(roleDashboards[role] || { dashboard: 'Unknown role' });
};

module.exports = { getDashboard };
