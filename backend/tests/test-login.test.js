// Test script for Login API
// Run with: node test-login.js

const testCases = [
  {
    id: 'TC-LOGIN-001',
    name: 'Successful login with valid credentials',
    method: 'POST',
    endpoint: '/login',
    body: {
      email: 'user@example.com',
      password: 'password123'
    },
    expectedStatus: 200,
    expectedFields: ['success', 'accessToken', 'refreshToken', 'user']
  },
  {
    id: 'TC-LOGIN-002',
    name: 'Login fails with missing email',
    method: 'POST',
    endpoint: '/login',
    body: {
      password: 'password123'
    },
    expectedStatus: 400,
    expectedMessage: 'Vui lòng cung cấp email và mật khẩu'
  },
  {
    id: 'TC-LOGIN-003',
    name: 'Login fails with missing password',
    method: 'POST',
    endpoint: '/login',
    body: {
      email: 'user@example.com'
    },
    expectedStatus: 400,
    expectedMessage: 'Vui lòng cung cấp email và mật khẩu'
  },
  {
    id: 'TC-LOGIN-004',
    name: 'Login fails with non-existent email',
    method: 'POST',
    endpoint: '/login',
    body: {
      email: 'nonexistent@example.com',
      password: 'password123'
    },
    expectedStatus: 401,
    expectedMessage: 'Email hoặc mật khẩu không đúng'
  },
  {
    id: 'TC-LOGIN-005',
    name: 'Login fails with wrong password',
    method: 'POST',
    endpoint: '/login',
    body: {
      email: 'user@example.com',
      password: 'wrongPassword'
    },
    expectedStatus: 401,
    expectedMessage: 'Email hoặc mật khẩu không đúng'
  }
];

async function runTests() {
  const baseURL = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  console.log('Starting Login API Tests...\n');
  console.log('=' .repeat(80));

  for (const testCase of testCases) {
    try {
      console.log(`\nTest: ${testCase.id} - ${testCase.name}`);
      console.log(`   Endpoint: ${testCase.method} ${testCase.endpoint}`);
      console.log(`   Request Body:`, JSON.stringify(testCase.body, null, 2));

      const response = await fetch(`${baseURL}${testCase.endpoint}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.body),
      });

      const data = await response.json();
      
      console.log(`   Response Status: ${response.status}`);
      console.log(`   Response Body:`, JSON.stringify(data, null, 2));

      // Check status code
      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ Status code matches: ${response.status}`);
      } else {
        console.log(`   ❌ Status code mismatch: Expected ${testCase.expectedStatus}, Got ${response.status}`);
        failed++;
        continue;
      }

      // Check expected fields for success cases
      if (testCase.expectedFields) {
        const missingFields = testCase.expectedFields.filter(field => !(field in data));
        if (missingFields.length === 0) {
          console.log(`   ✅ All expected fields present: ${testCase.expectedFields.join(', ')}`);
        } else {
          console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
          failed++;
          continue;
        }
      }

      // Check expected message for error cases
      if (testCase.expectedMessage) {
        if (data.message === testCase.expectedMessage) {
          console.log(`   ✅ Error message matches`);
        } else {
          console.log(`   ❌ Error message mismatch`);
          console.log(`      Expected: "${testCase.expectedMessage}"`);
          console.log(`      Got: "${data.message}"`);
          failed++;
          continue;
        }
      }

      console.log(`   ✅ TEST PASSED`);
      passed++;

    } catch (error) {
      console.log(`   ❌ TEST FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nTest Results:`);
  console.log(`   Total: ${passed + failed}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
}

// Run the tests
runTests().catch(console.error);
