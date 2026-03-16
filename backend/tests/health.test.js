// backend/tests/health.test.js

const request = require('supertest');
const app = require('../src/app');

jest.setTimeout(15000);   // ✅ increase timeout from 5s to 15s

describe('Health Check Endpoints', () => {
  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET /ready returns ready', async () => {
    const res = await request(app).get('/ready');
    expect(res.statusCode).toBe(200);
  });

  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
  });
});
