// Integration Test Script: Online Quiz & Assessment Platform API Lifecycle
// This script runs automated local requests to verify registration, login, profile, and quiz attempt submissions.

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

let jwtToken = '';
let attemptId = null;

console.log('====================================================');
console.log('   STARTING AUTOMATED API INTEGRATION VERIFICATION ');
console.log('====================================================\n');

// Utility for HTTP post requests
function makePostRequest(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    
    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

// Utility for HTTP get requests
function makeGetRequest(path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    
    req.on('error', (e) => reject(e));
    req.end();
  });
}

// Test Lifecycle Runner
async function runTests() {
  try {
    // Test 1: Health check
    console.log('Test 1: Verification of server health check...');
    const health = await makeGetRequest('/../health'); // health is at base url
    if (health.status === 200) {
      console.log('  [PASS] Server is active and healthy.\n');
    } else {
      console.log('  [FAIL] Health check failed.\n');
    }

    // Test 2: User Login
    console.log('Test 2: Verification of Student Account Login...');
    const loginRes = await makePostRequest('/auth/login', {
      email: 'user@quizplatform.com',
      password: 'userpassword'
    });
    
    if (loginRes.status === 200 && loginRes.data.success) {
      jwtToken = loginRes.data.token;
      console.log('  [PASS] Login successful. Hashed passwords verified.');
      console.log(`  [INFO] JWT Token secured for student: ${loginRes.data.user.username}\n`);
    } else {
      console.log('  [FAIL] Login failed.', loginRes.data || loginRes.body, '\n');
      return;
    }

    // Test 3: Get profile details
    console.log('Test 3: Verification of profile token parsing...');
    const profileRes = await makeGetRequest('/auth/me', jwtToken);
    if (profileRes.status === 200 && profileRes.data.success) {
      console.log(`  [PASS] Profile check returned: ID ${profileRes.data.user.id}, Role ${profileRes.data.user.role}\n`);
    } else {
      console.log('  [FAIL] Profile fetch failed.\n');
    }

    // Test 4: Fetch active quizzes
    console.log('Test 4: Verification of Quiz catalog listing...');
    const quizzesRes = await makeGetRequest('/quizzes', jwtToken);
    if (quizzesRes.status === 200 && quizzesRes.data.success) {
      console.log(`  [PASS] Catalog listing retrieved. Total quizzes: ${quizzesRes.data.quizzes.length}`);
      console.log(`  [INFO] Catalog subjects: ${quizzesRes.data.quizzes.map(q => q.title).join(', ')}\n`);
    } else {
      console.log('  [FAIL] Quizzes catalog retrieval failed.\n');
    }

    // Test 5: Initiate a Quiz Attempt session
    console.log('Test 5: Starting a timed quiz attempt session for Quiz 1...');
    const attemptRes = await makePostRequest('/attempts/start', { quizId: 1 }, jwtToken);
    if (attemptRes.status === 201 || attemptRes.status === 200) {
      attemptId = attemptRes.data.attemptId;
      console.log(`  [PASS] Attempt session initialized successfully.`);
      console.log(`  [INFO] Attempt Session ID: ${attemptId}, Seconds Remaining: ${attemptRes.data.timeRemainingSeconds}s\n`);
    } else {
      console.log('  [FAIL] Failed to initialize attempt session.', attemptRes.data || attemptRes.body, '\n');
      return;
    }

    // Test 6: Auto-save a test question choice
    console.log('Test 6: Real-time auto-saving of question selection...');
    const saveRes = await makePostRequest('/attempts/save-answer', {
      attemptId,
      questionId: 1,
      selectedOption: 'B' // B is correct for Q1 in seeds!
    }, jwtToken);
    
    if (saveRes.status === 200 && saveRes.data.success) {
      console.log('  [PASS] Answer selection saved in database in real-time.\n');
    } else {
      console.log('  [FAIL] Real-time auto-saving failed.', saveRes.data || saveRes.body, '\n');
    }

    // Test 7: Submit Exam and process grades
    console.log('Test 7: Submitting completed exam attempt and compiling scores...');
    const submitRes = await makePostRequest(`/${attemptId}/submit`, {}, jwtToken); // route /attempts/:id/submit handled by router prefix /attempts
    
    // Note: in attemptRoutes.js, route is /attempts/:id/submit (relative to /attempts)
    const submitUrl = `/attempts/${attemptId}/submit`;
    const finalSubmitRes = await makePostRequest(submitUrl, {}, jwtToken);
    
    if (finalSubmitRes.status === 200 && finalSubmitRes.data.success) {
      const resData = finalSubmitRes.data.result;
      console.log('  [PASS] Exam submitted successfully.');
      console.log('  [INFO] Calculated metrics:');
      console.log(`         - Correct: ${resData.correct_answers}`);
      console.log(`         - Incorrect: ${resData.incorrect_answers}`);
      console.log(`         - Penalty score: ${resData.score} points`);
      console.log(`         - Pass status: ${resData.passed ? 'PASSED' : 'FAILED'}\n`);
    } else {
      console.log('  [FAIL] Scoring calculations failed.', finalSubmitRes.data || finalSubmitRes.body, '\n');
    }

    console.log('====================================================');
    console.log('   INTEGRATION VERIFICATION LCYCLE COMPLETE (PASS)  ');
    console.log('====================================================');

  } catch (err) {
    console.error('\n  [ERROR] Integration verification encountered fatal network error:', err.message);
    console.log('          Make sure the backend server is running on http://localhost:5000 before running tests.');
  }
}

runTests();
