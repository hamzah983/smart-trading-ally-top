
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { useFullscreen } from '@/components/sidebar/useFullscreen';

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Toggle sidebar collapse state
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  // Toggle sidebar visibility
  const toggleVisibility = () => setHidden(!hidden);

  // Auto-hide the sidebar when clicking on it in collapsed mode
  const handleSidebarClick = () => {
    if (collapsed) {
      setHidden(true);
    }
  };

  return (
    <>
      {/* Sidebar overlay to show sidebar when hidden */}
      {hidden && (
        <div 
          className="fixed top-0 left-0 w-8 h-full z-40 cursor-pointer hover:bg-hamzah-200/20 transition-all duration-300" 
          onClick={toggleVisibility}
          title="إظهار القائمة الجانبية"
        />
      )}

      <motion.div 
        initial={{ width: collapsed ? 70 : 250, x: hidden ? '100%' : 0 }}
        animate={{ 
          width: collapsed ? 70 : 250,
          x: hidden ? '100%' : 0,
          opacity: hidden ? 0.9 : 1
        }}
        className={cn(
          "fixed top-0 right-0 h-full bg-hamzah-50 dark:bg-hamzah-900 shadow-md z-50 transition-all duration-300",
          "border-l border-hamzah-200 dark:border-hamzah-700"
        )}
        onClick={handleSidebarClick}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader 
            collapsed={collapsed} 
            toggleSidebar={toggleSidebar}
            toggleVisibility={toggleVisibility}
          />
          
          <SidebarNavigation collapsed={collapsed} />
          
          <SidebarFooter 
            collapsed={collapsed} 
            isFullscreen={isFullscreen} 
            toggleFullscreen={toggleFullscreen} 
          />
        </div>
      </motion.div>

      {/* Add margin to main content when sidebar is visible and not hidden */}
      <div className={cn(
        "transition-all duration-300",
        !hidden ? (collapsed ? "mr-[70px]" : "mr-[250px]") : "mr-0"
      )}>
      </div>
    </>
  );
};
