/**
 * k6 压力测试 - 安全防护验证
 * 
 * 测试内容：
 * 1. 暴力破解检测 - 连续登录失败触发封禁
 * 2. 接口滥用检测 - 高频请求触发限流
 * 
 * 使用方法：
 * k6 run tests/k6/security-test.js
 * 
 * 注意：此测试会触发安全机制，可能导致 IP 被临时封禁
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, TEST_TOKEN } from './config.js';

// 安全测试配置（单用户，检测功能）
export const options = {
  stages: [
    { duration: '5s', target: 1 },
    { duration: '30s', target: 1 },
    { duration: '5s', target: 0 },
  ],
};

// 测试结果（使用全局变量存储）
const results = {
  bruteForce: { attempts: 0, blocked: 0 },
  apiAbuse: { requests: 0, rateLimited: 0 },
};

// 测试暴力破解检测
export function testBruteForce() {
  console.log('\n🔐 测试暴力破解检测...');
  console.log('   发送 10 次错误登录请求');
  
  const url = `${BASE_URL}/auth/login`;
  
  for (let i = 0; i < 10; i++) {
    const payload = JSON.stringify({
      email: `nonexistent${i}@example.com`,
      password: 'wrongpassword',
    });

    const res = http.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    results.bruteForce.attempts++;
    
    const isBlocked = res.status === 403 || 
                      (res.body && (
                        res.body.includes('blocked') || 
                        res.body.includes('封禁') ||
                        res.body.includes('too many')
                      ));
    
    if (isBlocked) {
      results.bruteForce.blocked++;
      console.log(`   [${i + 1}/10] ⛔ IP 已被封禁`);
    } else {
      console.log(`   [${i + 1}/10] ❌ 登录失败 (${res.status})`);
    }
    
    sleep(0.5);
  }
}

// 测试接口滥用检测
export function testApiAbuse() {
  console.log('\n⚡ 测试接口滥用检测...');
  console.log('   快速发送 150 个请求');
  
  if (!TEST_TOKEN || TEST_TOKEN === 'your-test-token-here') {
    console.log('   ⚠️ 未设置 TEST_TOKEN，使用公开 API 测试');
    testPublicApiAbuse();
    return;
  }
  
  const url = `${BASE_URL}/community/posts`;
  const params = {
    headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
  };
  
  // 快速发送请求
  for (let i = 0; i < 150; i++) {
    const res = http.get(url, params);
    results.apiAbuse.requests++;
    
    const isRateLimited = res.status === 429 || 
                          (res.body && (
                            res.body.includes('rate') || 
                            res.body.includes('频繁') ||
                            res.body.includes('too many')
                          ));
    
    if (isRateLimited) {
      results.apiAbuse.rateLimited++;
    }
    
    // 每 50 个请求输出进度
    if ((i + 1) % 50 === 0) {
      console.log(`   已发送 ${i + 1} 个请求...`);
    }
  }
}

// 测试公开 API 滥用（无需认证）
export function testPublicApiAbuse() {
  console.log('   使用登录 API 测试接口滥用');
  const url = `${BASE_URL}/auth/login`;
  
  for (let i = 0; i < 150; i++) {
    const res = http.post(url, JSON.stringify({ email: 'test@test.com' }), {
      headers: { 'Content-Type': 'application/json' },
    });
    results.apiAbuse.requests++;
    
    if (res.status === 429) {
      results.apiAbuse.rateLimited++;
    }
    
    if ((i + 1) % 50 === 0) {
      console.log(`   已发送 ${i + 1} 个请求...`);
    }
  }
}

export default function () {
  // 测试暴力破解
  testBruteForce();
  
  sleep(2);
  
  // 测试接口滥用
  testApiAbuse();
  
  sleep(5);
}

// 测试摘要
export function handleSummary(data) {
  const lines = [];
  
  lines.push('\n' + '='.repeat(60));
  lines.push('安全防护功能验证报告');
  lines.push('='.repeat(60));
  
  // 暴力破解结果
  lines.push('\n🔐 暴力破解检测:');
  lines.push(`   尝试次数: ${results.bruteForce.attempts}`);
  lines.push(`   被封禁次数: ${results.bruteForce.blocked}`);
  
  if (results.bruteForce.blocked > 0) {
    lines.push('   ✅ 暴力破解检测功能正常');
    const rate = ((results.bruteForce.blocked / results.bruteForce.attempts) * 100).toFixed(1);
    lines.push(`   📊 拦截率: ${rate}%`);
  } else {
    lines.push('   ⚠️ 未检测到封禁');
    lines.push('   💡 提示: 检查 Redis 连接和安全服务配置');
  }
  
  // 接口滥用结果
  lines.push('\n⚡ 接口滥用检测:');
  lines.push(`   请求数: ${results.apiAbuse.requests}`);
  lines.push(`   被限流次数: ${results.apiAbuse.rateLimited}`);
  
  if (results.apiAbuse.rateLimited > 0) {
    lines.push('   ✅ 接口滥用检测功能正常');
    const rate = ((results.apiAbuse.rateLimited / results.apiAbuse.requests) * 100).toFixed(1);
    lines.push(`   📊 限流率: ${rate}%`);
  } else {
    lines.push('   ⚠️ 未检测到限流');
    lines.push('   💡 提示: 可能需要更高频率触发 (QPS≥100)');
  }
  
  // 验收结论
  lines.push('\n📋 验收结论:');
  const bruteForcePass = results.bruteForce.blocked > 0;
  const apiAbusePass = results.apiAbuse.rateLimited > 0;
  
  if (bruteForcePass && apiAbusePass) {
    lines.push('   ✅ 安全防护功能验证通过');
  } else {
    lines.push('   ⚠️ 部分功能未触发:');
    if (!bruteForcePass) lines.push('      - 暴力破解检测未触发');
    if (!apiAbusePass) lines.push('      - 接口滥用检测未触发');
  }
  
  lines.push('\n' + '='.repeat(60));
  lines.push('💡 提示: 测试后请查看 Kibana 和 Security 页面验证日志记录');
  lines.push('='.repeat(60) + '\n');
  
  return {
    'stdout': lines.join('\n'),
    'tests/k6/reports/security-test-report.json': JSON.stringify({
      ...data,
      securityTest: {
        bruteForce: results.bruteForce,
        apiAbuse: results.apiAbuse,
      },
    }, null, 2),
  };
}
