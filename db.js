const Database = require('better-sqlite3');
const path = require('path');

// Path to SQLite database file
const dbPath = path.join(__dirname, 'userdata.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      avatar TEXT,
      phone TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(createTableQuery);

  // Check if table is empty, and seed initial data if needed
  const countStmt = db.prepare('SELECT COUNT(*) AS count FROM users');
  const { count } = countStmt.get();

  if (count === 0) {
    seedDatabase();
  }
}

// Sample initial data for users
const initialUsers = [
  {
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    role: 'Lead Architect',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '+1 (555) 019-2834',
    bio: 'Specializing in resilient cloud backend architecture and distributed systems.'
  },
  {
    name: 'Alex Mercer',
    email: 'alex.mercer@gentek.com',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 (555) 014-9921',
    bio: 'Passionate about design systems, web animation, and ultra-fast UI rendering.'
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@nexus.org',
    role: 'Product Manager',
    department: 'Product',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+1 (555) 017-4482',
    bio: 'Driving customer-first features and data-driven product strategies.'
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.vance@blackmesa.gov',
    role: 'DevOps Specialist',
    department: 'Infrastructure',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '+1 (555) 012-3390',
    bio: 'Kubernetes automation, CI/CD pipelines, and zero-downtime deployments.'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@innovate.tech',
    role: 'Data Scientist',
    department: 'Analytics',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    phone: '+1 (555) 018-7712',
    bio: 'Building predictive ML models and data visualizations for enterprise insights.'
  },
  {
    name: 'David Chen',
    email: 'david.chen@synergy.net',
    role: 'UX Designer',
    department: 'Design',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    phone: '+1 (555) 013-6623',
    bio: 'Crafting intuitive digital experiences with a focus on accessibility and clarity.'
  },
  {
    name: 'Jessica Taylor',
    email: 'jessica.taylor@apex.io',
    role: 'QA Automation Lead',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    phone: '+1 (555) 015-8834',
    bio: 'End-to-end testing frameworks enthusiast with a keen eye for detail.'
  },
  {
    name: 'Liam O\'Connor',
    email: 'liam.oconnor@quantum.dev',
    role: 'Security Engineer',
    department: 'Infrastructure',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    phone: '+1 (555) 011-5541',
    bio: 'Penetration testing, application security audits, and threat modeling.'
  }
];

// Seed sample data into users table
function seedDatabase() {
  const insertStmt = db.prepare(`
    INSERT INTO users (name, email, role, department, status, avatar, phone, bio)
    VALUES (@name, @email, @role, @department, @status, @avatar, @phone, @bio)
  `);

  const insertMany = db.transaction((users) => {
    for (const user of users) {
      insertStmt.run(user);
    }
  });

  insertMany(initialUsers);
  console.log('✅ SQLite Database successfully seeded with sample user data.');
}

// Database helper operations
function getAllUsers(filters = {}) {
  let query = 'SELECT * FROM users WHERE 1=1';
  const params = {};

  if (filters.search) {
    query += ' AND (name LIKE @search OR email LIKE @search OR role LIKE @search)';
    params.search = `%${filters.search}%`;
  }

  if (filters.role) {
    query += ' AND role = @role';
    params.role = filters.role;
  }

  if (filters.department) {
    query += ' AND department = @department';
    params.department = filters.department;
  }

  if (filters.status) {
    query += ' AND status = @status';
    params.status = filters.status;
  }

  query += ' ORDER BY id DESC';

  if (filters.limit) {
    query += ' LIMIT @limit';
    params.limit = parseInt(filters.limit, 10);

    if (filters.offset) {
      query += ' OFFSET @offset';
      params.offset = parseInt(filters.offset, 10);
    }
  }

  const stmt = db.prepare(query);
  return stmt.all(params);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

function createUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, role, department, status, avatar, phone, bio)
    VALUES (@name, @email, @role, @department, @status, @avatar, @phone, @bio)
  `);

  const info = stmt.run({
    name: userData.name,
    email: userData.email,
    role: userData.role || 'Member',
    department: userData.department || 'General',
    status: userData.status || 'Active',
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
    phone: userData.phone || '',
    bio: userData.bio || ''
  });

  return getUserById(info.lastInsertRowid);
}

function updateUser(id, userData) {
  const existing = getUserById(id);
  if (!existing) return null;

  const updated = {
    name: userData.name !== undefined ? userData.name : existing.name,
    email: userData.email !== undefined ? userData.email : existing.email,
    role: userData.role !== undefined ? userData.role : existing.role,
    department: userData.department !== undefined ? userData.department : existing.department,
    status: userData.status !== undefined ? userData.status : existing.status,
    avatar: userData.avatar !== undefined ? userData.avatar : existing.avatar,
    phone: userData.phone !== undefined ? userData.phone : existing.phone,
    bio: userData.bio !== undefined ? userData.bio : existing.bio,
    id: id
  };

  const stmt = db.prepare(`
    UPDATE users
    SET name = @name,
        email = @email,
        role = @role,
        department = @department,
        status = @status,
        avatar = @avatar,
        phone = @phone,
        bio = @bio
    WHERE id = @id
  `);

  stmt.run(updated);
  return getUserById(id);
}

function deleteUser(id) {
  const existing = getUserById(id);
  if (!existing) return false;

  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const stmtDelete = db.prepare('DELETE FROM users WHERE id = ?');
  stmtDelete.run(id);
  return true;
}

function resetDatabase() {
  db.exec('DROP TABLE IF EXISTS users');
  initDatabase();
  return getAllUsers();
}

function getDatabaseStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) AS total FROM users');
  const activeStmt = db.prepare("SELECT COUNT(*) AS active FROM users WHERE status = 'Active'");
  const inactiveStmt = db.prepare("SELECT COUNT(*) AS inactive FROM users WHERE status = 'Inactive'");
  const deptStmt = db.prepare('SELECT department, COUNT(*) as count FROM users GROUP BY department');

  return {
    totalUsers: totalStmt.get().total,
    activeUsers: activeStmt.get().active,
    inactiveUsers: inactiveStmt.get().inactive,
    departments: deptStmt.all()
  };
}

// Automatically initialize database on module load
initDatabase();

module.exports = {
  db,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetDatabase,
  getDatabaseStats
};
