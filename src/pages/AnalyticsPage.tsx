import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/models';
import { useData } from '@/contexts/DataContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  Calendar,
  AlertCircle,
  Zap
} from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

const AnalyticsPage = () => {
  const { transactions, summary, isPro } = useData();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Filter transactions based on period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const tDateStr = tDate.toISOString().split('T')[0];

      if (period === 'day') {
        return tDateStr === todayStr;
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tDate >= weekAgo;
      } else if (period === 'month') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (period === 'year') {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, period]);

  // Totals for filtered period
  const periodIncome = useMemo(() => {
    if (period === 'month' && summary.monthlyIncome > 0) return summary.monthlyIncome;
    return filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [filteredTransactions, period, summary]);

  const periodExpense = useMemo(() => {
    if (period === 'month' && summary.monthlyExpense > 0) return summary.monthlyExpense;
    return filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [filteredTransactions, period, summary]);

  const savingsRate = periodIncome > 0 ? Math.round(((periodIncome - periodExpense) / periodIncome) * 100) : 0;
  const healthScore = Math.min(100, Math.max(0, savingsRate + 50));

  // Category data for Pie Chart
  const categoryData = useMemo(() => {
    return EXPENSE_CATEGORIES.map(c => {
      const total = filteredTransactions
        .filter(t => t.type === 'expense' && t.category === c.name)
        .reduce((s, t) => s + t.amount, 0);
      return { name: c.name, value: total, color: c.color, icon: c.icon };
    }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Daily Trend Data for Bar/Area Chart
  const trendData = useMemo(() => {
    const dailyMap: Record<string, { date: string, income: number, expense: number }> = {};

    // Last 7 days or current month days
    const daysToShow = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const now = new Date();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = {
        date: d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
        income: 0,
        expense: 0
      };
    }

    filteredTransactions.forEach(t => {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (dailyMap[key]) {
        if (t.type === 'income') dailyMap[key].income += t.amount;
        else dailyMap[key].expense += t.amount;
      }
    });

    return Object.values(dailyMap);
  }, [filteredTransactions, period]);

  const topCategory = categoryData[0];
  const avgDailyExpense = filteredTransactions.length > 0
    ? (period === 'day' ? periodExpense : Math.round(periodExpense / (period === 'week' ? 7 : new Date().getDate())))
    : 0;

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'A' as const, color: 'text-emerald-500', msg: 'Ajoyib! Moliyaviy intizomingiz yuqori darajada.', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'B' as const, color: 'text-blue-500', msg: 'Yaxshi! Jamg\'arma qilishni davom eting.', bg: 'bg-blue-500/10' };
    if (score >= 40) return { label: 'C' as const, color: 'text-amber-500', msg: 'Ehtiyot bo\'ling. Xarajatlar daromadga yaqin.', bg: 'bg-amber-500/10' };
    return { label: 'D' as const, color: 'text-rose-500', msg: 'Diqqat! Moliyaviy islohotlar zarur.', bg: 'bg-rose-500/10' };
  };

  const status = getHealthStatus(healthScore);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-12 pt-4 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Statistika</h1>
          <p className="text-muted-foreground text-sm">Moliyaviy ko'rsatkichlaringiz tahlili</p>
        </div>

        <div className="bg-muted/50 p-1.5 rounded-2xl flex items-center gap-1 self-start md:self-center backdrop-blur-sm border border-border/40 overflow-x-auto no-scrollbar max-w-full">
          {([['day', 'Bugun'], ['week', 'Hafta'], ['month', 'Oy'], ['year', 'Yil']] as const).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${period === p
                ? 'bg-card text-foreground shadow-sm scale-105'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <motion.div variants={container as any} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Cards */}
        <motion.div variants={item as any} className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white group">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <ArrowDownLeft size={48} />
              </div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Davr daromadi</p>
              <h3 className="text-3xl font-black truncate">{formatCurrency(periodIncome)}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs text-blue-100/80">
                <TrendingUp size={14} />
                <span>Ushbu {period === 'week' ? 'hafta' : period === 'month' ? 'oy' : 'yil'}gi kirim</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white group">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <ArrowUpRight size={48} />
              </div>
              <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">Davr xarajati</p>
              <h3 className="text-3xl font-black truncate">{formatCurrency(periodExpense)}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs text-rose-100/80">
                <TrendingDown size={14} />
                <span>Ushbu {period === 'week' ? 'hafta' : period === 'month' ? 'oy' : 'yil'}gi chiqim</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/40 bg-card/50 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-foreground">Jamg'arma ko'rsatkichi</p>
                <div className={`p-2 rounded-xl ${status.bg} ${status.color}`}>
                  <PieIcon size={18} />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-black ${savingsRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {savingsRate}%
                </span>
                <span className="text-xs text-muted-foreground pb-1.5">daromaddan tejov</span>
              </div>
              <div className="mt-4 w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                  className={`h-full ${savingsRate > 20 ? 'bg-emerald-500' : savingsRate > 0 ? 'bg-blue-500' : 'bg-rose-500'}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Health & Grade */}
        <motion.div variants={item as any} className="md:col-span-2">
          <Card className="h-full border-border/40 shadow-xl overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Moliyaviy Sog'liq
                  </CardTitle>
                </div>
                <div className={`text-3xl font-black w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${status.bg} ${status.color}`}>
                  {status.label}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <motion.path
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${healthScore}, 100` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={healthScore >= 70 ? 'hsl(142 71% 45%)' : healthScore >= 40 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'}
                      strokeWidth="3" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{healthScore}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">BALL</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="p-4 rounded-xl bg-accent/30 border border-border/40">
                    <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                      "{status.msg}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">O'rtacha kunlik xarajat</p>
                      <p className="font-bold text-slate-700">{formatCurrency(avgDailyExpense)}</p>
                    </div>
                    {topCategory && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Eng ko'p chiqim</p>
                        <p className="font-bold text-slate-700 truncate">{topCategory.icon} {topCategory.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts & Breakdown */}
        {filteredTransactions.length === 0 ? (
          <motion.div variants={item as any} className="md:col-span-3 text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto text-muted-foreground/30">
              <Calendar size={32} />
            </div>
            <h3 className="font-bold text-muted-foreground">Tanlangan davr uchun ma'lumotlar yo'q</h3>
            <p className="text-xs text-muted-foreground/70 mt-1">Tranzaksiyalarni qo'shing yoki boshqa davrni tanlang</p>
          </motion.div>
        ) : (
          <>
            {/* Trend Chart */}
            <motion.div variants={item as any} className="md:col-span-2">
              <Card className="h-full border-border/40 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                  <div>
                    <CardTitle className="text-lg">Xarajatlar Trendi</CardTitle>
                    <CardDescription>Oxirgi {period === 'week' ? '7 kun' : '30 kun'}lik dinamika</CardDescription>
                  </div>
                  <BarChart3 className="text-muted-foreground/50" />
                </CardHeader>
                <CardContent className="p-4 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: number) => formatCurrency(val)}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Classification Card */}
            <motion.div variants={item as any} className="md:col-span-1">
              <Card className="h-full border-border/40 shadow-xl flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Kategoriyalar</CardTitle>
                  <CardDescription>Xarajatlar taqsimoti</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center gap-6 p-6">
                  {categoryData.length > 0 ? (
                    <>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%" cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {categoryData.slice(0, 4).map(c => (
                          <div key={c.name} className="group cursor-default">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                                <span className="font-bold text-slate-600">{c.icon} {c.name}</span>
                              </span>
                              <span className="font-black text-slate-800">{Math.round((c.value / periodExpense) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(c.value / periodExpense) * 100}%` }}
                                className="h-full"
                                style={{ background: c.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 opacity-50">
                      <Zap className="mx-auto mb-2" />
                      <p className="text-xs">Ma'lumot mavjud emas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed Transactions for Daily View */}
            {period === 'day' && filteredTransactions.length > 0 && (
              <motion.div variants={item as any} className="md:col-span-3">
                <Card className="border-border/40 shadow-xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Bugungi amallar</CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px]">{filteredTransactions.length} ta</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {filteredTransactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                              {EXPENSE_CATEGORIES.find(c => c.name === tx.category)?.icon ||
                                INCOME_CATEGORIES.find(c => c.name === tx.category)?.icon || '📦'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground capitalize">{tx.description || tx.category}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                {tx.category} • {new Date(tx.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <p className={`font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* PRO Recommendation Teaser */}
      {!isPro && (
        <motion.div variants={item as any} className="md:col-span-3">
          <Card className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl relative overflow-hidden group">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative z-10 space-y-2">
                <Badge className="bg-white/20 text-white border-0 mb-2">HALOS AI PRO</Badge>
                <h2 className="text-2xl font-black">Chuqur tahlil va maslahatlar</h2>
                <p className="text-indigo-100 max-w-md">PRO obuna bilan barcha xarajatlaringiz sun'iy intellekt tomonidan tahlil qilinadi va tejash bo'yicha shaxsiy tavsiyalar beriladi.</p>
              </div>
              <Button
                onClick={() => { }}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-10 h-14 rounded-2xl shadow-xl transition-transform active:scale-95 z-10"
              >
                Hozir sinab ko'rish
              </Button>

              {/* Background Shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/4" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="h-8" />
    </div>
  );
};

export default AnalyticsPage;

