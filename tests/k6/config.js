/**
 * k6 压力测试 - 配置文件
 * 
 * 使用方法：
 * 1. 安装 k6: https://k6.io/docs/getting-started/installation/
 * 2. 运行测试: k6 run tests/k6/api-performance.js
 */

// 基础配置
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// 测试配置
export const TEST_CONFIG = {
  // 并发用户数（任务书要求 ≥30）
  VUS: 30,
  // 测试持续时间
  DURATION: '30s',
  // 预热时间
  RAMP_UP: '10s',
};

// 阈值配置（任务书验收指标）
export const THRESHOLDS = {
  // P95 响应时间 ≤500ms
  p95_response_time: ['p(95)<500'],
  // 错误率 < 5%
  error_rate: ['rate<0.05'],
};

// 测试 Token（从浏览器开发者工具获取）
// 步骤：登录应用 -> F12 -> Application -> Local Storage -> 找到 token
export const TEST_TOKEN = __ENV.TEST_TOKEN || 'your-test-token-here';

// 测试 IP（用于安全测试）
export const TEST_IP = __ENV.TEST_IP || '127.0.0.1';
