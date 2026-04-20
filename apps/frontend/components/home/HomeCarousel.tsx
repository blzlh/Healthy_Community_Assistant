"use client";

import { Carousel } from "antd";
import { useEffect, useState } from "react";

// 使用 Unsplash 的健康主题图片（统一规格 1200x400）
const carouselItems = [
  {
    id: 1,
    title: "您的健康，我们守护",
    description: "智能化健康管理平台，让健康生活触手可及",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop",
  },
  {
    id: 2,
    title: "连接每一位关心健康的人",
    description: "与志同道合的伙伴分享经验，共同成长",
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1200&h=400&fit=crop",
  },
  {
    id: 3,
    title: "数据驱动，科学管理",
    description: "记录每一次健康数据，洞察身体变化趋势",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop",
  },
  {
    id: 4,
    title: "AI 随时在线，为您答疑解惑",
    description: "智能健康助手，24小时陪伴您的健康之旅",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&h=400&fit=crop",
  },
];

export function HomeCarousel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-xl bg-white/5 animate-pulse" />
    );
  }

  return (
    <div className="w-full">
      <Carousel
        autoplay
        draggable
        dots
        className="home-carousel"
      >
        {carouselItems.map((item) => (
          <div key={item.id}>
            <div
              className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
            >
              {/* 背景图片 */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              {/* 文字内容 */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {item.title}
                </div>
                <div className="text-sm md:text-base lg:text-lg text-white/70">
                  {item.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
