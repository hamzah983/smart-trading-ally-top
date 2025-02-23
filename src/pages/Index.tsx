import { motion } from "framer-motion";
import { ChevronRight, LineChart, Shield, Zap, TrendingUp, Layers, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tradingPlatforms = [
  { name: "Binance", logo: "🔶" },
  { name: "MetaTrader 5", logo: "📊" },
  { name: "TradingView", logo: "📈" },
  { name: "IQ Option", logo: "💹" },
  { name: "eToro", logo: "🌐" },
  { name: "Robinhood", logo: "🎯" },
];

const Index = () => {
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
            منصة التداول الذكية المتكاملة للمتداولين المحترفين
          </p>
          <Button
            className="glass-morphism hover:scale-105 smooth-transition px-8 py-6 text-lg"
          >
            ابدأ التداول الآن
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
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
                تحليل فني متقدم مع مؤشرات متعددة
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
                تنفيذ تلقائي للصفقات وفق استراتيجيتك
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
                حماية رأس المال مع إدارة مخاطر ذكية
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

        {/* Strategy Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            استراتيجية التداول الذكية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-morphism p-6">
              <TrendingUp className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">تحليل الاتجاه</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                متوسط متحرك 200 نقطة لتحديد الاتجاه العام للسوق
              </p>
            </Card>
            
            <Card className="glass-morphism p-6">
              <Layers className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">نماذج الشموع</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                تحديد نماذج الشموع الانعكاسية مثل Pin Bar و Engulfing
              </p>
            </Card>
            
            <Card className="glass-morphism p-6">
              <ArrowUpDown className="w-8 h-8 mb-4 text-hamzah-600 dark:text-hamzah-300" />
              <h3 className="text-xl font-semibold mb-2">الدعم والمقاومة</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                تحديد آلي لمناطق الدعم والمقاومة لضبط نقاط الدخول والخروج
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Risk Management Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-hamzah-800 dark:text-hamzah-100">
            إدارة المخاطر وتتبع الأداء
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-morphism p-6">
              <div className="text-3xl font-bold mb-2 text-hamzah-600 dark:text-hamzah-300">2%</div>
              <h3 className="text-lg font-medium mb-2">الحد الأقصى للمخاطرة</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                من رأس المال لكل صفقة
              </p>
            </Card>

            <Card className="glass-morphism p-6">
              <div className="text-3xl font-bold mb-2 text-hamzah-600 dark:text-hamzah-300">1:3</div>
              <h3 className="text-lg font-medium mb-2">نسبة المخاطرة/الربح</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                لكل نقطة خسارة 3 نقاط ربح
              </p>
            </Card>

            <Card className="glass-morphism p-6">
              <div className="text-3xl font-bold mb-2 text-hamzah-600 dark:text-hamzah-300">10-15</div>
              <h3 className="text-lg font-medium mb-2">نقاط وقف الخسارة</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                تحت الدعم أو فوق المقاومة
              </p>
            </Card>

            <Card className="glass-morphism p-6">
              <div className="text-3xl font-bold mb-2 text-hamzah-600 dark:text-hamzah-300">24/7</div>
              <h3 className="text-lg font-medium mb-2">تتبع مستمر</h3>
              <p className="text-hamzah-500 dark:text-hamzah-400">
                مراقبة وتحليل أداء الصفقات
              </p>
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
              جاهز لبدء رحلة التداول الاحترافي؟
            </h2>
            <p className="mb-6 text-hamzah-600 dark:text-hamzah-300">
              انضم إلى الآلاف من المتداولين الناجحين الذين يستخدمون Hamzah Trading Pro
            </p>
            <Button className="glass-morphism hover:scale-105 smooth-transition px-8 py-6 text-lg">
              سجل الآن واحصل على نسخة تجريبية
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
