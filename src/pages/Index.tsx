
import { motion } from "framer-motion";
import { ChevronRight, Shield, Zap, TrendingUp, Layers, ArrowUpDown, Users, LineChart, Brain, BookOpen, BarChart4, Award, Target, DollarSign, CreditCard, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const tradingPlatforms = [
  { name: "Binance", logo: "🔶" },
  { name: "MetaTrader 5", logo: "📊" },
  { name: "TradingView", logo: "📈" },
  { name: "IQ Option", logo: "💹" },
  { name: "eToro", logo: "🌐" },
  { name: "Robinhood", logo: "🎯" },
];

const successFactors = [
  { 
    icon: <Brain className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "المعرفة والخبرة",
    description: "دورات تعليمية متكاملة وتحليلات مباشرة من خبراء السوق"
  },
  { 
    icon: <Shield className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "إدارة المخاطر",
    description: "أدوات متقدمة لحماية رأس المال وتحديد المخاطر لكل صفقة"
  },
  { 
    icon: <CreditCard className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "رأس المال المناسب",
    description: "خطط استثمارية متنوعة تناسب حجم رأس المال المتاح لديك"
  },
  { 
    icon: <Target className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "الصبر والانضباط",
    description: "أدوات لمراقبة الأداء النفسي والالتزام بالخطة الاستثمارية"
  },
  { 
    icon: <BarChart4 className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "تحليل السوق",
    description: "تحليل فني وأساسي متقدم مع مؤشرات ذكية للتنبؤ بحركة السوق"
  },
  { 
    icon: <BookOpen className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "التعلم المستمر",
    description: "مكتبة متكاملة وتحديثات يومية لأحدث استراتيجيات التداول"
  }
];

const wealthBuildingTools = [
  {
    icon: <Calculator className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "حاسبة المخاطر والأرباح",
    description: "احسب العائد المتوقع والمخاطر المحتملة لكل صفقة"
  },
  {
    icon: <DollarSign className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "مضاعفة رأس المال",
    description: "استراتيجيات مثبتة لتنمية رأس المال بشكل تدريجي وآمن"
  },
  {
    icon: <Award className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "محاكاة الأسواق",
    description: "اختبر استراتيجياتك على بيانات تاريخية قبل المخاطرة بأموال حقيقية"
  },
  {
    icon: <TrendingUp className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />,
    title: "فرص استثمارية",
    description: "تنبيهات للفرص الاستثنائية في السوق بناءً على تحليل البيانات الضخمة"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hamzah-50 to-hamzah-100 dark:from-hamzah-900 dark:to-hamzah-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-hamzah-900 to-hamzah-600 dark:from-hamzah-100 dark:to-hamzah-300">
            Hamzah Trading Pro
          </h1>
          <p className="text-lg md:text-xl text-hamzah-600 dark:text-hamzah-300 mb-8 max-w-2xl mx-auto">
            نظام التداول الذكي المتكامل الذي يساعدك على بناء ثروتك خطوة بخطوة
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="glass-morphism hover:scale-105 smooth-transition px-8 py-6 text-lg"
              onClick={handleGetStarted}
            >
              ابدأ رحلة الثراء الآن
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            {isLoggedIn && (
              <Button
                variant="outline"
                className="glass-morphism hover:scale-105 smooth-transition px-8 py-6 text-lg"
                onClick={() => navigate('/dashboard')}
              >
                لوحة التحكم
                <LineChart className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* عوامل النجاح */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            العوامل المهمة لبناء الثروة من خلال التداول
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successFactors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="glass-morphism p-6 text-center h-full hover:scale-105 smooth-transition flex flex-col">
                  {factor.icon}
                  <h3 className="text-xl font-semibold mb-2">{factor.title}</h3>
                  <p className="text-hamzah-500 dark:text-hamzah-400 flex-grow">
                    {factor.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Cards for Quick Access */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <Card 
              className="glass-morphism p-6 text-center hover:scale-105 smooth-transition cursor-pointer"
              onClick={() => navigate('/accounts')}
            >
              <Users className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">إدارة الحسابات</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                إضافة وإدارة حسابات التداول الخاصة بك
              </p>
            </Card>
            
            <Card 
              className="glass-morphism p-6 text-center hover:scale-105 smooth-transition cursor-pointer"
              onClick={() => navigate('/trades')}
            >
              <LineChart className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">تنفيذ الصفقات</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                فتح وإدارة الصفقات بطريقة ذكية
              </p>
            </Card>
            
            <Card 
              className="glass-morphism p-6 text-center hover:scale-105 smooth-transition cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">تحليل الأداء</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                تحليل وتتبع أداء محفظتك الاستثمارية
              </p>
            </Card>
          </motion.div>
        )}

        {/* أدوات بناء الثروة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            أدوات بناء الثروة المتكاملة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wealthBuildingTools.map((tool, index) => (
              <Card key={index} className="glass-morphism p-6 h-full">
                {tool.icon}
                <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
                <p className="text-hamzah-500 dark:text-hamzah-400">
                  {tool.description}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-morphism p-6 text-center hover:scale-105 smooth-transition">
              <Zap className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">تحليل ذكي</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                تحليل فني متقدم مع مؤشرات متعددة لزيادة فرص النجاح
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-morphism p-6 text-center hover:scale-105 smooth-transition">
              <LineChart className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">تداول آلي</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                تنفيذ تلقائي للصفقات وفق استراتيجيتك لمضاعفة العوائد
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-morphism p-6 text-center hover:scale-105 smooth-transition">
              <Shield className="w-12 h-12 mx-auto mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">إدارة المخاطر</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                حماية رأس المال مع إدارة مخاطر ذكية لنمو مستدام
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Trading Platforms Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            منصات التداول المدعومة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tradingPlatforms.map((platform) => (
              <Card 
                key={platform.name}
                className="glass-morphism p-4 text-center hover:scale-105 smooth-transition cursor-pointer"
              >
                <div className="text-4xl mb-2">{platform.logo}</div>
                <h3 className="font-medium text-hamzah-700 dark:text-hamzah-200">
                  {platform.name}
                </h3>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* قصص نجاح */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            قصص نجاح حقيقية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-morphism p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  م.أ
                </div>
              </div>
              <p className="text-hamzah-500 dark:text-hamzah-400 mb-4 italic">
                "بدأت بمبلغ 5000 دولار فقط، وباستخدام استراتيجيات إدارة المخاطر تمكنت من تنمية محفظتي إلى 45,000 دولار خلال سنة واحدة."
              </p>
              <p className="font-medium text-hamzah-700 dark:text-hamzah-200 text-right">
                - محمد، الرياض
              </p>
            </Card>
            
            <Card className="glass-morphism p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  س.م
                </div>
              </div>
              <p className="text-hamzah-500 dark:text-hamzah-400 mb-4 italic">
                "النظام الآلي ساعدني على تنفيذ الصفقات بدقة وبدون عواطف. خلال 6 أشهر حققت عائد بنسبة 32% على استثماراتي."
              </p>
              <p className="font-medium text-hamzah-700 dark:text-hamzah-200 text-right">
                - سارة، دبي
              </p>
            </Card>
            
            <Card className="glass-morphism p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  أ.ع
                </div>
              </div>
              <p className="text-hamzah-500 dark:text-hamzah-400 mb-4 italic">
                "أدوات التحليل الفني المتقدمة ساعدتني على اكتشاف فرص استثمارية لم أكن لأراها. أصبحت الآن متداول بدوام كامل."
              </p>
              <p className="font-medium text-hamzah-700 dark:text-hamzah-200 text-right">
                - أحمد، القاهرة
              </p>
            </Card>
          </div>
        </motion.div>

        {/* نمو الاستثمار */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            كيف تنمو استثماراتك مع خطط النمو المدروسة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-morphism p-6 border-t-4 border-blue-500">
              <h3 className="text-xl font-semibold mb-4 text-center">المستوى الأول: البداية</h3>
              <ul className="space-y-2 text-hamzah-600 dark:text-hamzah-300">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  رأس مال صغير (1000$-5000$)
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  مخاطرة 1% من المحفظة لكل صفقة
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  نمو شهري مستهدف 5-7%
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  التركيز على التعلم وبناء الخبرة
                </li>
              </ul>
            </Card>
            
            <Card className="glass-morphism p-6 border-t-4 border-purple-500">
              <h3 className="text-xl font-semibold mb-4 text-center">المستوى الثاني: النمو</h3>
              <ul className="space-y-2 text-hamzah-600 dark:text-hamzah-300">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  رأس مال متوسط (5000$-20000$)
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  مخاطرة 1.5% من المحفظة لكل صفقة
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  نمو شهري مستهدف 7-10%
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  تنويع الاستراتيجيات والأصول
                </li>
              </ul>
            </Card>
            
            <Card className="glass-morphism p-6 border-t-4 border-yellow-500">
              <h3 className="text-xl font-semibold mb-4 text-center">المستوى الثالث: الثروة</h3>
              <ul className="space-y-2 text-hamzah-600 dark:text-hamzah-300">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  رأس مال كبير (أكثر من 20000$)
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  مخاطرة 2% من المحفظة لكل صفقة
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  نمو شهري مستهدف 10-15%
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-green-500">✓</div>
                  استخدام الرافعة المالية بحكمة
                </li>
              </ul>
            </Card>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <Card className="glass-morphism p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-hamzah-800 dark:text-hamzah-100">
              جاهز لبدء رحلة بناء ثروتك؟
            </h2>
            <p className="mb-6 text-hamzah-600 dark:text-hamzah-300">
              انضم إلى الآلاف من المتداولين الناجحين الذين حققوا استقلالهم المالي مع Hamzah Trading Pro
            </p>
            <Button 
              className="glass-morphism hover:scale-105 smooth-transition px-8 py-6 text-lg"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? 'انتقل إلى لوحة التحكم' : 'ابدأ رحلة الثراء الآن'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
