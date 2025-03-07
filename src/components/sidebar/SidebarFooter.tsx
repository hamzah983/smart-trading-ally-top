
import React from 'react';
import { SidebarFullscreenButton } from './SidebarFullscreenButton';

interface SidebarFooterProps {
  collapsed: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const SidebarFooter = ({ 
  collapsed, 
  isFullscreen, 
  toggleFullscreen 
}: SidebarFooterProps) => {
  return (
    <div className="p-4 border-t border-hamzah-200 dark:border-hamzah-700">
      <SidebarFullscreenButton 
        collapsed={collapsed} 
        isFullscreen={isFullscreen} 
        toggleFullscreen={toggleFullscreen} 
      />
    </div>
  );
};
