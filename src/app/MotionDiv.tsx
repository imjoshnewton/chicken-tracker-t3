"use client";

import { motion } from "framer-motion";
import { ReactElement } from "react";

const MotionDiv = ({
  children,
  delay,
}: {
  children: ReactElement;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      className="z-0"
    >
      {children}
    </motion.div>
  );
};

export default MotionDiv;
