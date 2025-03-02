
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogOut, Moon, Sun, User, Shield, Key, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([
    "Binance", "Bybit", "KuCoin", "MT4", "MT5"
  ]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          variant: "destructive",
          title: "جلسة غير صالحة",
          description: "الرجاء تسجيل الدخول للوصول إلى ملفك الشخصي"
        });
        navigate('/auth');
        return;
      }
      
      setUser(sessionData.session.user);
      setEmail(sessionData.session.user.email || "");
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - we'll handle this by creating a profile
        console.error("Error fetching profile:", profileError);
        toast({
          variant: "destructive",
          title: "خطأ في جلب الملف الشخصي",
          description: profileError.message
        });
      }
      
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.full_name || "");
      } else {
        // Create a new profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: sessionData.session.user.id,
            full_name: sessionData.session.user.user_metadata?.full_name || "",
            avatar_url: "",
            settings: {}
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating profile:", createError);
          toast({
            variant: "destructive",
            title: "خطأ في إنشاء الملف الشخصي",
            description: createError.message
          });
        } else if (newProfile) {
          setProfile(newProfile);
          setDisplayName(newProfile.full_name || "");
        }
      }
      
      // Fetch trading platforms
      const { data: accountsData } = await supabase
        .from('trading_accounts')
        .select('platform')
        .eq('user_id', sessionData.session.user.id);
        
      if (accountsData) {
        // Get unique platforms the user has accounts with
        const userPlatforms = [...new Set(accountsData.map(acc => acc.platform))];
        if (userPlatforms.length > 0) {
          // Update platforms list with user's connected platforms first
          const remainingPlatforms = platforms.filter(p => !userPlatforms.includes(p));
          setPlatforms([...userPlatforms, ...remainingPlatforms]);
        }
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الملف الشخصي",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user) return;
      
      setIsSaving(true);
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: displayName
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح"
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الملف الشخصي",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Update the document class
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: newMode ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع الفاتح",
      description: "تم تغيير مظهر التطبيق بنجاح"
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل الخروج بنجاح"
      });
      
      navigate('/auth');
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الخروج",
        description: error.message
      });
    }
  };

  const handleConnectPlatform = (platform: string) => {
    navigate(`/accounts?platform=${platform}`);
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
            الملف الشخصي
          </h1>
          <p className="text-hamzah-600 dark:text-hamzah-300">
            إدارة حسابك وإعدادات التطبيق
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-hamzah-600 dark:text-hamzah-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-morphism h-full">
                  <CardHeader className="pb-2">
                    <CardTitle>معلومات الحساب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-hamzah-300 dark:bg-hamzah-700 text-2xl">
                          {displayName ? displayName[0].toUpperCase() : <User />}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mb-4">
                        <Upload className="h-4 w-4 ml-2" />
                        تغيير الصورة
                      </Button>
                      <h2 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">
                        {displayName || "المستخدم"}
                      </h2>
                      <p className="text-hamzah-600 dark:text-hamzah-300 text-sm">
                        {email}
                      </p>
                      
                      <Button 
                        variant="destructive" 
                        className="mt-6 w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 ml-2" />
                        تسجيل الخروج
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-morphism">
                  <CardHeader className="pb-2">
                    <CardTitle>الإعدادات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="profile">
                      <TabsList className="mb-4">
                        <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
                        <TabsTrigger value="appearance">المظهر</TabsTrigger>
                        <TabsTrigger value="platforms">منصات التداول</TabsTrigger>
                        <TabsTrigger value="security">الأمان</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="profile">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="display-name">الاسم الظاهر</Label>
                            <Input 
                              id="display-name" 
                              placeholder="أدخل اسمك" 
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input 
                              id="email" 
                              type="email"
                              placeholder="أدخل بريدك الإلكتروني" 
                              value={email}
                              readOnly
                            />
                            <p className="text-xs text-hamzah-500 dark:text-hamzah-400">
                              لا يمكن تغيير البريد الإلكتروني حاليًا
                            </p>
                          </div>
                          
                          <Button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="mt-2"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الحفظ...
                              </>
                            ) : "حفظ التغييرات"}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="appearance">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">الوضع الداكن</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                تبديل بين المظهر الفاتح والداكن
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Sun className="h-4 w-4 text-hamzah-500 dark:text-hamzah-400" />
                              <Switch 
                                checked={isDarkMode}
                                onCheckedChange={handleToggleDarkMode}
                              />
                              <Moon className="h-4 w-4 text-hamzah-500 dark:text-hamzah-400" />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">اتجاه القراءة</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                اتجاه النصوص والعناصر
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <select 
                                className="flex h-9 w-full rounded-md border border-hamzah-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-hamzah-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hamzah-400 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue="rtl"
                              >
                                <option value="rtl">من اليمين إلى اليسار (RTL)</option>
                                <option value="ltr">من اليسار إلى اليمين (LTR)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="platforms">
                        <div className="space-y-4">
                          <p className="text-sm text-hamzah-600 dark:text-hamzah-300">
                            قم بربط منصات التداول المختلفة بحسابك لبدء التداول الآلي
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {platforms.map((platform) => (
                              <Card key={platform} className="overflow-hidden">
                                <div className="p-4 flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium">{platform}</h3>
                                    <p className="text-xs text-hamzah-500 dark:text-hamzah-400">
                                      ربط منصة {platform} بحسابك
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleConnectPlatform(platform)}
                                  >
                                    ربط
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="security">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-base">تأمين الحساب</Label>
                              <p className="text-sm text-hamzah-500 dark:text-hamzah-400">
                                طلب التحقق لإجراء تغييرات على الحساب
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <Separator />
                          
                          <Button variant="outline" className="flex items-center">
                            <Key className="mr-2 h-4 w-4" />
                            تغيير كلمة المرور
                          </Button>
                          
                          <Button variant="outline" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            تفعيل المصادقة الثنائية
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
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
