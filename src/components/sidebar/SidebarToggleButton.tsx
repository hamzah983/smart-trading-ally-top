
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarToggleButtonProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarToggleButton = ({ collapsed, toggleSidebar }: SidebarToggleButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="hover:bg-hamzah-100 dark:hover:bg-hamzah-800" 
      onClick={(e) => {
        e.stopPropagation(); // Prevent sidebar click event from firing
        toggleSidebar();
      }}
      title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
    >
      {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </Button>
  );
};
