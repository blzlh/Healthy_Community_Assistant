/**
 * 手动封禁IP表单组件
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Icon } from "@iconify/react";
import { Form, App } from "antd";
import { useState } from "react";

interface BlockIpFormProps {
  onSubmit: (data: { ipAddress: string; reason: string; durationMinutes: number }) => Promise<void>;
}

// 表单字段配置
const FORM_FIELDS = [
  {
    name: "ipAddress",
    placeholder: "IP地址",
    rules: [{ required: true, message: "请输入IP地址" }],
    className: "!mb-0 flex-1 min-w-[150px]",
    type: "text" as const,
  },
  {
    name: "reason",
    placeholder: "封禁原因",
    rules: [{ required: true, message: "请输入封禁原因" }],
    className: "!mb-0 flex-1 min-w-[150px]",
    type: "text" as const,
  },
  {
    name: "durationMinutes",
    placeholder: "时长(分钟)",
    rules: undefined,
    className: "!mb-0 w-32",
    type: "number" as const,
  },
];

export function BlockIpForm({ onSubmit }: BlockIpFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { ipAddress: string; reason: string; durationMinutes: number }) => {
    setLoading(true);
    try {
      await onSubmit(values);
      message.success("封禁成功");
      form.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "封禁失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="!bg-white/5 !border-white/10 mb-6">
      <CardHeader>
        <CardTitle className="!text-base !text-white">手动封禁IP</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmit}
          initialValues={{ durationMinutes: 60 }}
          className="flex flex-wrap gap-3"
        >
          {FORM_FIELDS.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              rules={field.rules}
              className={field.className}
            >
              <Input
                type={field.type}
                placeholder={field.placeholder}
                className="!bg-white/5 !border-white/10 !text-white"
              />
            </Form.Item>
          ))}
          <Form.Item className="!mb-0">
            <Button
              type="submit"
              disabled={loading}
              className="!bg-red-600 !text-white hover:!bg-red-500 h-10 py-0"
            >
              <Icon icon="lucide:ban" className="" />
              {loading ? "封禁中..." : "封禁"}
            </Button>
          </Form.Item>
        </Form>
      </CardContent>
    </Card>
  );
}
