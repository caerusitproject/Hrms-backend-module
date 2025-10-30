// generate-tests.js
const fs = require('fs');
const path = require('path');

const modules = ['Auth', 'Employee', 'Payroll', 'Roles', 'RefreshToken', 'Leave'];
const testDir = path.join(__dirname, 'tests');

if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

const BASE_TEMPLATE = `
const request = require('supertest');
const app = require('../app');

`;

/*const db = require('../src/models');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});*/


const templates = {
  Auth: `
${BASE_TEMPLATE}

describe('Auth Module', () => {
  test('Register user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'pass123', email: 'test@example.com' });
    expect(res.statusCode).toBe(201);
  });

  test('Login user', async () => {
    const res = await request(app).post('/auth/login')
      .send({ username: 'testuser', password: 'pass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
`,
  Employee: `
${BASE_TEMPLATE}

describe('Employee Module', () => {
  let employeeId;

  test('Create employee', async () => {
    const res = await request(app)
      .post('/employees')
      .send({ name: 'Alice', department: 'HR', salary: 50000 });
    expect(res.statusCode).toBe(201);
    employeeId = res.body.id;
  });

  test('Get employee', async () => {
    const res = await request(app).get(\`/employees/\${employeeId}\`);
    expect(res.statusCode).toBe(200);
  });
});
`,
  Payroll: `
${BASE_TEMPLATE}

describe('Payroll Module', () => {
  test('Generate payslip', async () => {
    const res = await request(app).post('/payroll/generate')
      .send({ employeeId: 1, month: 'October', year: 2025 });
    expect(res.statusCode).toBe(200);
  });
});
`,
  Roles: `
${BASE_TEMPLATE}

describe('Roles Module', () => {
  test('Create role', async () => {
    const res = await request(app).post('/roles').send({ name: 'Manager' });
    expect(res.statusCode).toBe(201);
  });
});
`,
  RefreshToken: `
${BASE_TEMPLATE}

describe('RefreshToken Module', () => {
  test('Create refresh token', async () => {
    const res = await request(app).post('/refresh-token').send({ userId: 1 });
    expect(res.statusCode).toBe(201);
  });
});
`,
  Leave: `
${BASE_TEMPLATE}

describe('Leave Module', () => {
  let leaveId;

  test('Apply for leave', async () => {
    const res = await request(app)
      .post('/leave/apply')
      .send({ employeeId: 1, from: '2025-11-01', to: '2025-11-05', type: 'Sick' });
    expect(res.statusCode).toBe(201);
    leaveId = res.body.id;
  });

  test('Get leave', async () => {
    const res = await request(app).get(\`/leave/\${leaveId}\`);
    expect(res.statusCode).toBe(200);
  });
});
`
};

// Write test files
modules.forEach((m) => {
  const file = path.join(testDir, `${m.toLowerCase()}.test.js`);
  fs.writeFileSync(file, templates[m], 'utf8');
  console.log(`✅ Generated: ${file}`);
});

console.log('\n🎯 All Jest test files created successfully!\n');