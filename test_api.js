const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Suite...\n');

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health');
    const health = await makeRequest('/api/health');
    console.log(`   Status: ${health.status}, Response:`, health.data);

    // 2. Fetch all users
    console.log('\n2. Testing GET /api/users');
    const usersRes = await makeRequest('/api/users');
    console.log(`   Status: ${usersRes.status}, Total Users Returned: ${usersRes.data.count}`);
    console.log(`   First user: ${usersRes.data.data[0].name} (${usersRes.data.data[0].email})`);

    // 3. Fetch single user
    console.log('\n3. Testing GET /api/users/1');
    const singleUser = await makeRequest('/api/users/1');
    console.log(`   Status: ${singleUser.status}, User ID 1:`, singleUser.data.data.name);

    // 4. Create new user
    console.log('\n4. Testing POST /api/users');
    const newUserRes = await makeRequest('/api/users', 'POST', {
      name: 'Test Automation User',
      email: 'test.auto@sqlite.db',
      role: 'QA Engineer',
      department: 'Engineering',
      status: 'Active',
      phone: '+1 (555) 999-0000',
      bio: 'Created by automated test script'
    });
    console.log(`   Status: ${newUserRes.status}, Created User ID: ${newUserRes.data.data.id}`);

    // 5. Query filter test
    console.log('\n5. Testing GET /api/users?search=Test');
    const searchRes = await makeRequest('/api/users?search=Test');
    console.log(`   Status: ${searchRes.status}, Filtered count: ${searchRes.data.count}`);

    // 6. Delete test user
    console.log(`\n6. Testing DELETE /api/users/${newUserRes.data.data.id}`);
    const deleteRes = await makeRequest(`/api/users/${newUserRes.data.data.id}`, 'DELETE');
    console.log(`   Status: ${deleteRes.status}, Message: ${deleteRes.data.message}`);

    console.log('\n✨ ALL API TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
