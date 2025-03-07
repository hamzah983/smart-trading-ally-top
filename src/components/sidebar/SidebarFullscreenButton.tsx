
import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

interface SidebarFullscreenButtonProps {
  collapsed: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const SidebarFullscreenButton = ({ 
  collapsed, 
  isFullscreen, 
  toggleFullscreen 
}: SidebarFullscreenButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size={collapsed ? "icon" : "default"} 
            className="w-full justify-start hover:bg-hamzah-100 dark:hover:bg-hamzah-800" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize size={20} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mr-3"
                    >
                      تصغير الشاشة
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <Maximize size={20} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mr-3"
                    >
                      تكبير الشاشة
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </Button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="left">
            {isFullscreen ? "تصغير الشاشة" : "تكبير الشاشة"}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
