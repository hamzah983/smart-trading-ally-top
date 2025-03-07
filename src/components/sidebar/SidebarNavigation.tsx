
import React from 'react';
import { Home, BarChart3, Wallet, Bot, LineChart, User } from 'lucide-react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarNavigationProps {
  collapsed: boolean;
}

export const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: 'الرئيسية' },
    { path: '/dashboard', icon: <BarChart3 size={20} />, label: 'لوحة التحكم' },
    { path: '/accounts', icon: <Wallet size={20} />, label: 'الحسابات' },
    { path: '/bots', icon: <Bot size={20} />, label: 'الروبوتات' },
    { path: '/trades', icon: <LineChart size={20} />, label: 'الصفقات' },
    { path: '/profile', icon: <User size={20} />, label: 'الملف الشخصي' },
  ];

  return (
    <div className="flex flex-col flex-grow py-4 overflow-y-auto scrollbar-thin">
      <TooltipProvider delayDuration={300}>
        {menuItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </TooltipProvider>
    </div>
  );
};
