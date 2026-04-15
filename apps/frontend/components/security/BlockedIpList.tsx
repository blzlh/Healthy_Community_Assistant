/**
 * 封禁IP列表组件
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Icon } from "@iconify/react";
import { Table, Tag, Skeleton, Empty, Popconfirm, ConfigProvider } from "antd";
import type { ColumnsType } from "antd/es/table";

interface BlockedIp {
  id: string;
  ipAddress: string;
  reason: string;
  autoBlocked: boolean;
  expiresAt: string;
}

interface BlockedIpListProps {
  blockedIps: BlockedIp[];
  loading: boolean;
  onUnblock: (ipAddress: string) => void;
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

export function BlockedIpList({ blockedIps, loading, onUnblock }: BlockedIpListProps) {
  const columns: ColumnsType<BlockedIp> = [
    {
      title: "IP地址",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip: string) => <span style={{ fontFamily: "monospace" }}>{ip}</span>,
    },
    {
      title: "原因",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "类型",
      dataIndex: "autoBlocked",
      key: "autoBlocked",
      render: (autoBlocked: boolean) => (
        <Tag color={autoBlocked ? "orange" : "blue"}>
          {autoBlocked ? "自动封禁" : "手动封禁"}
        </Tag>
      ),
    },
    {
      title: "过期时间",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (time: string) => (
        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>{formatTime(time)}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="确定要解封此IP吗？"
          onConfirm={() => onUnblock(record.ipAddress)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            size="sm"
            variant="outline"
            className="!border-green-500/30 !text-green-400 hover:!bg-green-500/10 !h-7 !text-xs"
          >
            解封
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card className="!bg-white/5 !border-white/10">
      <CardHeader>
        <CardTitle className="!text-lg flex items-center gap-2 !text-white">
          <Icon icon="lucide:ban" className="w-5 h-5 text-red-400" />
          封禁IP列表
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ConfigProvider theme={darkTheme}>
          {loading ? (
            <Skeleton active />
          ) : blockedIps.length === 0 ? (
            <Empty
              description={<span style={{ color: "rgba(255, 255, 255, 0.4)" }}>暂无封禁IP</span>}
              style={{ padding: "2rem 0" }}
            />
          ) : (
            <Table
              dataSource={blockedIps}
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
  );
}
