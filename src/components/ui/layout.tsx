
import { ReactNode, useEffect } from "react";
import { Navbar } from "./navbar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  // إعداد الوضع المظلم/الفاتح عند بدء التشغيل
  useEffect(() => {
    // تحقق من الوضع المفضل في localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // تطبيق الوضع المظلم حسب التفضيل المحفوظ أو تفضيل النظام
    if (savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        حقوق النشر © {new Date().getFullYear()} Hamzah Trading Pro - جميع الحقوق محفوظة
      </footer>
    </div>
  );
};
