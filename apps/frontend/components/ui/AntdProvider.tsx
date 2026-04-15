/**
 * Ant Design Provider - 提供主题和静态方法上下文
 */

"use client";

import { App, ConfigProvider, theme } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "rgba(255, 255, 255, 0.05)",
          colorText: "rgba(255, 255, 255, 0.85)",
          colorBorder: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
