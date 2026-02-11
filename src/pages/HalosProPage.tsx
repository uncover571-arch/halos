import { motion } from 'framer-motion';
import { Shield, Sparkles, TrendingDown, PiggyBank, BarChart3, Bell, Zap, Check, Crown, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const features = [
  { icon: Shield, title: 'Qarzdan Ozodlik Rejasi', desc: '70/20/10 qoidasi bilan kreditni tezroq yoping', color: 'text-primary' },
  { icon: TrendingDown, title: 'Aqlli Byudjet Nazorati', desc: '70% yashash byudjetingizni real-time kuzating', color: 'text-emerald-500' },
  { icon: PiggyBank, title: 'Jamg\'arma Prognozi', desc: '10% jamg\'arma bilan boylik to\'plash rejasi', color: 'text-amber-500' },
  { icon: BarChart3, title: 'Chuqur Tahlil', desc: 'Batafsil moliyaviy statistika va trendlar', color: 'text-info' },
  { icon: Bell, title: 'Aqlli Bildirishnomalar', desc: 'Byudjet chegarasida ogohlantirish', color: 'text-destructive' },
  { icon: Sparkles, title: 'AI Maslahatchi', desc: 'Shaxsiy moliyaviy maslahatlar', color: 'text-purple-500' },
];

interface HalosProPageProps {
  onBack?: () => void;
}

const HalosProPage = ({ onBack }: HalosProPageProps) => {
  const { isPro, setIsPro } = useData();

  const handleSubscribe = () => {
    setIsPro(true);
    toast.success('🎉 Halos PRO faollashtirildi! Barcha imkoniyatlar ochildi.');
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Header */}
        <motion.div variants={item} className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-bold">Halos PRO</h1>
        </motion.div>

        {/* Hero */}
        <motion.div variants={item}>
          <Card className="border-0 overflow-hidden">
            <div className="gradient-purple p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              >
                <Crown size={48} className="mx-auto text-white/90 mb-3" />
              </motion.div>
              <h2 className="text-white font-extrabold text-2xl mb-1">Halos PRO</h2>
              <p className="text-white/70 text-sm">Moliyaviy erkinlikka erishtiruvchi kuchli vositalar</p>
            </div>
            <CardContent className="p-5">
              {isPro ? (
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
                    <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-bold text-lg">Siz PRO foydalanuvchisiz! 🎉</p>
                  <p className="text-sm text-muted-foreground mt-1">Barcha imkoniyatlar ochiq</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold">29,000 <span className="text-base font-normal text-muted-foreground">UZS/oy</span></p>
                    <p className="text-xs text-muted-foreground mt-1">yoki 290,000 UZS/yil (17% tejash)</p>
                  </div>
                  <Button onClick={handleSubscribe} className="w-full h-12 text-base font-bold gradient-primary border-0 text-white">
                    <Zap size={18} className="mr-2" />
                    PRO ga o'tish
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">7 kunlik bepul sinov davri</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div variants={item}>
          <h3 className="font-semibold mb-3">PRO imkoniyatlari</h3>
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <motion.div key={i} variants={item}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <f.icon size={20} className={f.color} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                    {isPro && <Check size={16} className="ml-auto text-emerald-500 shrink-0" />}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison */}
        {!isPro && (
          <motion.div variants={item}>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-sm">Bepul vs PRO</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ['Tranzaksiya kiritish', true, true],
                    ['Qarz kuzatish', true, true],
                    ['Asosiy statistika', true, true],
                    ['70/20/10 Ozodlik rejasi', false, true],
                    ['Aqlli byudjet nazorati', false, true],
                    ['Kredit tahlili', false, true],
                    ['AI maslahatchi', false, true],
                    ['Cheksiz kredit qo\'shish', false, true],
                  ].map(([label, free, pro], i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{label as string}</span>
                      <div className="flex gap-6">
                        <span className="w-8 text-center">{free ? <Check size={14} className="inline text-emerald-500" /> : '—'}</span>
                        <span className="w-8 text-center"><Check size={14} className="inline text-emerald-500" /></span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-6 pt-1 text-[10px] text-muted-foreground">
                    <span className="w-8 text-center">Bepul</span>
                    <span className="w-8 text-center font-bold text-primary">PRO</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HalosProPage;
