
import { motion } from "framer-motion";
import { ChevronRight, LineChart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      </div>
    </div>
  );
};

export default Index;
