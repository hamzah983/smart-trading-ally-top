
import React from 'react';
import { motion } from 'framer-motion';
import { SidebarToggleButton } from './SidebarToggleButton';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  toggleVisibility: () => void;
}

export const SidebarHeader = ({ collapsed, toggleSidebar, toggleVisibility }: SidebarHeaderProps) => {
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
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-hamzah-100 dark:hover:bg-hamzah-800"
          onClick={toggleVisibility}
          title="إخفاء القائمة الجانبية"
        >
          <EyeOff size={20} />
        </Button>
        <SidebarToggleButton collapsed={collapsed} toggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
};
