
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, Wallet, Bot, LineChart, User, Maximize, Minimize, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  // Check if fullscreen is active on component mount and when document changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
          toast({
            title: "تم تكبير الشاشة",
            description: "اضغط ESC للخروج من وضع ملء الشاشة"
          });
        }).catch(err => {
          console.error("Error attempting to enable fullscreen:", err);
          toast({
            variant: "destructive",
            title: "تعذر تكبير الشاشة",
            description: "قد يكون متصفحك لا يدعم وضع ملء الشاشة أو تم رفض الإذن"
          });
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            setIsFullscreen(false);
            toast({
              title: "تم تصغير الشاشة",
              description: "تم الخروج من وضع ملء الشاشة"
            });
          });
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تغيير وضع الشاشة",
        description: "حدث خطأ أثناء محاولة تغيير وضع الشاشة"
      });
    }
  };

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: 'الرئيسية' },
    { path: '/dashboard', icon: <BarChart3 size={20} />, label: 'لوحة التحكم' },
    { path: '/accounts', icon: <Wallet size={20} />, label: 'الحسابات' },
    { path: '/bots', icon: <Bot size={20} />, label: 'الروبوتات' },
    { path: '/trades', icon: <LineChart size={20} />, label: 'الصفقات' },
    { path: '/profile', icon: <User size={20} />, label: 'الملف الشخصي' },
  ];

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
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto hover:bg-hamzah-100 dark:hover:bg-hamzah-800" 
              onClick={toggleSidebar}
            >
              {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          </div>

          <div className="flex flex-col flex-grow py-4 overflow-y-auto scrollbar-thin">
            <TooltipProvider delayDuration={300}>
              {menuItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => cn(
                        "flex items-center py-3 px-4 text-hamzah-600 dark:text-hamzah-300 hover:bg-hamzah-100 dark:hover:bg-hamzah-800 transition-colors relative group",
                        isActive && "bg-hamzah-100 dark:bg-hamzah-800 text-hamzah-800 dark:text-hamzah-100 font-medium border-r-4 border-hamzah-400"
                      )}
                    >
                      <span className={cn(
                        "ml-3 transition-all",
                        location.pathname === item.path && "text-hamzah-600 dark:text-hamzah-300"
                      )}>
                        {item.icon}
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
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {collapsed && location.pathname === item.path && (
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
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          <div className="p-4 border-t border-hamzah-200 dark:border-hamzah-700">
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
          </div>
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
