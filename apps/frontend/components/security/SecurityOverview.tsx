/**
 * 安全概览组件 - 显示统计卡片和最近登录失败记录
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Table, Skeleton, Empty, ConfigProvider } from "antd";
import type { ColumnsType } from "antd/es/table";

interface LoginAttempt {
  id: string;
  ipAddress: string;
  email: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface SecurityStatistics {
  todayFailedAttempts: number;
  activeBlockedIps: number;
  todaySecurityEvents: number;
  bruteForceDetections: number;
}

interface SecurityOverviewProps {
  statistics: SecurityStatistics | null;
  loginAttempts: LoginAttempt[];
  loadingStatistics: boolean;
  loadingAttempts: boolean;
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("zh-CN");
};

// 暗色主题配置
const darkTheme = {
  token: {
    colorBgContainer: "transparent",
    colorText: "rgba(255, 255, 255, 0.85)",
    colorTextSecondary: "rgba(255, 255, 255, 0.6)",
  },
  components: {
    Table: {
      headerBg: "transparent",
    },
  },
};

export function SecurityOverview({
  loginAttempts,
  loadingAttempts,
}: SecurityOverviewProps) {
  const columns: ColumnsType<LoginAttempt> = [
    {
      title: "IP地址",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip: string) => <span style={{ fontFamily: "monospace" }}>{ip}</span>,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (email: string | null) => email || "-",
    },
    {
      title: "失败原因",
      dataIndex: "failureReason",
      key: "failureReason",
      render: (reason: string | null) => (
        <span style={{ color: "#f87171" }}>{reason || "-"}</span>
      ),
    },
    {
      title: "时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time: string) => (
        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>{formatTime(time)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 最近登录失败记录 */}
      <Card className="!bg-white/5 !border-white/10">
        <CardHeader>
          <CardTitle className="!text-lg flex items-center gap-2 !text-white">
            最近登录失败记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigProvider theme={darkTheme}>
            {loadingAttempts ? (
              <Skeleton active />
            ) : loginAttempts.length === 0 ? (
              <Empty
                description={<span style={{ color: "rgba(255, 255, 255, 0.4)" }}>暂无登录失败记录</span>}
                style={{ padding: "2rem 0" }}
              />
            ) : (
              <Table
                dataSource={loginAttempts.slice(0, 10)}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table]:!border-white/5 [&_.ant-table-thead>tr>th]:!border-white/5 [&_.ant-table-tbody>tr>td]:!border-white/5"
              />
            )}
          </ConfigProvider>
        </CardContent>
      </Card>
    </div>
  );
}
