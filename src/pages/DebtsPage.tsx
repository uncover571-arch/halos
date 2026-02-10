import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Phone, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { demoDebts, formatCurrency } from '@/data/demo-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const DebtsPage = () => {
  const [tab, setTab] = useState<'lent' | 'borrowed'>('lent');
  const [showAdd, setShowAdd] = useState(false);
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [debtDesc, setDebtDesc] = useState('');

  const lent = demoDebts.filter(d => d.isLent);
  const borrowed = demoDebts.filter(d => !d.isLent);
  const current = tab === 'lent' ? lent : borrowed;

  const totalLent = lent.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const totalBorrowed = borrowed.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0);

  const statusConfig = {
    active: { label: 'Aktiv', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    paid: { label: "To'langan", color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    overdue: { label: "Muddati o'tgan", color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  };

  const resetForm = () => {
    setPersonName(''); setPhoneNumber(''); setDebtAmount(''); setDueDate(''); setDebtDesc('');
  };

  const handleSaveDebt = () => {
    if (!personName.trim()) { toast.error('Shaxs ismini kiriting!'); return; }
    if (!debtAmount || Number(debtAmount) <= 0) { toast.error('Summani kiriting!'); return; }
    toast.success(`Qarz qo'shildi: ${personName} - ${Number(debtAmount).toLocaleString()} UZS`);
    setShowAdd(false);
    resetForm();
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Qarzlar</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Men bergan</p>
            <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(totalLent)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Men olgan</p>
            <p className="font-bold text-lg text-destructive">{formatCurrency(totalBorrowed)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl mb-5">
        <button onClick={() => setTab('lent')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'lent' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
          Men bergan
        </button>
        <button onClick={() => setTab('borrowed')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'borrowed' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
          Men olgan
        </button>
      </div>

      {/* List */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {current.map(d => {
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

      {current.length === 0 && (
        <div className="text-center py-16">
          <Check size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Qarz yo'q!</p>
        </div>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { resetForm(); setShowAdd(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center z-50"
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Debt Sheet */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle>Qarz qo'shish</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setDebtType('lent')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${debtType === 'lent' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground'}`}
              >
                Men berdim
              </button>
              <button
                onClick={() => setDebtType('borrowed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${debtType === 'borrowed' ? 'bg-destructive text-white shadow' : 'text-muted-foreground'}`}
              >
                Men oldim
              </button>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Shaxs ismi</label><Input placeholder="Ism..." value={personName} onChange={e => setPersonName(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Telefon raqami</label><Input placeholder="+998..." value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Summa (UZS)</label><Input type="number" placeholder="0" className="text-xl font-bold h-12" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1.5 block">To'lov muddati</label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Tavsif</label><Textarea placeholder="Izoh..." rows={2} value={debtDesc} onChange={e => setDebtDesc(e.target.value)} /></div>
            <Button onClick={handleSaveDebt} className="w-full h-12 text-base font-semibold gradient-primary border-0 text-white">Saqlash</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DebtsPage;
