'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * RootTemplate wraps route pages in a gentle, high-performance entrance transition.
 * App Router unmounts and remounts template.tsx on route switches, ensuring silky-smooth
 * transitions between pages without layout shifts or stacking context conflicts.
 */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex-1 flex flex-col w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

