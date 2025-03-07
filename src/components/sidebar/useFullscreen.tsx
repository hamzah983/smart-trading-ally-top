
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
          toast({
            title: "تم تكبير الشاشة",
            description: "اضغط ESC للخروج من وضع ملء الشاشة"
          });
        }).catch(err => {
          console.error("Error attempting to enable fullscreen:", err);
          toast({
            variant: "destructive",
            title: "تعذر تكبير الشاشة",
            description: "قد يكون متصفحك لا يدعم وضع ملء الشاشة أو تم رفض الإذن"
          });
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            setIsFullscreen(false);
            toast({
              title: "تم تصغير الشاشة",
              description: "تم الخروج من وضع ملء الشاشة"
            });
          });
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تغيير وضع الشاشة",
        description: "حدث خطأ أثناء محاولة تغيير وضع الشاشة"
      });
    }
  };

  return { isFullscreen, toggleFullscreen };
}
