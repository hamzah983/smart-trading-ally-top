
import React from 'react';
import { Info, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BotUsageGuide = () => {
  return (
    <div className="bg-white dark:bg-hamzah-800 rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-4">
        <Info className="h-6 w-6 text-blue-500 mr-3" />
        <h2 className="text-xl font-bold text-hamzah-800 dark:text-hamzah-100">دليل استخدام الروبوت الذكي</h2>
      </div>

      <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>ملاحظة هامة</AlertTitle>
        <AlertDescription>
          لتفعيل الروبوت بنجاح، يجب اتباع الخطوات التالية بدقة. التطبيق جاهز للتداول الفعلي حتى بمبالغ صغيرة مثل 3 دولار.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="step1">
          <AccordionTrigger className="text-hamzah-800 dark:text-hamzah-100">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center mr-3">1</div>
              إضافة حساب التداول
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-hamzah-600 dark:text-hamzah-300">
            <div className="space-y-2 mr-9">
              <p>لإضافة حساب تداول جديد:</p>
              <ol className="list-decimal mr-5 space-y-1">
                <li>اضغط على زر "إضافة حساب جديد" في الأعلى.</li>
                <li>أدخل اسم الحساب واختر المنصة (مثل Binance).</li>
                <li>أدخل مفاتيح API الخاصة بك من منصة التداول.</li>
                <li>اختر وضع التداول (حقيقي أو تجريبي).</li>
                <li>اضغط على "إضافة الحساب" للمتابعة.</li>
              </ol>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mt-2">
                <p className="flex items-start">
                  <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>للحصول على مفاتيح API، يرجى زيارة إعدادات حسابك في منصة التداول الخاصة بك وإنشاء مفاتيح API جديدة مع صلاحيات القراءة والتداول.</span>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2">
          <AccordionTrigger className="text-hamzah-800 dark:text-hamzah-100">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center mr-3">2</div>
              إنشاء روبوت ذكي
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-hamzah-600 dark:text-hamzah-300">
            <div className="space-y-2 mr-9">
              <p>لإنشاء روبوت تداول ذكي:</p>
              <ol className="list-decimal mr-5 space-y-1">
                <li>اضغط على زر "إنشاء روبوت ذكي" في الأعلى.</li>
                <li>أدخل اسماً للروبوت واختر الحساب الذي سيتداول عليه.</li>
                <li>حدد مستوى المخاطرة المناسب لك (منخفض، متوسط، مرتفع).</li>
                <li>اختر أزواج العملات التي ترغب في التداول عليها.</li>
                <li>حدد الاستراتيجيات التي يمكن للروبوت استخدامها.</li>
                <li>اضبط إعدادات الإدارة الذكية حسب تفضيلاتك.</li>
                <li>اضغط على "إنشاء الروبوت الذكي" للمتابعة.</li>
              </ol>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mt-2">
                <p className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>للمبالغ الصغيرة (مثل 3 دولار)، يوصى باختيار مستوى مخاطرة منخفض، وتفعيل "الحفاظ على رأس المال" و"تحديد أحجام المراكز تلقائياً". هذا سيساعد على نمو رأس المال تدريجياً وبشكل آمن.</span>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3">
          <AccordionTrigger className="text-hamzah-800 dark:text-hamzah-100">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center mr-3">3</div>
              تشغيل وإدارة الروبوت
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-hamzah-600 dark:text-hamzah-300">
            <div className="space-y-2 mr-9">
              <p>لتشغيل الروبوت ومراقبة أدائه:</p>
              <ol className="list-decimal mr-5 space-y-1">
                <li>بعد إنشاء الروبوت، سيظهر في قائمة الروبوتات مع إعداداته.</li>
                <li>اضغط على زر "تشغيل" للبدء في التداول التلقائي.</li>
                <li>يمكنك متابعة أداء الروبوت وسجل الصفقات من خلال الإحصائيات المعروضة.</li>
                <li>يمكنك تعديل إعدادات الروبوت في أي وقت عن طريق الضغط على زر "الإعدادات".</li>
                <li>لإيقاف الروبوت مؤقتاً، اضغط على زر "إيقاف".</li>
              </ol>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md mt-2">
                <p className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 ml-2 flex-shrink-0" />
                  <span>ينصح بمراقبة أداء الروبوت في الأيام الأولى للتأكد من أن الإعدادات مناسبة لظروف السوق الحالية.</span>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4">
          <AccordionTrigger className="text-hamzah-800 dark:text-hamzah-100">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center mr-3">4</div>
              نصائح لتعظيم الأرباح
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-hamzah-600 dark:text-hamzah-300">
            <div className="space-y-2 mr-9">
              <p>لتحقيق أفضل النتائج مع الروبوت الذكي:</p>
              <ul className="list-disc mr-5 space-y-1">
                <li>ابدأ بمستوى مخاطرة منخفض حتى تتعرف على أداء الروبوت.</li>
                <li>اختر مجموعة متنوعة من أزواج العملات لتقليل المخاطر.</li>
                <li>فعّل خاصية "إعادة استثمار الأرباح" لتنمية رأس المال بشكل تراكمي.</li>
                <li>اضبط الحد الأقصى للصفقات اليومية بناءً على حجم رأس المال (للمبالغ الصغيرة مثل 3 دولار، يفضل 1-3 صفقات يومياً).</li>
                <li>راقب أداء الاستراتيجيات المختلفة وقم بتفعيل الاستراتيجيات الأكثر ربحية فقط.</li>
                <li>تجنب تغيير الإعدادات بشكل متكرر، امنح الروبوت وقتاً كافياً للتكيف مع ظروف السوق.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BotUsageGuide;
