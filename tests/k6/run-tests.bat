@echo off
REM k6 压力测试运行脚本 (Windows)
REM 使用方法：run-tests.bat [测试类型]

echo ========================================
echo   k6 压力测试套件
echo ========================================
echo.

REM 检查 k6 是否安装
where k6 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: k6 未安装
    echo.
    echo 请先安装 k6:
    echo   Windows: choco install k6
    echo   或下载: https://github.com/grafana/k6/releases
    exit /b 1
)

echo ✓ k6 已安装
k6 version
echo.

REM 创建报告目录
if not exist tests\k6\reports mkdir tests\k6\reports

REM 测试类型
set TEST_TYPE=%1
if "%TEST_TYPE%"=="" set TEST_TYPE=all

if "%TEST_TYPE%"=="api" goto api_test
if "%TEST_TYPE%"=="security" goto security_test
if "%TEST_TYPE%"=="all" goto all_tests
goto usage

:api_test
echo.
echo 运行测试: API 性能测试
echo ----------------------------------------
k6 run tests/k6/api-performance.js
goto end

:security_test
echo.
echo 运行测试: 安全防护验证
echo ----------------------------------------
k6 run tests/k6/security-test.js
goto end

:all_tests
echo 运行所有测试...
echo.
echo ========================================
echo   1/2 API 性能测试
echo ========================================
k6 run tests/k6/api-performance.js
echo.
echo ========================================
echo   2/2 安全防护验证
echo ========================================
k6 run tests/k6/security-test.js
goto end

:usage
echo.
echo 用法: %0 [api^|security^|all]
echo.
echo 测试说明:
echo   api      - API 性能测试（P95响应时间、QPS）
echo   security - 安全防护验证（暴力破解、接口滥用）
echo   all      - 运行所有测试
echo.
echo 可选环境变量:
echo   TEST_TOKEN - 认证 token（从浏览器获取）
echo   BASE_URL   - 服务地址（默认 http://localhost:3001）
echo.
echo 示例:
echo   set TEST_TOKEN=eyJxxx... ^&^& %0 api
exit /b 1

:end
echo.
echo ========================================
echo   测试完成！
echo   报告位置: tests/k6/reports/
echo ========================================
