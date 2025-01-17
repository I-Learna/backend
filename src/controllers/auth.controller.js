const User = require('../model/user.model');
const generateToken = require('../utils/generateToken');

// registration
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
};

// login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
};

// assign Role
const assignRole = async (req, res) => {
    const { userId, role } = req.body;

    if (!['User', 'Admin', 'OperationTeam', 'PaymentTeam'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();

        res.status(200).json({ message: `Role updated to ${role} for user ${user.name}` });
    } catch (error) {
        console.log(error.message);
        
        res.status(500).json({ message: 'Role assignment failed', error });
    }
};


module.exports = { registerUser, loginUser, assignRole };
