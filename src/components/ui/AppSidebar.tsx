
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { useFullscreen } from '@/components/sidebar/useFullscreen';

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <>
      <motion.div 
        initial={{ width: collapsed ? 70 : 250 }}
        animate={{ width: collapsed ? 70 : 250 }}
        className={cn(
          "fixed top-0 right-0 h-full bg-hamzah-50 dark:bg-hamzah-900 shadow-md z-50 transition-all duration-300",
          "border-l border-hamzah-200 dark:border-hamzah-700"
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader 
            collapsed={collapsed} 
            toggleSidebar={toggleSidebar} 
          />
          
          <SidebarNavigation collapsed={collapsed} />
          
          <SidebarFooter 
            collapsed={collapsed} 
            isFullscreen={isFullscreen} 
            toggleFullscreen={toggleFullscreen} 
          />
        </div>
      </motion.div>

      {/* Add margin to main content when sidebar is expanded */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "mr-[70px]" : "mr-[250px]"
      )}>
      </div>
    </>
  );
};
