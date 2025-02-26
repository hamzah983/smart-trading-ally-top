
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
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-primary">
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
          {user ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                className="flex items-center space-x-1 rtl:space-x-reverse"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 rtl:space-x-reverse"
                onClick={() => navigate("/profile")}
              >
                <UserCircle className="h-5 w-5" />
                <span>{user.email?.split("@")[0]}</span>
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")}>تسجيل الدخول</Button>
          )}
        </div>

        {/* زر القائمة للشاشات الصغيرة */}
        <div className="md:hidden">
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
                  <Button
                    variant="outline"
                    className="flex items-center space-x-1 rtl:space-x-reverse w-full justify-start"
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
