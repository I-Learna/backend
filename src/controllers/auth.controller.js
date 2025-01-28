const User = require('../model/user.model');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');



// Refresh Token
const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(user._id);
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Could not refresh access token', error });
    }
};

// Registration
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // storing refresh token in the db
        user.setRefreshToken(refreshToken);

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });        res.status(201).json({ _id: user._id, name: user.name, email: user.email });
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
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Store refresh token in the database
            user.setRefreshToken(refreshToken);

            res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: accessToken,
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
    
    const { id, name, email, accessToken, refreshToken } = req.user;
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

        await user.setRefreshToken(refreshToken);

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });        
        res.redirect('/api/industry');
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ message: 'Google authentication failed', error });
    }
};

const linkedInAuth = async (req, res) => {
    console.log(req.user);

    const { id, name, email, accessToken, refreshToken } = req.user;
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

        await user.setRefreshToken(refreshToken);

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });        
        res.redirect('/api/industry');
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'LinkedIn authentication failed', error });
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

const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }, 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been successfully reset' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Logout
const logoutUser = (req, res) => {
    if (!req.cookies?.token) {
        return res.status(401).json({ message: 'Already logged out' });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { refreshToken, 
    registerUser, 
    loginUser, 
    googleAuth, 
    linkedInAuth, 
    assignRole,
    resetPassword, 
    logoutUser 
};
