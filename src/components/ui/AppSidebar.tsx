
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart3, Wallet, Bot, LineChart, User, Maximize, Minimize, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
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
              <h2 className="text-lg font-bold text-hamzah-800 dark:text-hamzah-100">
                سمارت تريدنج
              </h2>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={toggleSidebar}
            >
              {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          </div>

          <div className="flex flex-col flex-grow py-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center py-3 px-4 text-hamzah-600 dark:text-hamzah-300 hover:bg-hamzah-100 dark:hover:bg-hamzah-800 transition-colors",
                  isActive && "bg-hamzah-100 dark:bg-hamzah-800 text-hamzah-800 dark:text-hamzah-100 font-medium border-r-4 border-hamzah-400"
                )}
              >
                <span className="ml-3">{item.icon}</span>
                {!collapsed && <span className="mr-3">{item.label}</span>}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-hamzah-200 dark:border-hamzah-700">
            <Button 
              variant="ghost" 
              size={collapsed ? "icon" : "default"} 
              className="w-full justify-start" 
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 
                <>
                  <Minimize size={20} />
                  {!collapsed && <span className="mr-3">تصغير الشاشة</span>}
                </> : 
                <>
                  <Maximize size={20} />
                  {!collapsed && <span className="mr-3">تكبير الشاشة</span>}
                </>
              }
            </Button>
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
