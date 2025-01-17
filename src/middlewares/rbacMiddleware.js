const ac = require('../utils/rbacConfig');

const authorize = (action, resource) => (req, res, next) => {
    try {
        const userRole = req.user.role;
        console.log(`Role: ${userRole}, Action: ${action}, Resource: ${resource}`);
        
        const permission = ac.can(userRole)[action](resource);
        console.log(`Role: ${userRole}, Action: ${action}, Resource: ${resource}, Allowed: ${permission.granted}`);

        if (!permission.granted) {
            return res.status(403).json({ message: 'Forbidden: Access is denied' });
        }

        next(); // Proceed if access is granted
    } catch (error) {
        console.error('Authorization error:', error.message);
        res.status(500).json({ message: 'Authorization error', error: error.message });
    }
};

module.exports = { authorize };
