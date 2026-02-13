import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, TrendingDown, Clock, Landmark, Plus, Trash2,
  ChevronRight, Sparkles, PiggyBank, ShoppingCart, CreditCard,
  AlertTriangle, CheckCircle2, Target, Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatCurrency } from '@/lib/utils';
import { Credit, MandatoryExpense, DEFAULT_MANDATORY_EXPENSES } from '@/types/models';
import { useData } from '@/contexts/DataContext';

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// Calculate months to pay off credit with extra payment
function calcPayoffMonths(remaining: number, monthlyPayment: number, extraPayment: number, annualRate: number): number {
  if (monthlyPayment + extraPayment <= 0 || remaining <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  let balance = remaining;
  let months = 0;
  const totalMonthly = monthlyPayment + extraPayment;

  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    const principal = totalMonthly - interest;
    if (principal <= 0) return 999; // Can't pay off
    balance -= principal;
    months++;
  }
  return months;
}

function calcTotalInterest(loanAmount: number, monthlyPayment: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12;
  let balance = loanAmount;
  let totalInterest = 0;

  for (let i = 0; i < months && balance > 0; i++) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    balance -= (monthlyPayment - interest);
  }
  return totalInterest;
}

function calcAcceleratedInterest(loanAmount: number, monthlyPayment: number, extraPayment: number, annualRate: number): number {
  const monthlyRate = annualRate / 100 / 12;
  let balance = loanAmount;
  let totalInterest = 0;
  const total = monthlyPayment + extraPayment;
  let months = 0;

  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    balance -= (total - interest);
    months++;
  }
  return totalInterest;
}

interface FreedomPlanProps {
  credits: Credit[];
  onAddCredit: () => void;
}

export default function FreedomPlan({ credits, onAddCredit }: FreedomPlanProps) {
  const { freedomPlan, setFreedomPlan } = useData();
  const [showSetup, setShowSetup] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // User financial data - initialize from saved plan
  const [monthlyIncome, setMonthlyIncome] = useState(freedomPlan.monthlyIncome > 0 ? String(freedomPlan.monthlyIncome) : '');
  const [expenses, setExpenses] = useState<MandatoryExpense[]>(freedomPlan.mandatoryExpenses.length > 0 ? freedomPlan.mandatoryExpenses : []);
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  // Add preset expense
  const addPreset = (preset: { name: string; icon: string }) => {
    if (expenses.find(e => e.name === preset.name)) return;
    setExpenses(prev => [...prev, { id: String(Date.now()), name: preset.name, amount: 0, icon: preset.icon }]);
  };

  const updateExpenseAmount = (id: string, amount: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, amount: Number(amount) || 0 } : e));
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addCustomExpense = () => {
    if (!newExpName.trim() || !newExpAmount) return;
    setExpenses(prev => [...prev, { id: String(Date.now()), name: newExpName, amount: Number(newExpAmount), icon: '📋' }]);
    setNewExpName('');
    setNewExpAmount('');
  };

  // Halos Erkinlik Strategiyasi calculation
  const plan = useMemo(() => {
    const income = Number(monthlyIncome) || 0;
    if (income <= 0) return null;

    // Total mandatory: expenses + credit payments
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalCreditPayments = credits.reduce((s, c) => s + c.monthlyPayment, 0);
    const totalMandatory = totalExpenses + totalCreditPayments;

    const remaining = income - totalMandatory;
    if (remaining <= 0) return { income, totalMandatory, remaining: 0, living: 0, extraCredit: 0, savings: 0, totalExpenses, totalCreditPayments, deficit: true };

    const living = Math.round(remaining * 0.70);
    const extraCredit = Math.round(remaining * 0.20);
    const savings = Math.round(remaining * 0.10);

    // Calculate payoff acceleration for each credit
    const creditAnalysis = credits.map(c => {
      // Remaining balance (simplified: assume full loan for now)
      const remainingBalance = c.loanAmount;
      const normalMonths = c.termMonths;
      const normalInterest = calcTotalInterest(c.loanAmount, c.monthlyPayment, c.annualRate, normalMonths);

      // Extra payment distributed equally among credits
      const extraPerCredit = credits.length > 0 ? extraCredit / credits.length : 0;
      const acceleratedMonths = calcPayoffMonths(remainingBalance, c.monthlyPayment, extraPerCredit, c.annualRate);
      const acceleratedInterest = calcAcceleratedInterest(c.loanAmount, c.monthlyPayment, extraPerCredit, c.annualRate);

      const savedMonths = normalMonths - acceleratedMonths;
      const savedInterest = normalInterest - acceleratedInterest;

      return {
        credit: c,
        normalMonths,
        normalInterest,
        acceleratedMonths,
        acceleratedInterest,
        savedMonths: Math.max(0, savedMonths),
        savedInterest: Math.max(0, savedInterest),
        extraPerCredit,
      };
    });

    const totalSavedMonths = creditAnalysis.reduce((s, a) => s + a.savedMonths, 0);
    const totalSavedInterest = creditAnalysis.reduce((s, a) => s + a.savedInterest, 0);

    return {
      income,
      totalMandatory,
      remaining,
      living,
      extraCredit,
      savings,
      totalExpenses,
      totalCreditPayments,
      deficit: false,
      creditAnalysis,
      totalSavedMonths,
      totalSavedInterest,
    };
  }, [monthlyIncome, expenses, credits]);

  const hasSetup = plan && !plan.deficit && plan.remaining > 0;

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="gradient-primary p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={20} className="text-white/90" />
                  <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Halos PRO</span>
                </div>
                <h2 className="text-white font-bold text-lg">Qarzdan Ozodlik Rejasi</h2>
                <p className="text-white/70 text-xs mt-1">Halos Erkinlik Strategiyasi bilan moliyaviy mustaqillikka erishing</p>
              </div>
              <Sparkles size={28} className="text-white/40" />
            </div>
          </div>

          {!hasSetup ? (
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-4">
                Daromadingizni kiriting va majburiy xarajatlaringizni belgilang —
                biz sizga kreditdan tezroq chiqish va boylik to'plash rejasini tuzib beramiz.
              </p>
              <Button onClick={() => setShowSetup(true)} className="w-full h-11 gradient-primary border-0 text-white font-semibold">
                <Zap size={16} className="mr-2" />
                Rejani tuzish
              </Button>
            </CardContent>
          ) : (
            <CardContent className="p-4 space-y-3">
              {/* 70/20/10 Split Visual */}
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 rounded-l-full" style={{ width: '70%' }} />
                <div className="bg-amber-500" style={{ width: '20%' }} />
                <div className="bg-emerald-500 rounded-r-full" style={{ width: '10%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <ShoppingCart size={16} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Farovonlik 70%</p>
                  <p className="font-bold text-xs">{formatCurrency(plan!.living)}</p>
                </div>
                <div className="text-center">
                  <CreditCard size={16} className="mx-auto text-amber-500 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Ozodlik Yo'li 20%</p>
                  <p className="font-bold text-xs">{formatCurrency(plan!.extraCredit)}</p>
                </div>
                <div className="text-center">
                  <PiggyBank size={16} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Kapital 10%</p>
                  <p className="font-bold text-xs">{formatCurrency(plan!.savings)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowResult(true)} className="flex-1 h-10 gradient-primary border-0 text-white text-sm font-semibold">
                  Batafsil natija
                  <ChevronRight size={16} />
                </Button>
                <Button onClick={() => setShowSetup(true)} variant="outline" size="icon" className="h-10 w-10">
                  <Target size={16} />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Credits List */}
      {credits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Kreditlaringiz</h3>
            <span className="text-xs text-muted-foreground">{credits.length} ta kredit</span>
          </div>
          {credits.map(c => {
            const totalPaid = c.monthlyPayment * c.termMonths;
            const totalInterest = totalPaid - c.loanAmount;
            const interestPercent = Math.round((totalInterest / c.loanAmount) * 100);
            const analysis = hasSetup ? plan?.creditAnalysis?.find(a => a.credit.id === c.id) : null;

            return (
              <motion.div key={c.id} variants={item}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                          <Landmark size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{c.bankName}</p>
                          <p className="text-xs text-muted-foreground">{c.annualRate}% · {c.termMonths} oy</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(c.loanAmount)}</p>
                        <p className="text-xs text-destructive">+{interestPercent}% ortiqcha</p>
                      </div>
                    </div>

                    {analysis && analysis.savedMonths > 0 && (
                      <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            Halos rejasi: <strong>{analysis.savedMonths} oy</strong> tez yopiladi, <strong>{formatCurrency(analysis.savedInterest)}</strong> tejaysiz!
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {credits.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Landmark size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm mb-3">Hali kredit qo'shilmagan</p>
            <Button onClick={onAddCredit} variant="outline" size="sm">
              <Plus size={16} className="mr-1" /> Kredit qo'shish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Setup Sheet */}
      <Sheet open={showSetup} onOpenChange={setShowSetup}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Moliyaviy rejani sozlash
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5 py-4">
            {/* Income */}
            <div>
              <label className="text-sm font-semibold mb-2 block">💰 Oylik daromadingiz</label>
              <Input
                type="number"
                placeholder="Masalan: 8500000"
                className="text-xl font-bold h-14"
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(e.target.value)}
              />
            </div>

            {/* Mandatory Expenses */}
            <div>
              <label className="text-sm font-semibold mb-2 block">📋 Majburiy xarajatlar</label>
              <p className="text-xs text-muted-foreground mb-3">To'lash shart bo'lgan oylik xarajatlaringiz (kredit to'lovlari avtomatik qo'shiladi)</p>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {DEFAULT_MANDATORY_EXPENSES.map(p => (
                  <button
                    key={p.name}
                    onClick={() => addPreset(p)}
                    disabled={expenses.some(e => e.name === p.name)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>

              {/* Expense list */}
              <div className="space-y-2">
                {expenses.map(exp => (
                  <div key={exp.id} className="flex items-center gap-2">
                    <span className="text-sm w-24 truncate">{exp.icon} {exp.name}</span>
                    <Input
                      type="number"
                      placeholder="Summa"
                      className="flex-1"
                      value={exp.amount || ''}
                      onChange={e => updateExpenseAmount(exp.id, e.target.value)}
                    />
                    <button onClick={() => removeExpense(exp.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Custom expense */}
              <div className="flex gap-2 mt-3">
                <Input placeholder="Nomi..." className="flex-1" value={newExpName} onChange={e => setNewExpName(e.target.value)} />
                <Input type="number" placeholder="Summa" className="w-28" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)} />
                <Button onClick={addCustomExpense} size="icon" variant="outline"><Plus size={16} /></Button>
              </div>
            </div>

            {/* Auto credit payments */}
            {credits.length > 0 && (
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs font-semibold mb-2">💳 Kredit to'lovlari (avtomatik)</p>
                {credits.map(c => (
                  <div key={c.id} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{c.bankName}</span>
                    <span className="font-medium">{formatCurrency(c.monthlyPayment)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary preview */}
            {plan && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className={`border-2 ${plan.deficit ? 'border-destructive/50' : 'border-emerald-300 dark:border-emerald-700'}`}>
                    <CardContent className="p-4 space-y-3">
                      {plan.deficit ? (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertTriangle size={18} />
                          <span className="text-sm font-semibold">Daromad xarajatlarni qoplamayapti!</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-semibold">Reja tayyor!</span>
                          </div>

                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Daromad</span><span className="font-medium">{formatCurrency(plan.income)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Majburiy xarajatlar</span><span className="text-destructive">−{formatCurrency(plan.totalExpenses)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Kredit to'lovlari</span><span className="text-destructive">−{formatCurrency(plan.totalCreditPayments)}</span></div>
                            <div className="flex justify-between border-t border-border pt-1.5">
                              <span className="font-semibold">Qolgan summa</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(plan.remaining)}</span>
                            </div>
                          </div>

                          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 rounded-l-full" style={{ width: '70%' }} />
                            <div className="bg-amber-500" style={{ width: '20%' }} />
                            <div className="bg-emerald-500 rounded-r-full" style={{ width: '10%' }} />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div><span className="text-blue-500 font-bold">{formatCurrency(plan.living)}</span><br />Farovonlik 70%</div>
                            <div><span className="text-amber-500 font-bold">{formatCurrency(plan.extraCredit)}</span><br />Ozodlik Yo'li 20%</div>
                            <div><span className="text-emerald-500 font-bold">{formatCurrency(plan.savings)}</span><br />Kapital 10%</div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}

            <Button
              onClick={async () => {
                await setFreedomPlan({ monthlyIncome: Number(monthlyIncome), mandatoryExpenses: expenses, isSetup: true });
                setShowSetup(false);
                setShowResult(true);
              }}
              disabled={!hasSetup}
              className="w-full h-12 text-base font-semibold gradient-primary border-0 text-white"
            >
              Natijalarni ko'rish
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Result Sheet */}
      <Sheet open={showResult} onOpenChange={setShowResult}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Halos Ozodlik Rejasi
            </SheetTitle>
          </SheetHeader>

          {hasSetup && plan?.creditAnalysis && (
            <div className="space-y-4 py-4">
              {/* Headline savings */}
              <Card className="border-0 bg-emerald-50 dark:bg-emerald-900/20">
                <CardContent className="p-5 text-center">
                  <Sparkles size={28} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Halos rejasi bilan siz tejaysiz</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(plan.totalSavedInterest!)}</p>
                  <p className="text-sm text-muted-foreground mt-1">va kreditdan <strong className="text-foreground">{plan.totalSavedMonths} oy</strong> oldin chiqasiz</p>
                </CardContent>
              </Card>

              {/* 70/20/10 breakdown */}
              <div>
                <h3 className="text-sm font-semibold mb-3">📊 Oylik rejangiz</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <ShoppingCart size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hayotiy Farovonlik</p>
                      <p className="text-xs text-muted-foreground">Sifatli yashash va kundalik ehtiyojlar uchun.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(plan.living)}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">70%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Shield size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ozodlik Yo'li</p>
                      <p className="text-xs text-muted-foreground">Qarzlardan va moliyaviy yukdan tezkor xalos bo'lish.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(plan.extraCredit)}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">20%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Zap size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Shaxsiy Kapital</p>
                      <p className="text-xs text-muted-foreground">Kelajakdagi boyligingiz va poydevoringiz.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(plan.savings)}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">10%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-credit analysis */}
              <div>
                <h3 className="text-sm font-semibold mb-3">💳 Kredit bo'yicha tahlil</h3>
                {plan.creditAnalysis.map(a => (
                  <Card key={a.credit.id} className="mb-3">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Landmark size={16} className="text-orange-500" />
                          <span className="font-semibold text-sm">{a.credit.bankName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{a.credit.annualRate}% yillik</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Normal */}
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">❌ Oddiy usul</p>
                          <p className="font-bold text-sm">{a.normalMonths} oy</p>
                          <p className="text-xs text-destructive">+{formatCurrency(a.normalInterest)} foiz</p>
                        </div>
                        {/* Halos */}
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">✅ Halos rejasi</p>
                          <p className="font-bold text-sm">{a.acceleratedMonths} oy</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">+{formatCurrency(a.acceleratedInterest)} foiz</p>
                        </div>
                      </div>

                      {a.savedMonths > 0 && (
                        <div className="flex items-center gap-2 p-2.5 bg-accent rounded-lg">
                          <Clock size={14} className="text-primary" />
                          <p className="text-xs">
                            <strong>{a.savedMonths} oy</strong> tez yopiladi · <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(a.savedInterest)}</strong> tejaysiz
                          </p>
                        </div>
                      )}

                      {/* Monthly extra payment */}
                      <p className="text-[10px] text-muted-foreground">
                        Har oy qo'shimcha <strong>{formatCurrency(a.extraPerCredit)}</strong> to'lab boring
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Savings projection */}
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <PiggyBank size={16} className="text-emerald-500" />
                    Jamg'arma prognozi
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-[10px] text-muted-foreground">6 oyda</p>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(plan.savings * 6)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-[10px] text-muted-foreground">1 yilda</p>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(plan.savings * 12)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-[10px] text-muted-foreground">3 yilda</p>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(plan.savings * 36)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivation */}
              <div className="p-4 bg-accent rounded-xl">
                <p className="text-sm leading-relaxed">
                  💡 <strong>Halos Erkinlik Strategiyasi</strong> — bu shunchaki raqamlar emas, bu sizning ozodlik yo'lingiz.
                  Bizning formula yordamida siz daromadingizni shunday taqsimlaysizki, u ham kundalik ehtiyojlaringizni (<strong>70%</strong>),
                  ham qarzlardan tezroq qutulishingizni (<strong>20%</strong>), ham shaxsiy boyligingizni (<strong>10%</strong>) ta'minlaydi.
                  Kredit qaramligidan butunlay xalos bo'ling va o'z kapitalingiz egasiga aylaning! 🚀
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
