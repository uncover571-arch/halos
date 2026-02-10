import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Sparkles, Handshake, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { demoUser, demoTransactions, formatCurrency } from '@/data/demo-data';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/models';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface HomePageProps {
  onNavigate?: (tab: 'home' | 'transactions' | 'add' | 'debts' | 'profile') => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense' | undefined>(undefined);

  const totalIncome = demoTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = demoTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const recent = demoTransactions.slice(0, 5);
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const handleQuickAction = (label: string) => {
    if (label === 'Kirim') { setAddType('income'); setShowAdd(true); }
    else if (label === 'Chiqim') { setAddType('expense'); setShowAdd(true); }
    else if (label === 'Qarz') { onNavigate?.('debts'); }
    else if (label === 'Transfer') { toast.info('Transfer tez kunda!'); }
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* App Bar */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Assalomu alaykum 👋</p>
            <h1 className="text-xl font-bold">{demoUser.firstName} {demoUser.lastName}</h1>
          </div>
          <Button variant="ghost" size="icon" className="relative" onClick={() => toast.info('Bildirishnomalar tez kunda!')}>
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          </Button>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={item}>
          <Card className="gradient-primary text-white border-0 overflow-hidden relative">
            <CardContent className="p-5">
              <p className="text-white/70 text-sm mb-1">Jami balans</p>
              <p className="text-3xl font-extrabold mb-4">{formatCurrency(balance)}</p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ArrowDownLeft size={16} /></div>
                  <div><p className="text-white/60 text-xs">Kirim</p><p className="font-semibold text-sm">{formatCurrency(totalIncome)}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ArrowUpRight size={16} /></div>
                  <div><p className="text-white/60 text-xs">Chiqim</p><p className="font-semibold text-sm">{formatCurrency(totalExpense)}</p></div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="grid grid-cols-4 gap-3">
          {[
            { label: 'Kirim', icon: ArrowDownLeft, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
            { label: 'Chiqim', icon: ArrowUpRight, color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
            { label: 'Qarz', icon: Handshake, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' },
            { label: 'Transfer', icon: ArrowLeftRight, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
          ].map(a => (
            <button key={a.label} onClick={() => handleQuickAction(a.label)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:bg-accent transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.color}`}><a.icon size={20} /></div>
              <span className="text-xs font-medium">{a.label}</span>
            </button>
          ))}
        </motion.div>

        {/* AI Card */}
        <motion.div variants={item}>
          <Card className="border-primary/20 bg-accent">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shrink-0"><Sparkles size={20} className="text-white" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">AI maslahat</p>
                <p className="text-xs text-muted-foreground">Oziq-ovqat xarajatlaringiz o'tgan oyga nisbatan 15% oshgan 📊</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Oylik xulosa</h2>
            <span className="text-xs text-muted-foreground">Fevral 2026</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="text-emerald-500" size={20} /><div><p className="text-xs text-muted-foreground">Tejash</p><p className="font-bold text-sm">{formatCurrency(totalIncome - totalExpense)}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="text-destructive" size={20} /><div><p className="text-xs text-muted-foreground">Tranzaksiyalar</p><p className="font-bold text-sm">{demoTransactions.length} ta</p></div></CardContent></Card>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Oxirgi tranzaksiyalar</h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => onNavigate?.('transactions')}>Barchasi</Button>
          </div>
          <div className="space-y-2">
            {recent.map(t => {
              const cat = allCategories.find(c => c.name === t.category);
              return (
                <Card key={t.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-muted">{cat?.icon || '📦'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t.category}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                    </div>
                    <p className={`font-bold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { setAddType(undefined); setShowAdd(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center z-50"
      >
        <Plus size={28} />
      </motion.button>

      <AddTransactionSheet open={showAdd} onOpenChange={setShowAdd} defaultType={addType} />
    </div>
  );
};

export default HomePage;
