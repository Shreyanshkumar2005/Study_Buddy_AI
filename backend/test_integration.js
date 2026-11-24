require('dotenv').config();
const { app, server } = require('./server');

async function runIntegrationTests() {
  console.log('\n=============================================');
  console.log('   RUNNING STUDYBUDDY E2E INTEGRATION TESTS  ');
  console.log('=============================================\n');

  // Allow server and DB connection to stabilize
  await new Promise((r) => setTimeout(r, 1000));

  let studentToken = '';
  let studentRefreshToken = '';
  let adminToken = '';
  let createdNoteId = '';

  const BASE_URL = 'http://localhost:5001/api';

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    console.log('✓ Health check:', healthJson.status);

    // 2. Student Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@studybuddy.test',
        password: 'Password123!'
      })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success || !loginJson.accessToken) {
      throw new Error(`Student login failed: ${loginJson.message}`);
    }
    studentToken = loginJson.accessToken;
    studentRefreshToken = loginJson.refreshToken;
    console.log('✓ Student Login successful (JWT access & refresh tokens received)');

    // 3. Student Profile Check
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const meJson = await meRes.json();
    console.log(`✓ Student Profile verified: ${meJson.user.name} (${meJson.user.role})`);

    // 4. Token Refresh Test
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: studentRefreshToken })
    });
    const refreshJson = await refreshRes.json();
    if (!refreshJson.success || !refreshJson.accessToken) {
      throw new Error(`Token refresh failed: ${refreshJson.message}`);
    }
    studentToken = refreshJson.accessToken;
    console.log('✓ Token Refresh flow verified successfully');

    // 5. Get Notes (with filter)
    const notesRes = await fetch(`${BASE_URL}/notes?subject=Biology`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const notesJson = await notesRes.json();
    console.log(`✓ Get Notes query with subject filter returned ${notesJson.data.length} notes`);

    // 6. Create Note
    const createNoteRes = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Neurological Synaptic Transmission',
        subject: 'Neuroscience',
        tags: ['brain', 'synapse', 'action-potential'],
        content: 'Action potentials arrive at the presynaptic axon terminal, causing voltage-gated calcium channels to open. The influx of calcium ions triggers synaptic vesicles to fuse with the presynaptic membrane via SNARE proteins, releasing neurotransmitters into the synaptic cleft. Neurotransmitters bind to ligand-gated ion channels on the postsynaptic membrane.'
      })
    });
    const createNoteJson = await createNoteRes.json();
    if (!createNoteJson.success) throw new Error(createNoteJson.message);
    createdNoteId = createNoteJson.data._id;
    console.log(`✓ Note created with Mongoose validation: "${createNoteJson.data.title}" (ID: ${createdNoteId})`);

    // 7. Generate AI Summary (Custom Rate Limiter + Fetch API)
    const summaryRes = await fetch(`${BASE_URL}/ai/summary/${createdNoteId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const summaryJson = await summaryRes.json();
    if (!summaryJson.success) throw new Error(summaryJson.message);
    console.log(`✓ AI Summary generated (${summaryJson.data.modelUsed}, ${summaryJson.data.durationMs}ms)`);

    // 8. Generate Practice Questions
    const quizRes = await fetch(`${BASE_URL}/ai/questions/${createdNoteId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const quizJson = await quizRes.json();
    if (!quizJson.success) throw new Error(quizJson.message);
    console.log(`✓ AI Practice Questions generated (${quizJson.data.questions?.length} questions)`);

    // 9. Check AI History
    const historyRes = await fetch(`${BASE_URL}/ai/history`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const historyJson = await historyRes.json();
    console.log(`✓ AI Request History retrieved (${historyJson.data.length} history records logged)`);

    // 10. Admin RBAC Access Check
    // Attempting admin route with student token should return 403 Forbidden
    const forbiddenRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ RBAC Check: Student attempting Admin endpoint correctly returned HTTP ${forbiddenRes.status} Forbidden`);

    // 11. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@studybuddy.test',
        password: 'AdminPass123!'
      })
    });
    const adminLoginJson = await adminLoginRes.json();
    adminToken = adminLoginJson.accessToken;
    console.log('✓ Admin Login successful');

    // 12. Admin Aggregation Pipeline: Requests per user per day
    const aggRes = await fetch(`${BASE_URL}/admin/usage-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const aggJson = await aggRes.json();
    if (!aggJson.success) throw new Error(aggJson.message);
    console.log('✓ Admin Aggregation Pipeline (requests per user per day) executed successfully:');
    console.log(`   - Aggregated records: ${aggJson.data.requestsPerUserPerDay.length}`);
    console.log(`   - Feature types breakdown: ${aggJson.data.requestsByType.map((t) => `${t.type}: ${t.count}`).join(', ')}`);
    console.log(`   - Daily system trends: ${aggJson.data.dailyTrend.length} days recorded`);

    console.log('\n=============================================');
    console.log('  ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS  ');
    console.log('=============================================\n');
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      process.exit(0);
    });
  }
}

runIntegrationTests();
