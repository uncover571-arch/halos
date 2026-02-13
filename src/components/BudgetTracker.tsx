import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/utils';

export default function BudgetTracker() {
  const { freedomPlan, getLivingBudget, getCurrentMonthExpenses, getRemainingBudget } = useData();

  if (!freedomPlan.isSetup || freedomPlan.monthlyIncome <= 0) return null;

  const budget = getLivingBudget();
  const spent = getCurrentMonthExpenses();
  const remaining = getRemainingBudget();
  const percent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const isOver = remaining < 0;
  const isWarning = percent >= 80 && !isOver;

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const daysLeft = daysInMonth - today;
  const dailyBudget = remaining > 0 && daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`overflow-hidden border-2 ${isOver ? 'border-destructive/50' : isWarning ? 'border-warning/50' : 'border-emerald-200 dark:border-emerald-800'}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={18} className={isOver ? 'text-destructive' : isWarning ? 'text-warning' : 'text-emerald-500'} />
              <span className="text-sm font-semibold">70% Yashash byudjeti</span>
            </div>
            <span className="text-xs text-muted-foreground">{daysLeft} kun qoldi</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className={`text-2xl font-extrabold ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                {isOver ? '-' : ''}{formatCurrency(Math.abs(remaining))}
              </p>
              <p className="text-xs text-muted-foreground">qoldi</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatCurrency(spent)}</p>
              <p className="text-xs text-muted-foreground">/ {formatCurrency(budget)}</p>
            </div>
          </div>

          <Progress value={percent} className={`h-2.5 ${isOver ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />

          {/* Status message */}
          <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${isOver ? 'bg-destructive/10 text-destructive' : isWarning ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
            }`}>
            {isOver ? (
              <><AlertTriangle size={14} /><span><strong>Byudjet oshib ketdi!</strong> Harajatlaringizni kamaytiring.</span></>
            ) : isWarning ? (
              <><TrendingDown size={14} /><span>Ehtiyot bo'ling! Byudjetning <strong>{percent}%</strong> ishlatildi.</span></>
            ) : (
              <><CheckCircle2 size={14} /><span>Kuniga <strong>{formatCurrency(dailyBudget)}</strong> sarflashingiz mumkin.</span></>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
