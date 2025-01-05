
const getUserDashboard = (req, res) => {
    res.json({
        dashboard: 'User Dashboard',
        analytics: 'Number of booked courses, course analysis, invoice tracking, live course tracking'
    });
};

const getInstructorDashboard = (req, res) => {
    res.json({
        dashboard: 'Instructor Dashboard',
        analytics: 'Number of courses, reviews, location analysis, invoice tracking'
    });
};

const getOperationDashboard = (req, res) => {
    res.json({
        dashboard: 'Operation Team Dashboard',
        analytics: 'Student data, instructor analysis, course tracking, mentoring live courses'
    });
};

const getPaymentDashboard = (req, res) => {
    res.json({
        dashboard: 'Payment Team Dashboard',
        analytics: 'Invoice tracking, instructor payments, refund tracking'
    });
};

module.exports = {
    getUserDashboard,
    getInstructorDashboard,
    getOperationDashboard,
    getPaymentDashboard
};
