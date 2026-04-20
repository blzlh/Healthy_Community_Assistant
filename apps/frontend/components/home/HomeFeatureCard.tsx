"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface HomeFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  index: number;
}

export function HomeFeatureCard({ title, description, icon, href, index }: HomeFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={href}
        className="group relative p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all text-white no-underline block"
      >
        <span className="absolute top-6 right-6 text-xs font-mono text-white/20">
          0{index + 1}
        </span>
        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-white/20 transition-colors">
          <Icon icon={icon} className="h-6 w-6 text-white/80 transition-transform duration-300 group-hover:scale-125" />
        </div>
        <div className="text-xl font-semibold mb-2 flex items-center gap-2 text-white">
          {title}
          <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1">
            <Icon
              icon="material-symbols:arrow-forward"
              className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors"
            />
          </span>
        </div>
        <div className="text-white/50 leading-relaxed">{description}</div>
      </Link>
    </motion.div>
  );
}
