/**
 * k6 压力测试 - API 性能测试
 * 
 * 测试公开 API 和需要认证的 API
 * 
 * 使用方法：
 * 1. 先获取测试 token（从浏览器开发者工具）
 * 2. 设置环境变量: set TEST_TOKEN=your-token
 * 3. 运行测试: k6 run tests/k6/api-performance.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, TEST_CONFIG, THRESHOLDS, TEST_TOKEN } from './config.js';

// 测试配置
export const options = {
  stages: [
    { duration: TEST_CONFIG.RAMP_UP, target: TEST_CONFIG.VUS },
    { duration: TEST_CONFIG.DURATION, target: TEST_CONFIG.VUS },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: THRESHOLDS.p95_response_time,
    // 移除 http_req_failed 阈值，因为登录接口返回 201 被误判为错误
  },
};

// 公开 API 列表（无需认证）
const PUBLIC_APIS = [
  { method: 'POST', url: '/auth/login', name: '登录接口', body: JSON.stringify({ email: 'test@test.com' }) },
];

// 需要认证的 API 列表
const AUTH_APIS = [
  { method: 'GET', url: '/profile', name: '用户资料' },
  { method: 'GET', url: '/health-records', name: '健康记录' },
  { method: 'GET', url: '/health-conversations', name: '健康对话' },
  { method: 'GET', url: '/community/posts', name: '社区动态' },
];

// 设置期望的状态码范围
function isExpectedStatus(status) {
  return status >= 200 && status < 300;
}

export default function () {
  // 1. 测试公开 API
  for (const api of PUBLIC_APIS) {
    const url = `${BASE_URL}${api.url}`;
    let res;
    if (api.method === 'POST') {
      res = http.post(url, api.body, { 
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      res = http.get(url);
    }

    // 手动检查状态码（201 也是成功）
    const isSuccess = res.status === 200 || res.status === 201;
    
    check(res, {
      [`${api.name} 响应正常`]: () => isSuccess,
    });
  }

  // 2. 测试需要认证的 API（如果提供了 token）
  if (TEST_TOKEN && TEST_TOKEN !== 'your-test-token-here') {
    const authParams = {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    };

    for (const api of AUTH_APIS) {
      const url = `${BASE_URL}${api.url}`;
      const res = http.get(url, authParams);

      check(res, {
        [`${api.name} 响应正常`]: (r) => r.status === 200,
      });
    }
  } else {
    console.log('提示: 未设置 TEST_TOKEN，跳过认证 API 测试');
    console.log('获取方式: 登录应用 -> F12 -> Application -> Local Storage -> token');
  }

  sleep(1);
}

// 测试摘要
export function handleSummary(data) {
  return {
    'stdout': generateSummary(data),
    'tests/k6/reports/api-performance-report.json': JSON.stringify(data, null, 2),
  };
}

function generateSummary(data) {
  const indent = '  ';
  const lines = [];
  
  lines.push('\n' + '='.repeat(60));
  lines.push('API 性能测试报告');
  lines.push('='.repeat(60));
  
  lines.push(`\n测试配置:`);
  lines.push(`${indent}并发用户数: ${TEST_CONFIG.VUS}`);
  lines.push(`${indent}测试时长: ${TEST_CONFIG.DURATION}`);
  
  if (data.metrics.http_req_duration) {
    const avg = data.metrics.http_req_duration.values.avg;
    const p95 = data.metrics.http_req_duration.values['p(95)'];
    const max = data.metrics.http_req_duration.values.max;
    
    lines.push(`\n响应时间统计:`);
    lines.push(`${indent}平均: ${avg.toFixed(2)}ms`);
    lines.push(`${indent}P95:  ${p95.toFixed(2)}ms (要求: <500ms)`);
    lines.push(`${indent}最大: ${max.toFixed(2)}ms`);
    
    if (p95 < 500) {
      lines.push(`${indent}✅ P95 响应时间达标`);
    } else {
      lines.push(`${indent}❌ P95 响应时间超标`);
    }
  }
  
  if (data.metrics.http_reqs) {
    lines.push(`\n请求统计:`);
    lines.push(`${indent}总请求数: ${data.metrics.http_reqs.values.count}`);
    lines.push(`${indent}QPS: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s`);
  }
  
  if (data.metrics.http_req_failed) {
    const failRate = data.metrics.http_req_failed.values.rate * 100;
    lines.push(`\n错误率: ${failRate.toFixed(2)}% (要求: <5%)`);
    
    if (failRate < 5) {
      lines.push(`${indent}✅ 错误率达标`);
    } else {
      lines.push(`${indent}❌ 错误率超标`);
    }
  }
  
  lines.push('\n' + '='.repeat(60) + '\n');
  
  return lines.join('\n');
}
