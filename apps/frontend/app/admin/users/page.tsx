"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar, Button, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Toast } from "@/components/ui/Toast/Toast";
import { Icon } from "@iconify/react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { useAuthStore } from "@/store/auth-store";
import { fetchAllUsers, banUser } from "@/services/profile";
import type { AuthUser } from "@/services/auth";

export default function AdminUsersPage() {
  const token = useAuthStore((state) => state.token);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const modalCancelButtonClass =
    "!bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20";
  const modalPrimaryOkButtonClass =
    "!bg-zinc-800 !text-white hover:!bg-zinc-700";
  const modalDangerOkButtonClass =
    "!bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20 hover:!border-red-500/30";

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await fetchAllUsers(token);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Load users error:", error);
      Toast.error({
        title: "获取用户列表失败",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBanToggle = (user: AuthUser) => {
    const isBanning = !user.isBanned;
    Modal.confirm({
      centered: true,
      title: (
        <div className="font-semibold text-white">
          {`${isBanning ? "封禁" : "解封"}用户 ${user.name || user.email}`}
        </div>
      ),
      content: (
        <div className="mt-1 text-sm text-white/60">
          {isBanning
            ? "封禁后该用户将无法发布动态和在聊天室发言。确定要封禁吗？"
            : "确定要解封该用户吗？"}
        </div>
      ),
      icon: (
        <Icon
          icon="ep:warn-triangle-filled"
          className={`text-2xl text-yellow-400 pr-2 h-8 w-8`}
        />
      ),
      okText: "确定",
      cancelText: "取消",
      okType: isBanning ? "danger" : "primary",
      okButtonProps: {
        className: isBanning ? modalDangerOkButtonClass : modalPrimaryOkButtonClass,
      },
      cancelButtonProps: {
        className: modalCancelButtonClass,
      },
      onOk: async () => {
        try {
          if (!user.id) return;
          await banUser(token, user.id, isBanning);
          Toast.success({
            title: `用户 ${user.name || user.email} 已${
              isBanning ? "封禁" : "解封"
            }`,
          });
          loadUsers(); // 刷新列表
        } catch (error) {
          console.error("Ban user error:", error);
          Toast.error({
            title: "操作失败",
            message: "请稍后重试",
          });
        }
      },
      classNames: {
        container: "!bg-[#131212] border border-white/10",
        header: "bg-[#131212] border-b border-white/10",
        body: "bg-[#131212] text-white",
        title: "text-white",
        wrapper: "text-white",
      },
      styles: {
        mask: {
          background: "rgba(0,0,0,0.65)",
        },
      },
    });
  };

  const columns: ColumnsType<AuthUser> = [
    {
      title: "用户",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatarUrl} className="bg-zinc-700">
            {(record.name || record.email || "U").slice(0, 1).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{record.name || record.email}</span>
            <span className="text-xs text-white/50">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "角色",
      key: "role",
      render: (_, record) => (
        record.isAdmin ? (
          <Tag className="!bg-blue-500/10 !border-blue-500/20 !text-blue-400 !rounded-lg !px-2">管理员</Tag>
        ) : (
          <Tag className="!bg-white/5 !border-white/10 !text-white/40 !rounded-lg !px-2">普通用户</Tag>
        )
      ),
    },
    {
      title: "状态",
      key: "status",
      render: (_, record) => (
        record.isBanned ? (
          <Tag className="!bg-red-500/10 !border-red-500/20 !text-red-400 !rounded-lg !px-2">已封禁</Tag>
        ) : (
          <Tag className="!bg-green-500/10 !border-green-500/20 !text-green-400 !rounded-lg !px-2">正常</Tag>
        )
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        if (record.isAdmin) return null; // 不允许封禁其他管理员
        return (
          <Button
            type="link"
            danger={!record.isBanned}
            onClick={() => handleBanToggle(record)}
            className={record.isBanned ? "!text-green-400/80 hover:!text-green-400" : "!text-red-400/80 hover:!text-red-400"}
          >
            {record.isBanned ? "解封" : "封禁"}
          </Button>
        );
      },
    },
  ];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/80 border border-white/5 shadow-inner">
                <Icon icon="lucide:users" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">用户管理</h1>
                <p className="text-sm text-white/40 font-light">查看并管理社区所有用户权限</p>
              </div>
            </div>
            <Button 
              icon={<Icon icon="lucide:refresh-cw" />}
              onClick={loadUsers}
              loading={loading}
              className="!bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10 hover:!border-white/20 !h-9 !px-4 !rounded-xl transition-all active:scale-95"
            >
              刷新列表
            </Button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-md overflow-hidden shadow-2xl">
            <Table
              dataSource={users}
              columns={columns}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                className: "!text-white/60 !mt-2 !mb-2 !px-4 [&_.ant-pagination-item]:!bg-white/5 [&_.ant-pagination-item]:!border-white/10 [&_.ant-pagination-item_a]:!text-white/70 [&_.ant-pagination-item-active]:!bg-white/20 [&_.ant-pagination-item-active]:!border-white/30 [&_.ant-pagination-item-active_a]:!text-white [&_.ant-pagination-prev_button]:!text-white/40 [&_.ant-pagination-next_button]:!text-white/40",
              }}
              className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead_th]:!bg-transparent [&_.ant-table-thead_th]:!text-white/50 [&_.ant-table-thead_th]:!border-white/10 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-tbody_td]:!border-white/5 [&_.ant-table-tbody_tr:hover_td]:!bg-white/5 [&_.ant-table-tbody_tr]:transition-colors"
            />
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
