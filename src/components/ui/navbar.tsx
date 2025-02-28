
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { 
  LayoutDashboard,
  CreditCard,
  LineChart,
  Settings,
  ChevronDown,
  LogOut,
  UserCircle,
  Menu,
  X,
  BrainCircuit,
  Zap,
  Bell,
  Moon,
  Sun
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, read: boolean}[]>([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // جلب الإشعارات - هذا مثال فقط
    if (user) {
      // يمكن استبدال هذا بالجلب من قاعدة البيانات
      setNotifications([
        { id: '1', message: 'تم إضافة حساب جديد بنجاح', read: false },
        { id: '2', message: 'تم إكمال صفقة بربح 125$', read: false },
      ]);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الخروج",
        description: error.message,
      });
    } else {
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      navigate("/");
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // تحديث السمة في localStorage وعلى العنصر الجذر
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    {
      name: "لوحة التحكم",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "الحسابات",
      path: "/accounts",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "التداول",
      path: "/trades",
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      name: "الروبوتات",
      path: "/bots",
      icon: <BrainCircuit className="h-5 w-5" />,
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // لا نظهر القائمة في صفحة الرئيسية أو صفحة تسجيل الدخول
  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-primary flex items-center">
            <Zap className="h-6 w-6 mr-2 text-primary" />
            Hamzah Trading Pro
          </Link>
        </div>

        {/* القائمة للشاشات الكبيرة */}
        <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* أزرار المستخدم للشاشات الكبيرة */}
        <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
          {/* زر الوضع المظلم / الفاتح */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{darkMode ? 'الوضع الفاتح' : 'الوضع المظلم'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* الإشعارات */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px]"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between py-2 px-4 border-b">
                      <h3 className="font-medium">الإشعارات</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-8">
                          تعليم الكل كمقروء
                        </Button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto py-1">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <DropdownMenuItem key={notification.id} className="p-3 flex flex-col items-start cursor-pointer">
                            <div className="flex w-full">
                              <span className="text-sm flex-1">{notification.message}</span>
                              {!notification.read && (
                                <Badge variant="success" className="ml-2 rtl:mr-2">جديد</Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 mt-1">منذ 5 دقائق</span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          <p>لا توجد إشعارات</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="border-t py-2 px-4 text-center">
                        <Link to="/notifications" className="text-primary text-sm hover:underline">
                          عرض كل الإشعارات
                        </Link>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>الإشعارات</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {user ? (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1 rtl:space-x-reverse px-3"
                  >
                    <UserCircle className="h-6 w-6 text-primary" />
                    <span className="font-medium">{user.email?.split("@")[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="h-4 w-4 mr-2 rtl:ml-2" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 mr-2 rtl:ml-2" />
                    <span>الإعدادات</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2 rtl:ml-2" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")}>تسجيل الدخول</Button>
          )}
        </div>

        {/* زر القائمة للشاشات الصغيرة */}
        <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
          {/* زر الوضع المظلم / الفاتح */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* الإشعارات للموبايل */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="py-2 px-4 border-b font-medium">الإشعارات</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <DropdownMenuItem key={notification.id} className="p-3 flex flex-col items-start">
                      <div className="flex w-full">
                        <span className="text-sm flex-1">{notification.message}</span>
                        {!notification.read && (
                          <Badge variant="success" className="ml-2 rtl:mr-2">جديد</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">منذ 5 دقائق</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p>لا توجد إشعارات</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* القائمة المنسدلة للشاشات الصغيرة */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-md">
          <div className="container mx-auto py-2 px-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={toggleMenu}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={toggleMenu}
                  >
                    <UserCircle className="h-5 w-5" />
                    <span>الملف الشخصي</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={toggleMenu}
                  >
                    <Settings className="h-5 w-5" />
                    <span>الإعدادات</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-1 rtl:space-x-reverse w-full justify-start mt-2"
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
