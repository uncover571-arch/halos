import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { demoUser } from '@/data/demo-data';
import { Moon, Sun, Globe, DollarSign, Bell, Download, Upload, Trash2, Info, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const SettingRow = ({ icon: Icon, label, value, action }: { icon: any; label: string; value?: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-muted-foreground" />
      <span className="text-sm">{label}</span>
    </div>
    {value && <span className="text-sm text-muted-foreground">{value}</span>}
    {action}
  </div>
);

const ProfilePage = () => {
  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Profile Header */}
        <motion.div variants={item} className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5 mb-3">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl font-bold text-primary">
              {demoUser.firstName[0]}{demoUser.lastName?.[0]}
            </div>
          </div>
          <h2 className="font-bold text-lg">{demoUser.firstName} {demoUser.lastName}</h2>
          <p className="text-sm text-muted-foreground">@{demoUser.username}</p>
          <Button variant="outline" size="sm" className="mt-2">Tahrirlash</Button>
        </motion.div>

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
                <Button size="sm" variant="outline">Ulash</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              <SettingRow icon={Moon} label="Tungi rejim" action={<Switch />} />
              <SettingRow icon={Globe} label="Til" value="O'zbek" />
              <SettingRow icon={DollarSign} label="Valyuta" value="UZS" />
              <SettingRow icon={Bell} label="Bildirishnomalar" action={<Switch defaultChecked />} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              <SettingRow icon={Download} label="Ma'lumotlarni eksport" action={<ChevronRight size={16} className="text-muted-foreground" />} />
              <SettingRow icon={Upload} label="Ma'lumotlarni import" action={<ChevronRight size={16} className="text-muted-foreground" />} />
              <SettingRow icon={Trash2} label="Ma'lumotlarni tozalash" action={<ChevronRight size={16} className="text-destructive" />} />
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4 divide-y divide-border">
              <SettingRow icon={Info} label="Versiya" value="1.0.0" />
              <SettingRow icon={Shield} label="Maxfiylik siyosati" action={<ChevronRight size={16} className="text-muted-foreground" />} />
              <SettingRow icon={HelpCircle} label="Yordam" action={<ChevronRight size={16} className="text-muted-foreground" />} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div variants={item}>
          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut size={18} className="mr-2" />
            Chiqish
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
