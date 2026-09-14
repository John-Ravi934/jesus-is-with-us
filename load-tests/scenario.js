import http from 'k6/http';
import { check, sleep } from 'k6';

// Test scenarios configured for load testing
export const options = {
  scenarios: {
    // Scenario A: Average load
    average_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    // Scenario B: Peak load (Can be run selectively)
    // peak_load: { ... }
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function () {
  // Simulate user browsing
  
  // 1. Visit homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 2. Visit gallery
  res = http.get(`${BASE_URL}/gallery`);
  check(res, {
    'gallery status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 3. Try to hit a protected API or login
  res = http.post(`${BASE_URL}/admin`, { email: 'test@example.com', password: 'test' });
  // It shouldn't crash
  check(res, {
    'login attempt handled': (r) => r.status !== 500,
  });
  sleep(1);
}
