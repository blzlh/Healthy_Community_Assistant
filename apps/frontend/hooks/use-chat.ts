"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { io, type Socket } from "socket.io-client";

import { Toast } from "@/components/ui/Toast/Toast";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore, type ChatMessage } from "@/store/chat-store";

type ChatHistoryPayload = {
  roomId: string;
  messages: ChatMessage[];
};

type ChatErrorPayload = {
  message?: string;
};

const loginExpiredToast = {
  title: "登录过期",
  message: "请重新登录后再进入聊天",
};

const isTokenError = (message: string) =>
  /expired|invalid|jwt|token|unauthorized/i.test(message);

export function useChat() {
  // --- Auth 状态 ---
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);

  // --- Chat 状态 ---
  const roomId = useChatStore((state) => state.roomId);
  const setConnected = useChatStore((state) => state.setConnected);
  const setLoading = useChatStore((state) => state.setLoading);
  const setHistory = useChatStore((state) => state.setHistory);
  const addMessage = useChatStore((state) => state.addMessage);

  // --- Refs & 节流控制 ---
  const socketRef = useRef<Socket | null>(null);
  const retriedRef = useRef(false); // 标记当前连接是否已经过一次自动重刷尝试
  const refreshInFlightRef = useRef(false); // 避免重复刷新请求
  const lastRefreshAttemptRef = useRef(0); // 刷新节流时间戳

  // 计算 Socket 连接配置
  const connectionOptions = useMemo(() => {
    if (typeof window === "undefined") return null;

    const origin = window.location.origin;
    const isNextDev = window.location.port === "3000";
    const url =
      process.env.NEXT_PUBLIC_WS_URL ?? (isNextDev ? "http://localhost:3001" : origin);
    const path =
      process.env.NEXT_PUBLIC_WS_PATH ?? (isNextDev ? "/socket.io" : "/ws/");

    return { url, path };
  }, []);

  useEffect(() => {
    if (!connectionOptions) return;
    if (!hydrated) return; // 确保 Zustand 状态已从 localStorage 恢复
    const options = connectionOptions;

    let cancelled = false; // 用于组件卸载或 effect 重新执行时的竞态处理
    retriedRef.current = false;

    function showLoginExpired() {
      Toast.error(loginExpiredToast);
    }

    /**
     * 合并新旧用户信息，保留 profile (如 avatarUrl) 不被刷新后的基础数据覆盖
     */
    function mergeSessionUser(nextUser?: typeof user | null) {
      if (user && nextUser) {
        return { ...user, ...nextUser };
      }
      return nextUser ?? user ?? undefined;
    }

    /**
     * 核心：绑定所有 Socket 事件监听
     */
    function bindSocketEvents(socket: Socket) {
      socket.on("connect", () => {
        // 仅标记底层连接成功，暂不 join，等待 ready
        setConnected(true);
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      // 连接层错误处理 (如握手失败)
      socket.on("connect_error", (error) => {
        setConnected(false);
        setLoading(false);
        const message = error?.message ?? "连接异常";
        // 如果是 token 相关错误，尝试静默刷新
        if (refreshToken && isTokenError(message)) {
          refreshSessionAndReconnect(true);
          return;
        }
        Toast.error({
          title: "聊天连接失败",
          message: `${message} (${options.url}${options.path})`,
        });
      });

      // 业务层错误处理 (后端抛出的 chat:error)
      socket.on("chat:error", (payload: ChatErrorPayload) => {
        setConnected(false);
        setLoading(false);
        const message = payload.message ?? "连接异常";
        
        // 策略：如果未重试过且是 token 问题，尝试断开并刷新一次 session
        const shouldRetry =
          !retriedRef.current &&
          refreshToken &&
          (isTokenError(message) || message === "连接异常");
        
        if (shouldRetry) {
          retriedRef.current = true;
          socket.disconnect();
          refreshSessionAndReconnect(true);
          return;
        }

        Toast.error({
          title: "聊天错误",
          message,
        });
      });

      // 关键：后端鉴权通过后会发出 ready，此时 join 才是安全的
      socket.on("chat:ready", () => {
        setConnected(true);
        setLoading(true); // 切换房间或重新连接时开启 loading
        socket.emit("chat:join", { roomId });
      });

      socket.on("chat:history", (payload: ChatHistoryPayload) => {
        setHistory(payload.roomId, payload.messages);
      });

      socket.on("chat:message", (message: ChatMessage) => {
        addMessage(message);
      });
    }

    /**
     * 使用指定 token 建立连接
     */
    function connectWithToken(accessToken: string) {
      if (!accessToken || cancelled) return;
      socketRef.current?.disconnect();
      setLoading(true);
      
      const socket = io(options.url, {
        path: options.path,
        transports: ["websocket", "polling"],
        auth: { token: `Bearer ${accessToken}` },
        reconnection: false, // 禁用自带重连，由业务逻辑控制
      });
      
      socketRef.current = socket;
      bindSocketEvents(socket);
    }

    /**
     * 应用刷新后的 session 并触发重连
     */
    function applyRefreshedSession(
      session?:
        | { access_token?: string; refresh_token?: string; expires_at?: number }
        | null,
      sessionUser?: typeof user | null
    ) {
      if (!session?.access_token) {
        showLoginExpired();
        return;
      }
      setSession(session, mergeSessionUser(sessionUser));
      connectWithToken(session.access_token);
    }

    /**
     * 刷新 Supabase 会话并重连
     * @param respectBackoff 是否遵循 10s 节流限制
     */
    function refreshSessionAndReconnect(respectBackoff: boolean) {
      if (!refreshToken) return;
      if (refreshInFlightRef.current) return;
      
      const now = Date.now();
      if (respectBackoff && now - lastRefreshAttemptRef.current < 10000) return;
      
      refreshInFlightRef.current = true;
      lastRefreshAttemptRef.current = now;
      
      void supabase.auth
        .refreshSession({ refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error || cancelled) {
            if (!cancelled) showLoginExpired();
            return;
          }
          applyRefreshedSession(data.session, data.user);
        })
        .finally(() => {
          refreshInFlightRef.current = false;
        });
    }

    /**
     * 连接初始化入口：判断是直接连还是先刷 session
     */
    function initConnection() {
      setConnected(false);
      const nowSeconds = Math.floor(Date.now() / 1000);
      
      // 逻辑：没 token 只有 refresh_token，或者 token 即将过期 (30s 内)，先刷新
      const needsRefresh =
        !!refreshToken && (!token || (!!expiresAt && nowSeconds >= expiresAt - 30));
      
      if (needsRefresh) {
        refreshSessionAndReconnect(false);
        return;
      }
      
      if (token) {
        connectWithToken(token);
        return;
      }
      
      showLoginExpired();
    }

    initConnection();

    // 卸载清理
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setLoading(false);
    };
  }, [
    token,
    refreshToken,
    expiresAt,
    user,
    hydrated,
    setSession,
    connectionOptions,
    roomId,
    setConnected,
    setLoading,
    setHistory,
    addMessage,
  ]);

  const sendMessage = useCallback(
    (text: string) => {
      const socket = socketRef.current;
      if (!socket) return;
      socket.emit("chat:message", { roomId, text });
    },
    [roomId]
  );

  return { sendMessage };
}
