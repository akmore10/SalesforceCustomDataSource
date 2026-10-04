# SQLite User Data API & Interactive Explorer

A high-performance RESTful JSON API built with **Node.js**, **Express**, and **SQLite** (`better-sqlite3`). No authentication required.

It features automatic SQLite database table creation, pre-populated realistic sample seed data, full CRUD endpoint support, and a built-in visual Dashboard & Interactive API Explorer web interface.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will start at:
- **API Base URL**: `http://localhost:3000`
- **Users Endpoint**: `http://localhost:3000/api/users`
- **Web Dashboard & Explorer**: `http://localhost:3000`

### 3. Run Automated API Tests
```bash
npm test
```

---

## 🗄️ Database Auto-Initialization & Seeding

On initial launch, `db.js` performs all the heavy lifting automatically:
1. Creates the SQLite database file `userdata.db`.
2. Enables WAL (Write-Ahead Logging) mode for maximum performance.
3. Automatically creates the `users` table schema:
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `name` (TEXT NOT NULL)
   - `email` (TEXT NOT NULL UNIQUE)
   - `role` (TEXT NOT NULL)
   - `department` (TEXT NOT NULL)
   - `status` (TEXT NOT NULL DEFAULT 'Active')
   - `avatar` (TEXT)
   - `phone` (TEXT)
   - `bio` (TEXT)
   - `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
4. Checks if the table is empty and populates it with initial sample profiles if needed.

---

## 📡 REST API Endpoints (No Auth Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | Retrieve all users (Supports search, role, status, limit, offset filters) |
| `GET` | `/api/users/:id` | Retrieve single user by ID |
| `POST` | `/api/users` | Create a new user record |
| `PUT` | `/api/users/:id` | Update an existing user record |
| `DELETE` | `/api/users/:id` | Delete user record by ID |
| `GET` | `/api/stats` | Aggregate database statistics |
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/users/reset` | Reset SQLite table to original seed dataset |

---

## 💡 Example API Requests & Responses

### 1. Get All Users (`GET /api/users`)

**Request:**
```bash
curl -X GET http://localhost:3000/api/users
```

**JSON Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 1,
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne.io",
      "role": "Lead Architect",
      "department": "Engineering",
      "status": "Active",
      "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      "phone": "+1 (555) 019-2834",
      "bio": "Specializing in resilient cloud backend architecture and distributed systems.",
      "created_at": "2026-10-04 17:52:00"
    }
  ]
}
```

### 2. Search & Filter Users (`GET /api/users?search=Sarah&status=Active`)

```bash
curl -X GET "http://localhost:3000/api/users?search=Sarah&status=Active"
```

### 3. Create a User (`POST /api/users`)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "Software Engineer",
    "department": "Engineering",
    "status": "Active",
    "phone": "+1 (555) 888-9999",
    "bio": "Full-stack developer with React & Node experience"
  }'
```

### 4. Update a User (`PUT /api/users/:id`)

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Principal Systems Architect",
    "status": "Active"
  }'
```

### 5. Delete a User (`DELETE /api/users/:id`)

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

---

## 🖥️ Interactive Web UI Dashboard

Open `http://localhost:3000` in your web browser to access:
- **Database Dashboard**: Visual user list with search, role/department filters, stats cards, and Add/Edit modals.
- **Interactive API Explorer**: Live API request console to test endpoints with custom request bodies, copyable cURL commands, status badges, response time metrics, and syntax-highlighted JSON output.
