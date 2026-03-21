"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

type ChatScrollbarProps = {
  // 需要绑定滚动的容器（有 overflow-y-auto 的那个元素）
  containerRef: React.RefObject<HTMLElement | null>;
  // 是否显示滚动条（由外部控制显示/隐藏时机）
  visible: boolean;
  // 滚动条距离容器右侧的偏移
  right?: number;
  // 滚动条轨道距离顶部/底部的留白（避免被圆角裁切）
  top?: number;
  bottom?: number;
  // 滚动条宽度（越小越细）
  width?: number;
  // 最小滑块高度（防止内容太长时滑块过小）
  minThumbHeight?: number;
};

export function ChatScrollbar({
  containerRef,
  visible,
  right = 8,
  top = 12,
  bottom = 12,
  width = 6,
  minThumbHeight = 28,
}: ChatScrollbarProps) {
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);

  const geometry = useMemo(
    () => ({
      right,
      top,
      bottom,
      width,
      minThumbHeight,
    }),
    [right, top, bottom, width, minThumbHeight],
  );

  const updateThumb = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const scrollTop = el.scrollTop;

    // 内容不足以滚动时不显示滑块
    if (scrollHeight <= clientHeight) {
      setThumbTop(0);
      setThumbHeight(0);
      return;
    }

    // 轨道高度 = 可视区域 - 上下留白
    const trackHeight = Math.max(0, clientHeight - geometry.top - geometry.bottom);
    if (trackHeight <= 0) {
      setThumbTop(0);
      setThumbHeight(0);
      return;
    }

    // 滑块高度与内容比例相关，并有一个最小高度下限
    const idealThumbHeight = (clientHeight / scrollHeight) * trackHeight;
    const nextThumbHeight = Math.max(geometry.minThumbHeight, Math.floor(idealThumbHeight));
    const maxThumbTop = Math.max(0, trackHeight - nextThumbHeight);

    // 滑块位置与滚动位置等比映射
    const maxScrollTop = scrollHeight - clientHeight;
    const ratio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
    const nextThumbTop = Math.floor(ratio * maxThumbTop);

    setThumbHeight(nextThumbHeight);
    setThumbTop(nextThumbTop);
  }, [containerRef, geometry]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => updateThumb();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef, updateThumb]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => updateThumb());
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [containerRef, updateThumb]);

  const shouldRender = visible && thumbHeight > 0;

  return (
    <AnimatePresence>
      {shouldRender ? (
        <motion.div
          key="chat-scrollbar"
          className="pointer-events-none absolute"
          style={{
            right: geometry.right,
            top: geometry.top,
            bottom: geometry.bottom,
            width: geometry.width,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="w-full rounded-full bg-white/20"
            style={{
              height: thumbHeight,
              transform: `translateY(${thumbTop}px)`,
            }}
            layout={false}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
