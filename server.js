const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetDatabase,
  getDatabaseStats
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- API ENDPOINTS ---

/**
 * @route   GET /api/health
 * @desc    API Health Check
 * @access  Public (No Authentication)
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SQLite User Data API',
    version: '1.0.0'
  });
});

/**
 * @route   GET /api/stats
 * @desc    Get aggregate user and system statistics
 * @access  Public (No Authentication)
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = getDatabaseStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database statistics',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/users
 * @desc    Fetch all users from SQLite database with optional filters
 * @query   search, role, department, status, limit, offset
 * @access  Public (No Authentication)
 */
app.get('/api/users', (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      role: req.query.role,
      department: req.query.department,
      status: req.query.status,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const users = getAllUsers(filters);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users from database',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Fetch single user by ID
 * @access  Public (No Authentication)
 */
app.get('/api/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid User ID parameter. Must be an integer.'
      });
    }

    const user = getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user record',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user in SQLite database
 * @access  Public (No Authentication)
 */
app.post('/api/users', (req, res) => {
  try {
    const { name, email, role, department, status, avatar, phone, bio } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Both "name" and "email" fields are required.'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Invalid email address format.'
      });
    }

    const newUser = createUser({ name, email, role, department, status, avatar, phone, bio });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: A user with this email address already exists.'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create user record',
      details: error.message
    });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update existing user by ID
 * @access  Public (No Authentication)
 */
app.put('/api/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid User ID parameter. Must be an integer.'
      });
    }

    const updatedUser = updateUser(id, req.body);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: Email address is already used by another user.'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update user record',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user from SQLite database
 * @access  Public (No Authentication)
 */
app.delete('/api/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid User ID parameter. Must be an integer.'
      });
    }

    const success = deleteUser(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${id} not found.`
      });
    }

    res.json({
      success: true,
      message: `User with ID ${id} has been deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user record',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/users/reset
 * @desc    Reset SQLite database to initial seed data
 * @access  Public (No Authentication)
 */
app.post('/api/users/reset', (req, res) => {
  try {
    const users = resetDatabase();
    res.json({
      success: true,
      message: 'Database reset to initial sample seed dataset',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset database',
      details: error.message
    });
  }
});

// Fallback for 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.originalUrl}' not found on this server.`
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
🚀 SQLite User API Server running successfully!
--------------------------------------------------
📍 Local Server URL: http://localhost:${PORT}
📍 API Users Endpoint: http://localhost:${PORT}/api/users
📍 Interactive Visual Explorer: http://localhost:${PORT}
--------------------------------------------------
  `);
});

module.exports = app;
