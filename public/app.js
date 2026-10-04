document.addEventListener('DOMContentLoaded', () => {
  // State Management
  let allUsers = [];
  let currentEndpoint = 'get-all';
  const API_BASE = window.location.origin;

  // DOM Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const usersTableBody = document.getElementById('users-table-body');
  const emptyState = document.getElementById('empty-state');
  
  // Stats Elements
  const statTotalUsers = document.getElementById('stat-total-users');
  const statActiveUsers = document.getElementById('stat-active-users');
  const statDepts = document.getElementById('stat-depts');

  // Filter Elements
  const searchInput = document.getElementById('search-input');
  const roleFilter = document.getElementById('role-filter');
  const deptFilter = document.getElementById('dept-filter');
  const statusFilter = document.getElementById('status-filter');
  const resetDbBtn = document.getElementById('reset-db-btn');

  // Modal Elements
  const userModal = document.getElementById('user-modal');
  const userForm = document.getElementById('user-form');
  const modalTitle = document.getElementById('modal-title');
  const userIdInput = document.getElementById('user-id');
  const addUserBtn = document.getElementById('add-user-btn');
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn');

  // Explorer Elements
  const endpointItems = document.querySelectorAll('.endpoint-item');
  const consoleMethod = document.getElementById('console-method');
  const consoleUrl = document.getElementById('console-url');
  const sendRequestBtn = document.getElementById('send-request-btn');
  const requestBodySection = document.getElementById('request-body-container');
  const requestJsonBody = document.getElementById('request-json-body');
  const curlText = document.getElementById('curl-text');
  const copyCurlBtn = document.getElementById('copy-curl-btn');
  const responseStatus = document.getElementById('response-status');
  const responseTime = document.getElementById('response-time');
  const jsonResponseDisplay = document.getElementById('json-response-display');

  // ----------------------------------------------------
  // Initial Initialization
  // ----------------------------------------------------
  fetchUsers();
  fetchStats();

  // Tab Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // ----------------------------------------------------
  // Dashboard & API Functions
  // ----------------------------------------------------

  async function fetchUsers() {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      const result = await response.json();

      if (result.success) {
        allUsers = result.data;
        populateFilterDropdowns(allUsers);
        renderUsersTable(filterUsers(allUsers));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      const result = await response.json();

      if (result.success && result.data) {
        statTotalUsers.textContent = result.data.totalUsers;
        statActiveUsers.textContent = result.data.activeUsers;
        statDepts.textContent = result.data.departments ? result.data.departments.length : '-';
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  function populateFilterDropdowns(users) {
    const roles = [...new Set(users.map(u => u.role).filter(Boolean))];
    const depts = [...new Set(users.map(u => u.department).filter(Boolean))];

    // Maintain current selected values
    const currentRole = roleFilter.value;
    const currentDept = deptFilter.value;

    roleFilter.innerHTML = '<option value="">All Roles</option>' + 
      roles.map(r => `<option value="${r}">${r}</option>`).join('');
    
    deptFilter.innerHTML = '<option value="">All Departments</option>' + 
      depts.map(d => `<option value="${d}">${d}</option>`).join('');

    roleFilter.value = currentRole;
    deptFilter.value = currentDept;
  }

  function filterUsers(users) {
    const search = searchInput.value.toLowerCase().trim();
    const selectedRole = roleFilter.value;
    const selectedDept = deptFilter.value;
    const selectedStatus = statusFilter.value;

    return users.filter(user => {
      const matchesSearch = !search || 
        user.name.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search) || 
        (user.role && user.role.toLowerCase().includes(search));
      
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesDept = !selectedDept || user.department === selectedDept;
      const matchesStatus = !selectedStatus || user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }

  function renderUsersTable(users) {
    if (!users || users.length === 0) {
      usersTableBody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    usersTableBody.innerHTML = users.map(user => {
      const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
      const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
      
      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${avatarUrl}" alt="${user.name}" class="user-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user'">
              <div class="user-details">
                <div class="name">${escapeHtml(user.name)}</div>
                <div class="email">${escapeHtml(user.email)}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="role-tag">${escapeHtml(user.role || 'Member')}</span>
            <span class="dept-tag">${escapeHtml(user.department || 'General')}</span>
          </td>
          <td>
            <span style="font-size: 13px; color: var(--text-muted);">${escapeHtml(user.phone || 'No phone')}</span>
          </td>
          <td>
            <span class="status-badge ${user.status === 'Active' ? 'active' : 'inactive'}">
              <i class="fa-solid fa-circle" style="font-size: 8px;"></i>
              ${user.status}
            </span>
          </td>
          <td>
            <span style="font-size: 13px; color: var(--text-dim);">${createdDate}</span>
          </td>
          <td class="text-right">
            <div class="action-buttons">
              <button class="icon-btn edit-btn" data-id="${user.id}" title="Edit User">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="icon-btn delete delete-btn" data-id="${user.id}" title="Delete User">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Event Listeners to dynamic table action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditUserModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteUserRecord(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Search & Filter Events
  searchInput.addEventListener('input', () => renderUsersTable(filterUsers(allUsers)));
  roleFilter.addEventListener('change', () => renderUsersTable(filterUsers(allUsers)));
  deptFilter.addEventListener('change', () => renderUsersTable(filterUsers(allUsers)));
  statusFilter.addEventListener('change', () => renderUsersTable(filterUsers(allUsers)));

  // Reset Database Event
  resetDbBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset the SQLite database to initial seed data?')) {
      try {
        const response = await fetch(`${API_BASE}/api/users/reset`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
          alert('Database reset successfully!');
          fetchUsers();
          fetchStats();
        }
      } catch (err) {
        alert('Failed to reset database: ' + err.message);
      }
    }
  });

  // ----------------------------------------------------
  // Modal Actions
  // ----------------------------------------------------
  addUserBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    userIdInput.value = '';
    userModal.classList.remove('hidden');
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => userModal.classList.add('hidden'));
  });

  function openEditUserModal(id) {
    const user = allUsers.find(u => u.id == id);
    if (!user) return;

    modalTitle.textContent = 'Edit User Record';
    userIdInput.value = user.id;
    document.getElementById('form-name').value = user.name || '';
    document.getElementById('form-email').value = user.email || '';
    document.getElementById('form-role').value = user.role || '';
    document.getElementById('form-department').value = user.department || '';
    document.getElementById('form-status').value = user.status || 'Active';
    document.getElementById('form-phone').value = user.phone || '';
    document.getElementById('form-bio').value = user.bio || '';

    userModal.classList.remove('hidden');
  }

  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = userIdInput.value;
    const userData = {
      name: document.getElementById('form-name').value.trim(),
      email: document.getElementById('form-email').value.trim(),
      role: document.getElementById('form-role').value.trim(),
      department: document.getElementById('form-department').value.trim(),
      status: document.getElementById('form-status').value,
      phone: document.getElementById('form-phone').value.trim(),
      bio: document.getElementById('form-bio').value.trim()
    };

    try {
      const url = id ? `${API_BASE}/api/users/${id}` : `${API_BASE}/api/users`;
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        userModal.classList.add('hidden');
        fetchUsers();
        fetchStats();
      } else {
        alert('Error: ' + (result.error || 'Failed to save user'));
      }
    } catch (err) {
      alert('Network/Server Error: ' + err.message);
    }
  });

  async function deleteUserRecord(id) {
    if (confirm(`Are you sure you want to delete user ID ${id} from SQLite?`)) {
      try {
        const response = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok && result.success) {
          fetchUsers();
          fetchStats();
        } else {
          alert('Error: ' + (result.error || 'Failed to delete user'));
        }
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  }

  // ----------------------------------------------------
  // Interactive API Explorer Logic
  // ----------------------------------------------------
  const endpointsConfig = {
    'get-all': {
      method: 'GET',
      path: '/api/users',
      hasBody: false,
      curl: `curl -X GET ${API_BASE}/api/users`
    },
    'get-single': {
      method: 'GET',
      path: '/api/users/1',
      hasBody: false,
      curl: `curl -X GET ${API_BASE}/api/users/1`
    },
    'post-create': {
      method: 'POST',
      path: '/api/users',
      hasBody: true,
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane.doe@example.com",
        role: "Software Engineer",
        department: "Engineering",
        status: "Active",
        phone: "+1 (555) 888-9999",
        bio: "Full-stack cloud developer"
      }, null, 2),
      curl: `curl -X POST ${API_BASE}/api/users \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Jane Doe","email":"jane.doe@example.com","role":"Software Engineer","department":"Engineering"}'`
    },
    'put-update': {
      method: 'PUT',
      path: '/api/users/1',
      hasBody: true,
      body: JSON.stringify({
        role: "Principal Architect",
        status: "Active"
      }, null, 2),
      curl: `curl -X PUT ${API_BASE}/api/users/1 \\\n  -H "Content-Type: application/json" \\\n  -d '{"role":"Principal Architect"}'`
    },
    'delete-user': {
      method: 'DELETE',
      path: '/api/users/1',
      hasBody: false,
      curl: `curl -X DELETE ${API_BASE}/api/users/1`
    },
    'get-stats': {
      method: 'GET',
      path: '/api/stats',
      hasBody: false,
      curl: `curl -X GET ${API_BASE}/api/stats`
    },
    'get-health': {
      method: 'GET',
      path: '/api/health',
      hasBody: false,
      curl: `curl -X GET ${API_BASE}/api/health`
    }
  };

  endpointItems.forEach(item => {
    item.addEventListener('click', () => {
      endpointItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      currentEndpoint = item.dataset.endpoint;
      const config = endpointsConfig[currentEndpoint];

      consoleMethod.textContent = config.method;
      consoleMethod.className = `method ${config.method.toLowerCase()}`;
      consoleUrl.value = config.path;
      curlText.textContent = config.curl;

      if (config.hasBody) {
        requestBodySection.classList.remove('hidden');
        requestJsonBody.value = config.body;
      } else {
        requestBodySection.classList.add('hidden');
      }
    });
  });

  sendRequestBtn.addEventListener('click', async () => {
    const method = consoleMethod.textContent;
    const url = API_BASE + consoleUrl.value;
    const config = endpointsConfig[currentEndpoint];

    const options = { method, headers: {} };

    if (config.hasBody) {
      options.headers['Content-Type'] = 'application/json';
      options.body = requestJsonBody.value;
    }

    responseStatus.className = 'status-badge badge-pending';
    responseStatus.textContent = 'Sending...';
    jsonResponseDisplay.textContent = '// Fetching response from server...';

    const startTime = performance.now();

    try {
      const res = await fetch(url, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      responseTime.textContent = `${duration} ms`;
      responseStatus.textContent = `${res.status} ${res.statusText}`;
      responseStatus.className = `status-badge badge-${res.status}`;

      const data = await res.json();
      jsonResponseDisplay.textContent = JSON.stringify(data, null, 2);

      // Refresh list if DB was modified
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      responseStatus.textContent = 'Error';
      responseStatus.className = 'status-badge badge-500';
      jsonResponseDisplay.textContent = `// Error executing request:\n${err.message}`;
    }
  });

  copyCurlBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(curlText.textContent);
    copyCurlBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
    setTimeout(() => {
      copyCurlBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
    }, 2000);
  });
});
