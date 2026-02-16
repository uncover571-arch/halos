import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Handshake,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Wallet,
  PieChart,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/models';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Animations
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

interface HomePageProps {
  onNavigate?: (tab: string) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense' | undefined>(undefined);
  const [showBalance, setShowBalance] = useState(true);

  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech';
  const firstName = user?.firstName || 'Foydalanuvchi';

  // Get stats from summary (backend source of truth)
  const { summary, transactions, freedomPlan, isPro } = useData();
  const { totalIncome, totalExpense, balance } = summary;

  const recent = transactions.slice(0, 5);
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  // Quick Actions Handler
  const handleQuickAction = (label: string) => {
    if (label === 'Kirim') { setAddType('income'); setShowAdd(true); }
    else if (label === 'Chiqim') { setAddType('expense'); setShowAdd(true); }
    else if (label === 'Qarz') { onNavigate?.('debts'); }
    else if (label === 'Erkinlik') { onNavigate?.('plan'); }
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-10 relative">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
      <div className="fixed top-[-100px] right-[-100px] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="fixed top-[100px] left-[-100px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 pt-2 md:pt-6 max-w-5xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary p-[2px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center text-white">
                    <Sparkles size={20} fill="currentColor" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{greeting}</p>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                {firstName}
                {isPro && <Sparkles className="inline-block w-4 h-4 text-amber-400 ml-1 fill-amber-400" />}
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 border-border/60 bg-background/50 backdrop-blur-md hover:bg-accent hover:border-accent"
            onClick={() => toast.info('Bildirishnomalar tez kunda!')}
          >
            <Bell size={18} className="text-foreground/80" />
          </Button>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div variants={item} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
          <Card className="rounded-[32px] border-none overflow-hidden relative min-h-[220px] bg-gradient-to-br from-[#24A1DE] to-[#3B82F6] text-white shadow-xl">
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

            <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[220px]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-blue-100 font-medium text-sm">Umumiy balans</p>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-blue-200 hover:text-white transition-colors">
                      {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {showBalance ? formatCurrency(balance) : '•••••••'}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Wallet className="text-white" size={24} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <ArrowDownLeft className="text-emerald-300" size={20} />
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs">Kirim</p>
                    <p className="font-semibold text-lg leading-tight">
                      {showBalance ? formatCurrency(totalIncome) : '•••'}
                    </p>
                  </div>
                </div>
                <div className="bg-black/10 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center">
                    <ArrowUpRight className="text-red-300" size={20} />
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs">Chiqim</p>
                    <p className="font-semibold text-lg leading-tight">
                      {showBalance ? formatCurrency(totalExpense) : '•••'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={item}>
          <p className="text-sm font-semibold text-muted-foreground mb-4 pl-1">Tezkor amallar</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Kirim', icon: ArrowDownLeft, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', click: 'Kirim' },
              { label: 'Chiqim', icon: ArrowUpRight, color: 'bg-red-500/10 text-red-600 dark:text-red-400', click: 'Chiqim' },
              { label: 'Qarz', icon: Handshake, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', click: 'Qarz' },
              { label: 'Erkinlik', icon: Target, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', click: 'Erkinlik' },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action.click)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-[70px] h-[70px] rounded-[24px] flex items-center justify-center ${action.color} transition-all duration-300 group-hover:shadow-lg hover:brightness-110 border border-transparent hover:border-foreground/5`}>
                  <action.icon size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-foreground/80 group-hover:text-primary transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions Section */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-lg">Oxirgi o'tkazmalar</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('transactions')} className="text-primary hover:text-primary/80 hover:bg-primary/5">
              Barchasi <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {recent.length === 0 ? (
              <Card className="border-dashed bg-transparent border-2 shadow-none">
                <CardContent className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="text-muted-foreground" size={24} />
                  </div>
                  <p className="text-muted-foreground font-medium">Hali tranzaksiyalar yo'q</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                    Pastdagi <span className="text-primary font-bold">+</span> tugmasini bosib birinchi tranzaksiyani qo'shing
                  </p>
                </CardContent>
              </Card>
            ) : (
              recent.map((t, i) => {
                const cat = allCategories.find(c => c.name === t.category);
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-sm group cursor-pointer" onClick={() => onNavigate?.('transactions')}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${t.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          {cat?.icon || '📦'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="font-bold text-base truncate pr-2 group-hover:text-primary transition-colors">{t.category}</h4>
                            <span className={`font-bold text-base whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <p className="truncate pr-2">{t.description || "Izohsiz"}</p>
                            <p className="whitespace-nowrap opacity-70">{new Date(t.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Spacer for FAB */}
        <div className="h-20" />
      </motion.div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => { setAddType(undefined); setShowAdd(true); }}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-[24px] bg-foreground text-background shadow-2xl flex items-center justify-center z-50 md:hidden border-2 border-white/20"
      >
        <Plus size={32} />
      </motion.button>

      <AddTransactionSheet open={showAdd} onOpenChange={setShowAdd} defaultType={addType} />
    </div>
  );
};

export default HomePage;
