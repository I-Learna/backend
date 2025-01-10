const RBAC = require('rbac'); // import the RBAC library

// Define permissions
// permissions is an object where the keys are the resource names and the values are arrays of actions that can be performed on that resource
const permissions = {
    dashboard: ['view', 'edit'], // the dashboard resource can be viewed or edited
    course: ['manage', 'track'], // the course resource can be managed or tracked
    invoice: ['manage', 'track'], // the invoice resource can be managed or tracked
    analysis: ['view'], // the analysis resource can be viewed
    mentoring: ['manage'], // the mentoring resource can be managed
};

// Define roles and their permissions
// roles is an object where the keys are the role names and the values are arrays of permissions that the role has
const roles = {
    user: ['dashboard:view', 'course:track', 'invoice:track'], // the user role can view the dashboard, track courses, and track invoices
    admin: [
        'dashboard:view',
        'dashboard:edit',
        'course:manage',
        'invoice:manage',
        'analysis:view',
    ], // the admin role can view the dashboard, edit the dashboard, manage courses, manage invoices, and view analysis
    operation_team: [
        'dashboard:view',
        'analysis:view',
        'course:manage',
        'mentoring:manage',
    ], // the operation team role can view the dashboard, view analysis, manage courses, and manage mentoring
    payment_team: ['invoice:manage', 'analysis:view'], // the payment team role can manage invoices and view analysis
};

// Define role hierarchy (if needed)
// hierarchy is an object where the keys are the role names and the values are arrays of roles that the role inherits from
const hierarchy = {
    admin: ['operation_team', 'payment_team'], // the admin role inherits from the operation team and payment team roles
    operation_team: ['user'], // the operation team role inherits from the user role
    payment_team: ['user'], // the payment team role inherits from the user role
};

// Initialize RBAC
// the initializeRBAC function creates a new RBAC instance with the roles, permissions, and hierarchy defined above
const initializeRBAC = async () => {
    const rbac = new RBAC({
        roles: Object.keys(roles), // the roles in the RBAC instance are the keys of the roles object
        permissions: permissions, // the permissions in the RBAC instance are the permissions object
        grants: roles, // the grants in the RBAC instance are the roles object
        hierarchy: hierarchy, // the hierarchy in the RBAC instance is the hierarchy object
    });

    return rbac;
};

module.exports = initializeRBAC; // export the initializeRBAC function

