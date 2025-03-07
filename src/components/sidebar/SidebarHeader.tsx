
import React from 'react';
import { motion } from 'framer-motion';
import { SidebarToggleButton } from './SidebarToggleButton';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarHeader = ({ collapsed, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-hamzah-200 dark:border-hamzah-700 flex justify-between items-center">
      {!collapsed && (
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold text-hamzah-800 dark:text-hamzah-100 bg-gradient-to-l from-hamzah-500 to-hamzah-700 bg-clip-text text-transparent"
        >
          سمارت تريدنج
        </motion.h2>
      )}
      <SidebarToggleButton collapsed={collapsed} toggleSidebar={toggleSidebar} />
    </div>
  );
};
