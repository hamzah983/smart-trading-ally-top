
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemProps {
  path: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

export const SidebarNavItem = ({ path, icon, label, collapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={path}
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 text-hamzah-600 dark:text-hamzah-300 hover:bg-hamzah-100 dark:hover:bg-hamzah-800 transition-colors relative group",
            isActive && "bg-hamzah-100 dark:bg-hamzah-800 text-hamzah-800 dark:text-hamzah-100 font-medium border-r-4 border-hamzah-400"
          )}
        >
          <span className={cn(
            "ml-3 transition-all",
            isActive && "text-hamzah-600 dark:text-hamzah-300"
          )}>
            {icon}
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="mr-3"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && isActive && (
            <motion.div 
              layoutId="activeIndicator"
              className="absolute right-0 top-0 h-full w-1 bg-hamzah-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </NavLink>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="left">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
