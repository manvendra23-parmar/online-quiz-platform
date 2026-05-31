const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretquizjwtkey';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
async function register(req, res) {
  const { username, email, password, avatar } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username, email, and password' });
  }
  
  try {
    // Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userAvatar = avatar || 'avatar_1';
    
    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, 'user', userAvatar]
    );
    
    const userId = result.insertId;
    
    // Create token
    const token = jwt.sign(
      { id: userId, username, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        role: 'user',
        avatar: userAvatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
async function login(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }
  
  try {
    // Fetch user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
}

// @desc    Get current user profile details
// @route   GET /api/auth/me
// @access  Private
async function getMe(req, res) {
  try {
    const [users] = await db.query('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
async function updateProfile(req, res) {
  const { username, avatar, password } = req.body;
  const userId = req.user.id;
  
  try {
    // Basic verification
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    let queryParts = [];
    let queryParams = [];
    
    if (username && username !== user.username) {
      // Check username availability
      const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      queryParts.push('username = ?');
      queryParams.push(username);
    }
    
    if (avatar) {
      queryParts.push('avatar = ?');
      queryParams.push(avatar);
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      queryParts.push('password_hash = ?');
      queryParams.push(passwordHash);
    }
    
    if (queryParts.length === 0) {
      return res.json({ success: true, message: 'No profile updates requested', user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
    }
    
    queryParams.push(userId);
    const sql = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
    await db.query(sql, queryParams);
    
    // Fetch updated user
    const [updatedUsers] = await db.query('SELECT id, username, email, role, avatar FROM users WHERE id = ?', [userId]);
    
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
