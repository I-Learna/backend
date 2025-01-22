const User = require('../model/user.model');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// Registration
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });

        res.cookie('token', generateToken(user._id), { httpOnly: true, secure: true });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
};

// Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;    
    if (req.user?.email === email) return res.status(409).json({ message: 'Already logged in' });

    try {
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token,
            });
            console.log(res.cookie);
            
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
};

// Google Login Callback
const googleAuth = async (req, res) => {
    console.log(req.user);
    
    const { id, name, email } = req.user;
    console.log(id, name, email);
    
    try {
        let user = await User.findOne({ email: email });

        if (!user) {
            user = await User.create({
                name: name,
                email: email,
                password: id,
            });
        }

        res.cookie('token', generateToken(user._id), { httpOnly: true, secure: true });
        res.redirect('/api/industry');
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ message: 'Google authentication failed', error });
    }
};

// Assign Role
const assignRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const validRoles = ['User', 'Admin', 'OperationTeam', 'PaymentTeam'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        console.log(`Updating user: ${userId} to role: ${role}`);

        if (!userId || userId.length !== 24) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { role },
            { new: true, runValidators: false }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`User role updated: ${user.name} -> ${role}`);

        res.status(200).json({
            message: `Role updated to ${role} for user ${user.name}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ message: 'Role assignment failed', error });
    }
}

// Logout
const logoutUser = (req, res) => {
    console.log('before',req.cookies?.token);
    if (!req.cookies?.token) {
        return res.status(401).json({ message: 'Already logged out' });
    }

res.clearCookie('token');
console.log('after',req.cookies?.token);
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, googleAuth, assignRole, logoutUser };
