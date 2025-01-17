const AccessControl = require('accesscontrol');

const ac = new AccessControl();

// Define roles and their permissions
ac.grant('User')
    .readOwn('dashboard')
    .readOwn('course')
    .readOwn('invoice');

ac.grant('OperationTeam')
    .extend('User') // Inherits 'User' permissions
    .readAny('dashboard')
    .readAny('analysis')
    .updateAny('course')
    .updateAny('mentoring');

ac.grant('PaymentTeam')
    .extend('User') // Inherits 'User' permissions
    .readAny('analysis')
    .updateAny('invoice');

ac.grant('Admin')
    .extend('OperationTeam') // Admin inherits Operation Team
    .extend('PaymentTeam') // Admin inherits Payment Team
    .updateAny('dashboard')
    .updateAny('course')
    .updateAny('invoice')
    .readAny('analysis')
    .updateAny('role'); // Admin can assign roles


module.exports = ac; // Export AccessControl instance
