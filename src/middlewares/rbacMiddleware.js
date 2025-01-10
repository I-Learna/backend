const rbac = require('../utils/rbacConfig');

const authorize = (role, permission) => async (req, res, next) => {
    const userRole = req.user.role;

    try {
        const isAllowed = await rbac.can(userRole, `${role}:${permission}`);
        console.log(isAllowed, userRole, role, permission);
        
        if (!isAllowed) {
            return res.status(403).json({ message: 'Forbidden: Access is denied' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Authorization error', error });
    }
};

module.exports = { authorize };
