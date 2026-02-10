import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { demoTransactions, formatCurrency } from '@/data/demo-data';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/models';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const TransactionsPage = () => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filtered = demoTransactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search && !t.category.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, t) => {
    const d = new Date(t.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {});

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Tranzaksiyalar</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {([['all', 'Hammasi'], ['income', 'Kirim'], ['expense', 'Chiqim']] as const).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === k ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {Object.entries(grouped).map(([date, txs]) => (
          <motion.div key={date} variants={item}>
            <p className="text-xs text-muted-foreground font-medium mb-2">{date}</p>
            <div className="space-y-2">
              {txs.map(t => {
                const cat = allCategories.find(c => c.name === t.category);
                return (
                  <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-muted">
                        {cat?.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t.category}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter size={48} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Tranzaksiya topilmadi</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
