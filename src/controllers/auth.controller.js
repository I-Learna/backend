const User = require('../model/user.model');
const sendEmail = require('../utils/email');
const emailTemplate = require('../utils/emailHtml');

const generateAuthCode = require('../utils/generateAuthCode');

const generateToken = require('../utils/generateToken');

const formatName = require('../utils/slugifyName');

// registration
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const formattedName = formatName(name);

        const user = await User.create({ name: formattedName, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
        await sendEmail({ email: req.body.email, template: emailTemplate(`${user._id}`) });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'Registration failed', error });
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
            { role: role },
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
};


module.exports = { registerUser, loginUser, assignRole };
