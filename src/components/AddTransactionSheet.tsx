import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/models';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTransactionSheet = ({ open, onOpenChange }: Props) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSave = () => {
    onOpenChange(false);
    setAmount('');
    setCategory('');
    setDescription('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tranzaksiya qo'shish</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 py-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground'}`}
            >
              Kirim
            </button>
            <button
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === 'expense' ? 'bg-destructive text-white shadow' : 'text-muted-foreground'}`}
            >
              Chiqim
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Summa (UZS)</label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="text-2xl font-bold h-14 text-center"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">Kategoriya</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(c => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all ${category === c.name ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted hover:bg-accent'}`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <span className="font-medium truncate w-full text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tavsif</label>
            <Textarea
              placeholder="Izoh qo'shing..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full h-12 text-base font-semibold gradient-primary border-0 text-white">
            Saqlash
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
