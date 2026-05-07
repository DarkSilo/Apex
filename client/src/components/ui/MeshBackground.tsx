"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 mesh-bg">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-brand-500 rounded-full blur-[140px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-success-600 rounded-full blur-[120px]"
      />
      <div className="absolute inset-0 bg-surface-950/20 backdrop-blur-[2px]" />
    </div>
  );
}
