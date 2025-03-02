
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, User, Settings, Shield, Bell, Moon, Sun, 
  Languages, DollarSign, Smartphone, LogOut
} from "lucide-react";
import { supabase, resetSupabaseHeaders } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("Binance");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchSupportedPlatforms();
    // Check if dark mode is enabled
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      resetSupabaseHeaders();
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول للوصول إلى ملفك الشخصي"
        });
        setLoading(false);
        return;
      }
      
      const userData = sessionData.session.user;
      setUser(userData);
      
      // Fetch user profile if it exists
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
        
      if (profileData) {
        setDisplayName(profileData.display_name || userData.email?.split('@')[0] || '');
      } else {
        setDisplayName(userData.email?.split('@')[0] || '');
      }
      
      setEmail(userData.email || '');
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب بيانات المستخدم",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportedPlatforms = async () => {
    try {
      resetSupabaseHeaders();
      // Fetch supported trading platforms
      const { data } = await supabase
        .from('trading_platforms')
        .select('name')
        .eq('is_active', true);
        
      if (data && data.length > 0) {
        setPlatforms(data.map(p => p.name));
      } else {
        // Default platforms if none found in the database
        setPlatforms(['Binance', 'Bybit', 'KuCoin', 'MT4', 'MT5']);
      }
    } catch (error) {
      console.error("Error fetching platforms:", error);
      // Default platforms in case of error
      setPlatforms(['Binance', 'Bybit', 'KuCoin', 'MT4', 'MT5']);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      resetSupabaseHeaders();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "خطأ في تحديث الملف الشخصي",
          description: "المستخدم غير مسجل الدخول"
        });
        return;
      }
      
      // Update or insert profile data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم تحديث بيانات الملف الشخصي بنجاح"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الملف الشخصي",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTradingPlatform = async () => {
    try {
      if (!selectedPlatform) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يرجى اختيار منصة تداول"
        });
        return;
      }
      
      // Navigate to accounts page with selected platform
      window.location.href = `/accounts?platform=${selectedPlatform}`;
    } catch (error: any) {
      console.error("Error navigating to accounts:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message
      });
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: newDarkMode ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع الفاتح",
      description: "تم تغيير مظهر التطبيق بنجاح"
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الخروج",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-hamzah-800 dark:text-hamzah-100">
            الملف الشخصي والإعدادات
          </h1>
          <p className="text-hamzah-600 dark:text-hamzah-300">
            إدارة حسابك الشخصي وإعدادات التطبيق
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-hamzah-600 dark:text-hamzah-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="glass-morphism p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback className="bg-hamzah-500 text-white text-2xl">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                      {displayName || 'المستخدم'}
                    </h2>
                    <p className="text-hamzah-600 dark:text-hamzah-300 mt-1">
                      {email}
                    </p>
                    
                    <div className="w-full mt-6 space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => document.getElementById('account-tab')?.click()}
                      >
                        <User className="ml-2 h-4 w-4" />
                        الحساب الشخصي
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => document.getElementById('trading-tab')?.click()}
                      >
                        <DollarSign className="ml-2 h-4 w-4" />
                        منصات التداول
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => document.getElementById('preferences-tab')?.click()}
                      >
                        <Settings className="ml-2 h-4 w-4" />
                        التفضيلات
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => document.getElementById('security-tab')?.click()}
                      >
                        <Shield className="ml-2 h-4 w-4" />
                        الأمان
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start mt-4"
                        onClick={handleLogout}
                      >
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
            
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="glass-morphism p-6">
                  <Tabs defaultValue="account">
                    <TabsList className="mb-6">
                      <TabsTrigger value="account" id="account-tab">الحساب</TabsTrigger>
                      <TabsTrigger value="trading" id="trading-tab">منصات التداول</TabsTrigger>
                      <TabsTrigger value="preferences" id="preferences-tab">التفضيلات</TabsTrigger>
                      <TabsTrigger value="security" id="security-tab">الأمان</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="account">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                          معلومات الحساب
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="display-name">اسم العرض</Label>
                            <Input 
                              id="display-name" 
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="أدخل اسم العرض"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input 
                              id="email" 
                              value={email}
                              disabled
                              readOnly
                              className="bg-hamzah-100 dark:bg-hamzah-800"
                            />
                            <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                              لا يمكن تغيير البريد الإلكتروني
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={isSaving}
                          className="mt-4"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري الحفظ...
                            </>
                          ) : "حفظ التغييرات"}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="trading">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                          منصات التداول
                        </h3>
                        
                        <Alert>
                          <AlertTitle className="font-bold">معلومات حول منصات التداول</AlertTitle>
                          <AlertDescription>
                            يمكنك ربط حسابات التداول الخاصة بك من خلال إضافة مفاتيح API للمنصات المدعومة.
                            اختر المنصة التي ترغب في إضافتها أدناه.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="platform">اختر منصة التداول</Label>
                            <select 
                              id="platform"
                              className="flex h-10 w-full rounded-md border border-hamzah-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hamzah-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={selectedPlatform}
                              onChange={(e) => setSelectedPlatform(e.target.value)}
                            >
                              {platforms.map((platform) => (
                                <option key={platform} value={platform}>{platform}</option>
                              ))}
                            </select>
                          </div>
                          
                          <Button 
                            onClick={handleAddTradingPlatform}
                            className="mt-2"
                          >
                            إضافة منصة التداول
                          </Button>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-hamzah-200 dark:border-hamzah-700">
                          <h4 className="font-medium text-hamzah-800 dark:text-hamzah-100 mb-2">
                            المنصات المتصلة
                          </h4>
                          <p className="text-hamzah-600 dark:text-hamzah-400 text-sm">
                            يمكنك إدارة منصات التداول المتصلة من صفحة حسابات التداول
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => window.location.href = '/accounts'}
                          >
                            إدارة منصات التداول
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preferences">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                          تفضيلات التطبيق
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">الوضع الداكن</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                تفعيل الوضع الداكن للتطبيق
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Sun className="h-4 w-4 ml-2 text-hamzah-500" />
                              <Switch
                                checked={isDarkMode}
                                onCheckedChange={toggleDarkMode}
                              />
                              <Moon className="h-4 w-4 mr-2 text-hamzah-500" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">الإشعارات</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                تلقي إشعارات عن الصفقات وتحديثات الحساب
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">اللغة</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                اختر لغة التطبيق المفضلة
                              </p>
                            </div>
                            <select
                              className="flex h-9 rounded-md border border-hamzah-200 bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-hamzah-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              defaultValue="ar"
                            >
                              <option value="ar">العربية</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="security">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                          إعدادات الأمان
                        </h3>
                        
                        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                          <AlertTitle className="font-bold text-yellow-800 dark:text-yellow-200">
                            أمان الحساب
                          </AlertTitle>
                          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                            تأكد من حماية حسابك باستخدام كلمة مرور قوية واستخدام المصادقة الثنائية.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-6 mt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">تغيير كلمة المرور</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                قم بتغيير كلمة المرور الخاصة بك بشكل دوري
                              </p>
                            </div>
                            <Button variant="outline">
                              تغيير كلمة المرور
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">المصادقة الثنائية</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                زيادة أمان حسابك باستخدام المصادقة الثنائية
                              </p>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">إشعارات الأمان</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                تلقي إشعارات عند تسجيل الدخول من جهاز جديد
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
