import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useData } from '@/contexts/DataContext';
import { Moon, Globe, DollarSign, Bell, Download, Upload, Trash2, Info, Shield, HelpCircle, LogOut, ChevronRight, Check, Crown } from 'lucide-react';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const SettingRow = ({ icon: Icon, label, value, action, onClick }: { icon: any; label: string; value?: string; action?: React.ReactNode; onClick?: () => void }) => (
  <div className={`flex items-center justify-between py-3 ${onClick ? 'cursor-pointer active:bg-accent/50 -mx-1 px-1 rounded-lg transition-colors' : ''}`} onClick={onClick}>
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-muted-foreground" />
      <span className="text-sm">{label}</span>
    </div>
    {value && !action && <div className="flex items-center gap-1"><span className="text-sm text-muted-foreground">{value}</span><ChevronRight size={16} className="text-muted-foreground" /></div>}
    {action}
  </div>
);

const languages = [
  { code: 'uz' as const, label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
];

const currencies = [
  { code: 'UZS' as const, label: "O'zbek so'mi", symbol: "so'm" },
  { code: 'USD' as const, label: 'AQSH dollari', symbol: '$' },
  { code: 'EUR' as const, label: 'Yevro', symbol: '€' },
  { code: 'RUB' as const, label: 'Rossiya rubli', symbol: '₽' },
];

interface ProfilePageProps {
  onNavigate?: (tab: string) => void;
}

const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const { theme, setTheme, language, setLanguage, currency, setCurrency, notifications, setNotifications } = useAppSettings();
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  const { isPro } = useData();

  const isDark = theme === 'dark';
  const currentLang = languages.find(l => l.code === language);
  const currentCurr = currencies.find(c => c.code === currency);

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-4 md:pt-8 max-w-lg md:max-w-2xl mx-auto md:mx-0">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Profile Header */}
        <motion.div variants={item} className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5 mb-3">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl font-bold text-primary">
              H
            </div>
          </div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            Halos
            {isPro && <span className="text-[10px] px-1.5 py-0.5 rounded-full gradient-purple text-white font-medium">PRO</span>}
          </h2>
          <p className="text-sm text-muted-foreground">Moliyaviy boshqaruv</p>
        </motion.div>

        {/* Pro Card */}
        {!isPro && (
          <motion.div variants={item}>
            <Card className="border-primary/30 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate?.('pro')}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shrink-0">
                  <Crown size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Halos PRO ga o'ting</p>
                  <p className="text-xs text-muted-foreground">70/20/10 rejasi, byudjet nazorati va boshqalar</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Telegram */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg">📱</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Telegram</p>
                  <p className="text-xs text-muted-foreground">Ulanmagan</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info('Telegram integratsiya tez kunda!')}>Ulash</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              <SettingRow
                icon={Moon}
                label="Tungi rejim"
                action={
                  <Switch
                    checked={isDark}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                }
              />
              <SettingRow icon={Globe} label="Til" value={`${currentLang?.flag} ${currentLang?.label}`} onClick={() => setLangOpen(true)} />
              <SettingRow icon={DollarSign} label="Valyuta" value={currentCurr?.code} onClick={() => setCurrOpen(true)} />
              <SettingRow
                icon={Bell}
                label="Bildirishnomalar"
                action={
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                }
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              <SettingRow icon={Download} label="Ma'lumotlarni eksport" onClick={() => toast.success("Ma'lumotlar eksport qilindi!")} action={<ChevronRight size={16} className="text-muted-foreground" />} />
              <SettingRow icon={Upload} label="Ma'lumotlarni import" onClick={() => toast.info('Import tez kunda!')} action={<ChevronRight size={16} className="text-muted-foreground" />} />
              <SettingRow icon={Trash2} label="Ma'lumotlarni tozalash" onClick={() => toast.warning("Ma'lumotlar tozalandi (demo)")} action={<ChevronRight size={16} className="text-destructive" />} />
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              <SettingRow icon={Info} label="Versiya" value="1.0.0" />
              <SettingRow icon={Shield} label="Maxfiylik siyosati" onClick={() => toast.info('Maxfiylik siyosati sahifasi tez kunda!')} action={<ChevronRight size={16} className="text-muted-foreground" />} />
              <SettingRow icon={HelpCircle} label="Yordam" onClick={() => toast.info('Yordam sahifasi tez kunda!')} action={<ChevronRight size={16} className="text-muted-foreground" />} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div variants={item}>
          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => toast.info('Chiqish tez kunda!')}>
            <LogOut size={18} className="mr-2" />
            Chiqish
          </Button>
        </motion.div>
      </motion.div>

      {/* Language Dialog */}
      <Dialog open={langOpen} onOpenChange={setLangOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Tilni tanlang</DialogTitle></DialogHeader>
          <div className="space-y-1">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code); setLangOpen(false); toast.success(`Til: ${l.label}`); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${language === l.code ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              >
                <span className="flex items-center gap-3"><span className="text-xl">{l.flag}</span><span className="font-medium text-sm">{l.label}</span></span>
                {language === l.code && <Check size={18} />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Currency Dialog */}
      <Dialog open={currOpen} onOpenChange={setCurrOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Valyutani tanlang</DialogTitle></DialogHeader>
          <div className="space-y-1">
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setCurrOpen(false); toast.success(`Valyuta: ${c.code}`); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${currency === c.code ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              >
                <span className="flex items-center gap-3"><span className="font-bold">{c.symbol}</span><span className="font-medium text-sm">{c.label}</span></span>
                {currency === c.code && <Check size={18} />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
