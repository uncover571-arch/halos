import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Phone, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Credit } from '@/types/models';
import { useData } from '@/contexts/DataContext';
import FreedomPlan from '@/components/FreedomPlan';
import ProPromoBanner from '@/components/ProPromoBanner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface DebtsPageProps {
  onNavigate?: (tab: string) => void;
}

const DebtsPage = ({ onNavigate }: DebtsPageProps) => {
  const { debts, addDebt, deleteDebt, credits, addCredit, deleteCredit, isPro } = useData();
  const [tab, setTab] = useState<'lent' | 'borrowed' | 'credits'>('credits');
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
  const [creditDesc, setCreditDesc] = useState('');
  const [creditStartDate, setCreditStartDate] = useState('');

  const lent = debts.filter(d => d.isLent);
  const borrowed = debts.filter(d => !d.isLent);

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

  const handleSaveDebt = async () => {
    if (!personName.trim()) { toast.error('Shaxs ismini kiriting!'); return; }
    if (!debtAmount || Number(debtAmount) <= 0) { toast.error('Summani kiriting!'); return; }
    await addDebt({
      isLent: debtType === 'lent',
      personName: personName.trim(),
      phoneNumber: phoneNumber || undefined,
      amount: Number(debtAmount),
      paidAmount: 0,
      currency: 'UZS',
      description: debtDesc || undefined,
      givenDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || undefined,
      status: 'active',
    });
    toast.success(`Qarz qo'shildi: ${personName} - ${Number(debtAmount).toLocaleString()} UZS`);
    setShowAdd(false);
    resetForm();
  };

  const handleSaveCredit = async () => {
    if (!creditBank.trim()) { toast.error('Bank nomini kiriting!'); return; }
    if (!creditAmount || Number(creditAmount) <= 0) { toast.error('Kredit summasini kiriting!'); return; }
    if (!creditMonthlyPay || Number(creditMonthlyPay) <= 0) { toast.error('Oylik to\'lovni kiriting!'); return; }
    if (!creditRate || Number(creditRate) <= 0) { toast.error('Yillik foizni kiriting!'); return; }
    if (!creditTerm || Number(creditTerm) <= 0) { toast.error('Muddatni kiriting!'); return; }

    if (!isPro && credits.length >= 1) {
      toast.error('Bepul rejada faqat 1 ta kredit qo\'shish mumkin. PRO ga o\'ting!');
      onNavigate?.('pro');
      return;
    }

    await addCredit({
      bankName: creditBank,
      loanAmount: Number(creditAmount),
      monthlyPayment: Number(creditMonthlyPay),
      annualRate: Number(creditRate),
      termMonths: Number(creditTerm),
      startDate: creditStartDate || new Date().toISOString().split('T')[0],
      description: creditDesc || undefined,
    });
    toast.success(`Kredit qo'shildi: ${creditBank}`);
    setShowAdd(false);
    resetForm();
  };

  const openAddCredit = () => {
    resetForm();
    setAddMode('credit');
    setShowAdd(true);
  };

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-4 md:pt-8 max-w-lg md:max-w-3xl mx-auto md:mx-0">
      <h1 className="text-xl font-bold mb-4">Qarzlar & Kreditlar</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-5">
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
        {(['credits', 'lent', 'borrowed'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            {t === 'lent' ? 'Men bergan' : t === 'borrowed' ? 'Men olgan' : '🛡️ Erkinlik Strategiyasi'}
          </button>
        ))}
      </div>

      {/* Pro Banner */}
      {!isPro && tab === 'credits' && (
        <div className="mb-4">
          <ProPromoBanner onNavigatePro={() => onNavigate?.('pro')} message="Cheksiz kredit va to'liq tahlil uchun PRO ga o'ting" />
        </div>
      )}

      {/* Debts List */}
      {tab !== 'credits' && (
        <>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {(tab === 'lent' ? lent : borrowed).map(d => {
              const progress = (d.paidAmount / d.amount) * 100;
              const sc = statusConfig[d.status];
              return (
                <motion.div key={d.id} variants={item}>
                  <Card className="hover:shadow-md transition-shadow group">
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
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                          <button onClick={() => deleteDebt(d.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {/* Freedom Plan */}
      {tab === 'credits' && (
        <FreedomPlan credits={credits} onAddCredit={openAddCredit} />
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          resetForm();
          setAddMode(tab === 'credits' ? 'credit' : 'debt');
          setShowAdd(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center z-50 md:hidden"
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Sheet */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{addMode === 'credit' ? 'Kredit qo\'shish' : 'Qarz qo\'shish'}</SheetTitle>
          </SheetHeader>

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
                <div><label className="text-sm font-medium mb-1.5 block">Boshlanish sanasi</label><Input type="date" value={creditStartDate} onChange={e => setCreditStartDate(e.target.value)} /></div>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Tavsif</label><Textarea placeholder="Nima uchun kredit..." rows={2} value={creditDesc} onChange={e => setCreditDesc(e.target.value)} /></div>
              <Button onClick={handleSaveCredit} className="w-full h-12 text-base font-semibold gradient-primary border-0 text-white">Kreditni saqlash</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DebtsPage;
