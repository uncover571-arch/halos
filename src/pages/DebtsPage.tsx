import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Phone, Check, AlertTriangle, Landmark, TrendingUp, Clock, Skull, AlertOctagon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { demoDebts, demoCredits, formatCurrency } from '@/data/demo-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Credit } from '@/types/models';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// Credit impact calculator
function calcCreditImpact(loanAmount: number, monthlyPayment: number, annualRate: number, termMonths: number, monthlyIncome: number) {
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - loanAmount;
  const interestPercent = (totalInterest / loanAmount) * 100;

  // How many months of pure work to pay off just the interest
  const monthsForInterest = monthlyIncome > 0 ? totalInterest / monthlyIncome : 0;
  // Working hours (22 days * 8 hours = 176 hours/month)
  const hoursForInterest = monthsForInterest * 176;
  const daysForInterest = monthsForInterest * 22;

  // Danger level 0-100
  let dangerLevel = 0;
  if (interestPercent > 100) dangerLevel = 95;
  else if (interestPercent > 70) dangerLevel = 80;
  else if (interestPercent > 50) dangerLevel = 65;
  else if (interestPercent > 30) dangerLevel = 45;
  else if (interestPercent > 15) dangerLevel = 30;
  else dangerLevel = 15;

  // If monthly payment > 50% of income, very dangerous
  if (monthlyIncome > 0 && (monthlyPayment / monthlyIncome) > 0.5) dangerLevel = Math.min(100, dangerLevel + 20);

  return { totalPaid, totalInterest, interestPercent, monthsForInterest, hoursForInterest, daysForInterest, dangerLevel };
}

function getDangerColor(level: number) {
  if (level >= 75) return 'text-red-600 dark:text-red-400';
  if (level >= 50) return 'text-orange-600 dark:text-orange-400';
  if (level >= 30) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function getDangerBg(level: number) {
  if (level >= 75) return 'bg-red-500';
  if (level >= 50) return 'bg-orange-500';
  if (level >= 30) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

function getDangerLabel(level: number) {
  if (level >= 75) return '🔴 Juda xavfli!';
  if (level >= 50) return '🟠 Xavfli';
  if (level >= 30) return '🟡 O\'rtacha';
  return '🟢 Qabul qilinarli';
}

const DebtsPage = () => {
  const [tab, setTab] = useState<'lent' | 'borrowed' | 'credits'>('lent');
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<'debt' | 'credit'>('debt');

  // Debt form
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [debtDesc, setDebtDesc] = useState('');

  // Credit form
  const [creditBank, setCreditBank] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditMonthlyPay, setCreditMonthlyPay] = useState('');
  const [creditRate, setCreditRate] = useState('');
  const [creditTerm, setCreditTerm] = useState('');
  const [creditMonthlyIncome, setCreditMonthlyIncome] = useState('8500000');
  const [creditDesc, setCreditDesc] = useState('');
  const [creditStartDate, setCreditStartDate] = useState('');

  // Credits state
  const [credits, setCredits] = useState<Credit[]>(demoCredits);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [showCreditDetail, setShowCreditDetail] = useState(false);

  const lent = demoDebts.filter(d => d.isLent);
  const borrowed = demoDebts.filter(d => !d.isLent);

  const totalLent = lent.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const totalBorrowed = borrowed.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const totalCreditDebt = credits.reduce((s, c) => s + c.loanAmount, 0);

  const statusConfig = {
    active: { label: 'Aktiv', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    paid: { label: "To'langan", color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    overdue: { label: "Muddati o'tgan", color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  };

  const resetForm = () => {
    setPersonName(''); setPhoneNumber(''); setDebtAmount(''); setDueDate(''); setDebtDesc('');
    setCreditBank(''); setCreditAmount(''); setCreditMonthlyPay(''); setCreditRate(''); setCreditTerm(''); setCreditDesc(''); setCreditStartDate('');
  };

  const handleSaveDebt = () => {
    if (!personName.trim()) { toast.error('Shaxs ismini kiriting!'); return; }
    if (!debtAmount || Number(debtAmount) <= 0) { toast.error('Summani kiriting!'); return; }
    toast.success(`Qarz qo'shildi: ${personName} - ${Number(debtAmount).toLocaleString()} UZS`);
    setShowAdd(false);
    resetForm();
  };

  const handleSaveCredit = () => {
    if (!creditBank.trim()) { toast.error('Bank nomini kiriting!'); return; }
    if (!creditAmount || Number(creditAmount) <= 0) { toast.error('Kredit summasini kiriting!'); return; }
    if (!creditMonthlyPay || Number(creditMonthlyPay) <= 0) { toast.error('Oylik to\'lovni kiriting!'); return; }
    if (!creditRate || Number(creditRate) <= 0) { toast.error('Yillik foizni kiriting!'); return; }
    if (!creditTerm || Number(creditTerm) <= 0) { toast.error('Muddatni kiriting!'); return; }

    const newCredit: Credit = {
      id: String(Date.now()),
      bankName: creditBank,
      loanAmount: Number(creditAmount),
      monthlyPayment: Number(creditMonthlyPay),
      annualRate: Number(creditRate),
      termMonths: Number(creditTerm),
      startDate: creditStartDate || new Date().toISOString().split('T')[0],
      description: creditDesc || undefined,
    };

    setCredits(prev => [...prev, newCredit]);
    toast.success(`Kredit qo'shildi: ${creditBank}`);
    setShowAdd(false);
    resetForm();
  };

  // Live credit calculator preview
  const liveImpact = useMemo(() => {
    const amt = Number(creditAmount) || 0;
    const mp = Number(creditMonthlyPay) || 0;
    const rate = Number(creditRate) || 0;
    const term = Number(creditTerm) || 0;
    const income = Number(creditMonthlyIncome) || 0;
    if (amt > 0 && mp > 0 && term > 0) {
      return calcCreditImpact(amt, mp, rate, term, income);
    }
    return null;
  }, [creditAmount, creditMonthlyPay, creditRate, creditTerm, creditMonthlyIncome]);

  const openCreditDetail = (credit: Credit) => {
    setSelectedCredit(credit);
    setShowCreditDetail(true);
  };

  const selectedImpact = useMemo(() => {
    if (!selectedCredit) return null;
    return calcCreditImpact(selectedCredit.loanAmount, selectedCredit.monthlyPayment, selectedCredit.annualRate, selectedCredit.termMonths, Number(creditMonthlyIncome));
  }, [selectedCredit, creditMonthlyIncome]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Qarzlar & Kreditlar</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Men bergan</p>
            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(totalLent)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Men olgan</p>
            <p className="font-bold text-sm text-destructive">{formatCurrency(totalBorrowed)}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">Kreditlar</p>
            <p className="font-bold text-sm text-orange-600 dark:text-orange-400">{formatCurrency(totalCreditDebt)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
        {(['lent', 'borrowed', 'credits'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            {t === 'lent' ? 'Men bergan' : t === 'borrowed' ? 'Men olgan' : '💳 Kreditlar'}
          </button>
        ))}
      </div>

      {/* Debts List */}
      {tab !== 'credits' && (
        <>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {(tab === 'lent' ? lent : borrowed).map(d => {
              const progress = (d.paidAmount / d.amount) * 100;
              const sc = statusConfig[d.status];
              return (
                <motion.div key={d.id} variants={item}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                            {d.personName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{d.personName}</p>
                            {d.phoneNumber && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{d.phoneNumber}</p>}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                      </div>
                      {d.description && <p className="text-xs text-muted-foreground mb-2">{d.description}</p>}
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{formatCurrency(d.paidAmount)} / {formatCurrency(d.amount)}</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {d.dueDate && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar size={12} />
                          Muddat: {new Date(d.dueDate).toLocaleDateString('uz-UZ')}
                          {d.status === 'overdue' && <AlertTriangle size={12} className="text-destructive ml-1" />}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
          {(tab === 'lent' ? lent : borrowed).length === 0 && (
            <div className="text-center py-16">
              <Check size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Qarz yo'q!</p>
            </div>
          )}
        </>
      )}

      {/* Credits List */}
      {tab === 'credits' && (
        <>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {credits.map(c => {
              const impact = calcCreditImpact(c.loanAmount, c.monthlyPayment, c.annualRate, c.termMonths, Number(creditMonthlyIncome));
              return (
                <motion.div key={c.id} variants={item}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCreditDetail(c)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                            <Landmark size={20} className="text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{c.bankName}</p>
                            <p className="text-xs text-muted-foreground">{c.annualRate}% yillik · {c.termMonths} oy</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${impact.dangerLevel >= 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                          {Math.round(impact.interestPercent)}% ortiqcha
                        </span>
                      </div>
                      {c.description && <p className="text-xs text-muted-foreground mb-2">{c.description}</p>}
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Kredit: {formatCurrency(c.loanAmount)}</span>
                        <span className={`font-bold ${getDangerColor(impact.dangerLevel)}`}>+{formatCurrency(impact.totalInterest)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Oylik: {formatCurrency(c.monthlyPayment)}</span>
                        <span>Jami: {formatCurrency(impact.totalPaid)}</span>
                      </div>
                      {/* Mini danger bar */}
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getDangerBg(impact.dangerLevel)}`} style={{ width: `${Math.min(impact.dangerLevel, 100)}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {credits.length === 0 && (
            <div className="text-center py-16">
              <Check size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Kredit yo'q! 🎉</p>
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          resetForm();
          setAddMode(tab === 'credits' ? 'credit' : 'debt');
          setShowAdd(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center z-50"
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Sheet */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{addMode === 'credit' ? 'Kredit qo\'shish' : 'Qarz qo\'shish'}</SheetTitle>
          </SheetHeader>

          {/* Mode switcher */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl mt-3 mb-4">
            <button onClick={() => setAddMode('debt')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${addMode === 'debt' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
              Qarz
            </button>
            <button onClick={() => setAddMode('credit')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${addMode === 'credit' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
              💳 Kredit
            </button>
          </div>

          {addMode === 'debt' ? (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <button onClick={() => setDebtType('lent')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${debtType === 'lent' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground'}`}>Men berdim</button>
                <button onClick={() => setDebtType('borrowed')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${debtType === 'borrowed' ? 'bg-destructive text-white shadow' : 'text-muted-foreground'}`}>Men oldim</button>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Shaxs ismi</label><Input placeholder="Ism..." value={personName} onChange={e => setPersonName(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Telefon raqami</label><Input placeholder="+998..." value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Summa (UZS)</label><Input type="number" placeholder="0" className="text-xl font-bold h-12" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">To'lov muddati</label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Tavsif</label><Textarea placeholder="Izoh..." rows={2} value={debtDesc} onChange={e => setDebtDesc(e.target.value)} /></div>
              <Button onClick={handleSaveDebt} className="w-full h-12 text-base font-semibold gradient-primary border-0 text-white">Saqlash</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">Bank nomi</label><Input placeholder="Masalan: Ipoteka Bank" value={creditBank} onChange={e => setCreditBank(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Kredit summasi (UZS)</label><Input type="number" placeholder="0" className="text-xl font-bold h-12" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1.5 block">Oylik to'lov</label><Input type="number" placeholder="0" value={creditMonthlyPay} onChange={e => setCreditMonthlyPay(e.target.value)} /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Yillik %</label><Input type="number" placeholder="24" value={creditRate} onChange={e => setCreditRate(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium mb-1.5 block">Muddat (oy)</label><Input type="number" placeholder="36" value={creditTerm} onChange={e => setCreditTerm(e.target.value)} /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Oylik daromad</label><Input type="number" placeholder="8500000" value={creditMonthlyIncome} onChange={e => setCreditMonthlyIncome(e.target.value)} /></div>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Boshlanish sanasi</label><Input type="date" value={creditStartDate} onChange={e => setCreditStartDate(e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Tavsif</label><Textarea placeholder="Nima uchun kredit..." rows={2} value={creditDesc} onChange={e => setCreditDesc(e.target.value)} /></div>

              {/* LIVE Impact Preview */}
              <AnimatePresence>
                {liveImpact && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Card className="border-2 border-dashed border-orange-300 dark:border-orange-700">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertOctagon size={18} className={getDangerColor(liveImpact.dangerLevel)} />
                          <span className={`font-bold text-sm ${getDangerColor(liveImpact.dangerLevel)}`}>{getDangerLabel(liveImpact.dangerLevel)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-muted rounded-lg p-2.5">
                            <p className="text-[10px] text-muted-foreground">Jami to'lov</p>
                            <p className="font-bold">{formatCurrency(liveImpact.totalPaid)}</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">
                            <p className="text-[10px] text-muted-foreground">Ortiqcha (foiz)</p>
                            <p className="font-bold text-destructive">{formatCurrency(liveImpact.totalInterest)}</p>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Foiz uchun sarflanadigan umr:</p>
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-orange-500" />
                            <div>
                              <p className="font-bold text-sm">{Math.round(liveImpact.daysForInterest)} ish kuni</p>
                              <p className="text-[10px] text-muted-foreground">({Math.round(liveImpact.hoursForInterest)} soat · {liveImpact.monthsForInterest.toFixed(1)} oy)</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          ⚠️ Siz bankka <strong className="text-destructive">{formatCurrency(liveImpact.totalInterest)}</strong> ortiqcha to'laysiz — bu kredit summasining <strong>{Math.round(liveImpact.interestPercent)}%</strong>i. 
                          Bu pulni ishlash uchun sizning hayotingizdan <strong className={getDangerColor(liveImpact.dangerLevel)}>{Math.round(liveImpact.daysForInterest)} ish kuni</strong> ketadi.
                        </p>

                        {/* Danger bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Xavf darajasi</span>
                            <span>{Math.round(liveImpact.dangerLevel)}%</span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${liveImpact.dangerLevel}%` }}
                              className={`h-full rounded-full ${getDangerBg(liveImpact.dangerLevel)}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button onClick={handleSaveCredit} className="w-full h-12 text-base font-semibold gradient-primary border-0 text-white">Kreditni saqlash</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Credit Detail Sheet */}
      <Sheet open={showCreditDetail} onOpenChange={setShowCreditDetail}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          {selectedCredit && selectedImpact && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Landmark size={20} />
                  {selectedCredit.bankName}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                {selectedCredit.description && <p className="text-sm text-muted-foreground">{selectedCredit.description}</p>}

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">Kredit summasi</p>
                    <p className="font-bold">{formatCurrency(selectedCredit.loanAmount)}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">Oylik to'lov</p>
                    <p className="font-bold">{formatCurrency(selectedCredit.monthlyPayment)}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">Yillik stavka</p>
                    <p className="font-bold">{selectedCredit.annualRate}%</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">Muddat</p>
                    <p className="font-bold">{selectedCredit.termMonths} oy</p>
                  </div>
                </div>

                {/* IMPACT Analysis */}
                <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Skull size={22} className={getDangerColor(selectedImpact.dangerLevel)} />
                      <div>
                        <p className={`font-bold ${getDangerColor(selectedImpact.dangerLevel)}`}>{getDangerLabel(selectedImpact.dangerLevel)}</p>
                        <p className="text-[10px] text-muted-foreground">Kredit ta'siri tahlili</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Jami to'lanadigan summa</span>
                        <span className="font-bold">{formatCurrency(selectedImpact.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Ortiqcha to'lov (foiz)</span>
                        <span className="font-bold text-destructive">{formatCurrency(selectedImpact.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Ortiqcha foiz %</span>
                        <span className={`font-bold ${getDangerColor(selectedImpact.dangerLevel)}`}>{Math.round(selectedImpact.interestPercent)}%</span>
                      </div>
                    </div>

                    {/* Life cost */}
                    <div className="bg-background rounded-xl p-4">
                      <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-500" />
                        Faqat FOIZ uchun sarflanadigan umringiz:
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className={`text-2xl font-black ${getDangerColor(selectedImpact.dangerLevel)}`}>{liveMonthsFmt(selectedImpact.monthsForInterest)}</p>
                          <p className="text-[10px] text-muted-foreground">oy</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-black ${getDangerColor(selectedImpact.dangerLevel)}`}>{Math.round(selectedImpact.daysForInterest)}</p>
                          <p className="text-[10px] text-muted-foreground">ish kuni</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-black ${getDangerColor(selectedImpact.dangerLevel)}`}>{Math.round(selectedImpact.hoursForInterest)}</p>
                          <p className="text-[10px] text-muted-foreground">soat</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-background rounded-xl p-3">
                      💡 <strong>Bu nima degani?</strong> Siz bankka bepul {Math.round(selectedImpact.daysForInterest)} kun ishlaysiz. Bu vaqtni oilangiz bilan, o'z rivojlanishingiz uchun sarflashingiz mumkin edi. Kredit — bu kelajakdagi vaqtingizni bugungi pul uchun sotishdir.
                    </p>

                    {/* Danger meter */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Xavf darajasi</span>
                        <span className={`font-bold ${getDangerColor(selectedImpact.dangerLevel)}`}>{Math.round(selectedImpact.dangerLevel)}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedImpact.dangerLevel}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${getDangerBg(selectedImpact.dangerLevel)}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly income input for recalc */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Oylik daromadingiz (qayta hisoblash)</label>
                  <Input type="number" value={creditMonthlyIncome} onChange={e => setCreditMonthlyIncome(e.target.value)} placeholder="8500000" />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

function liveMonthsFmt(m: number) {
  return m >= 1 ? m.toFixed(1) : '<1';
}

export default DebtsPage;
