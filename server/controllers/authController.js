const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('GetMe error:', error.message);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password } = req.body;

    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error.message);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

// ============ NEW: Forgot Password Functions ============

// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email });

    if (user) {
      const tempPassword = crypto.randomBytes(12).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      user.password = hashedPassword;
      user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const emailSent = await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        tempPassword,
      });

      if (!emailSent) {
        console.error(`Password reset email failed for user: ${user.email}`);
        return res.status(500).json({
          message: 'Unable to send the reset email. Please try again or contact support.',
        });
      }
    }

    return res.status(200).json({
      message: 'If an account exists for this email, reset instructions have been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error.message || error);
    return res.status(500).json({
      message: 'Unable to send the reset email. Please try again or contact support.',
    });
  }
};

// @route   POST /api/auth/verify-temp-password
// @access  Public
const verifyTempPassword = async (req, res) => {
  try {
    const { email, tempPassword } = req.body;

    if (!email || !tempPassword) {
      return res.status(400).json({ 
        message: 'Please provide email and temporary password' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if temp password is still valid
    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ 
        message: 'Temporary password has expired. Please request a new one.' 
      });
    }

    // Verify the temp password
    const isMatch = await bcrypt.compare(tempPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid temporary password' 
      });
    }

    return res.status(200).json({
      message: 'Temporary password verified. You can now set a new password.',
      verified: true,
    });
  } catch (error) {
    console.error('Verify temp password error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, tempPassword, newPassword } = req.body;

    if (!email || !tempPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Please provide email, temporary password, and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if temp password is still valid
    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ 
        message: 'Temporary password has expired. Please request a new one.' 
      });
    }

    // Verify the temp password
    const isMatch = await bcrypt.compare(tempPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid temporary password' 
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetExpires = null; // Clear the expiration
    await user.save();

    return res.status(200).json({
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  forgotPassword,
  verifyTempPassword,
  resetPassword,
};