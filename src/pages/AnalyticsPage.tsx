import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/data/demo-data';
import { EXPENSE_CATEGORIES } from '@/types/models';
import { useData } from '@/contexts/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const AnalyticsPage = () => {
  const { transactions } = useData();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const healthScore = Math.min(100, Math.max(0, savingsRate + 50));

  const catData = EXPENSE_CATEGORIES.map(c => {
    const total = transactions.filter(t => t.type === 'expense' && t.category === c.name).reduce((s, t) => s + t.amount, 0);
    return { name: c.name, value: total, color: c.color, icon: c.icon };
  }).filter(c => c.value > 0);

  const topCategory = [...catData].sort((a, b) => b.value - a.value)[0];
  const avgDailyExpense = transactions.length > 0 ? Math.round(totalExpense / Math.max(1, new Date().getDate())) : 0;

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-4 md:pt-8 max-w-lg md:max-w-3xl mx-auto md:mx-0">
      <h1 className="text-xl font-bold mb-4">Statistika</h1>

      <div className="flex gap-2 mb-5">
        {([['week', 'Hafta'], ['month', 'Oy'], ['year', 'Yil']] as const).map(([k, v]) => (
          <button key={k} onClick={() => setPeriod(k)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === k ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >{v}</button>
        ))}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Health Score */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-5 flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                    stroke={healthScore >= 70 ? 'hsl(142 71% 45%)' : healthScore >= 40 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'}
                    strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">{healthScore}</span>
              </div>
              <div>
                <p className="font-semibold">Moliyaviy sog'liq</p>
                <p className="text-sm text-muted-foreground">
                  {transactions.length === 0 ? "Ma'lumot kiriting" : healthScore >= 70 ? 'Ajoyib! Davom eting 🎉' : healthScore >= 40 ? 'Yaxshi, lekin yaxshilash mumkin' : 'Ehtiyot bo\'ling!'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tejash darajasi: {savingsRate}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {transactions.length === 0 ? (
          <motion.div variants={item}>
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Statistika ko'rish uchun tranzaksiya qo'shing</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Pie Chart */}
            {catData.length > 0 && (
              <motion.div variants={item}>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold mb-3">Kategoriyalar bo'yicha</p>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                            {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 flex-1">
                        {catData.map(c => (
                          <div key={c.name} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: c.color }} />
                            <span className="flex-1">{c.icon} {c.name}</span>
                            <span className="text-xs text-muted-foreground">{totalExpense > 0 ? Math.round(c.value / totalExpense * 100) : 0}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Trends */}
            <motion.div variants={item}>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="font-semibold">Trendlar</p>
                  {topCategory && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Eng ko'p xarajat</span>
                      <span className="font-medium">{topCategory.icon} {topCategory.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">O'rtacha kunlik xarajat</span>
                    <span className="font-medium">{formatCurrency(avgDailyExpense)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tejash darajasi</span>
                    <span className={`font-medium ${savingsRate > 20 ? 'text-emerald-500' : 'text-destructive'}`}>{savingsRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
