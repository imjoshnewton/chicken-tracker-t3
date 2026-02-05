"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

// Simplified for Next.js 15 compatibility
const MotionDiv = ({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) => {
  return (
    <div className="z-0">
      <motion.div
        initial={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {children as any}
      </motion.div>
    </div>
  );
};

export default MotionDiv;
