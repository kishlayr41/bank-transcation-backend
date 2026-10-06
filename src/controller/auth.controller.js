const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.services");
console.log("EMAIL SERVICE:", emailService);

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(422).json({
                message: "User already exists with email"
            });
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true
        });

       
        console.log("EMAIL BEING SENT TO:", user.email);

        emailService
            .sendRegistrationEmail(user.email, user.name)
            .catch((err) => console.error("Email error:", err.message));

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



const userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Email or password is invalid"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is invalid"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    registerUser,
    userLoginController
};
