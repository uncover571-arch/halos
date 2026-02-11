import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, Debt, Credit, MandatoryExpense } from '@/types/models';

interface FreedomPlanData {
  monthlyIncome: number;
  mandatoryExpenses: MandatoryExpense[];
  isSetup: boolean;
}

interface DataContextType {
  // Transactions
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Debts
  debts: Debt[];
  addDebt: (d: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Credits
  credits: Credit[];
  addCredit: (c: Omit<Credit, 'id'>) => void;
  deleteCredit: (id: string) => void;

  // Freedom Plan
  freedomPlan: FreedomPlanData;
  setFreedomPlan: (data: FreedomPlanData) => void;

  // Pro status
  isPro: boolean;
  setIsPro: (v: boolean) => void;

  // Budget helpers
  getCurrentMonthExpenses: () => number;
  getLivingBudget: () => number;
  getRemainingBudget: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadJSON('halos-transactions', []));
  const [debts, setDebts] = useState<Debt[]>(() => loadJSON('halos-debts', []));
  const [credits, setCredits] = useState<Credit[]>(() => loadJSON('halos-credits', []));
  const [freedomPlan, setFreedomPlanState] = useState<FreedomPlanData>(() => loadJSON('halos-freedom-plan', { monthlyIncome: 0, mandatoryExpenses: [], isSetup: false }));
  const [isPro, setIsProState] = useState(() => loadJSON('halos-is-pro', false));

  // Persist
  useEffect(() => { localStorage.setItem('halos-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('halos-debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('halos-credits', JSON.stringify(credits)); }, [credits]);
  useEffect(() => { localStorage.setItem('halos-freedom-plan', JSON.stringify(freedomPlan)); }, [freedomPlan]);
  useEffect(() => { localStorage.setItem('halos-is-pro', JSON.stringify(isPro)); }, [isPro]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  };
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const addDebt = (d: Omit<Debt, 'id'>) => setDebts(prev => [{ ...d, id: crypto.randomUUID() }, ...prev]);
  const updateDebt = (id: string, updates: Partial<Debt>) => setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const deleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));

  const addCredit = (c: Omit<Credit, 'id'>) => setCredits(prev => [{ ...c, id: crypto.randomUUID() }, ...prev]);
  const deleteCredit = (id: string) => setCredits(prev => prev.filter(c => c.id !== id));

  const setFreedomPlan = (data: FreedomPlanData) => setFreedomPlanState(data);
  const setIsPro = (v: boolean) => setIsProState(v);

  const getCurrentMonthExpenses = useCallback(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const getLivingBudget = useCallback(() => {
    if (!freedomPlan.isSetup || freedomPlan.monthlyIncome <= 0) return 0;
    const totalMandatory = freedomPlan.mandatoryExpenses.reduce((s, e) => s + e.amount, 0);
    const totalCreditPayments = credits.reduce((s, c) => s + c.monthlyPayment, 0);
    const remaining = freedomPlan.monthlyIncome - totalMandatory - totalCreditPayments;
    return Math.max(0, Math.round(remaining * 0.70));
  }, [freedomPlan, credits]);

  const getRemainingBudget = useCallback(() => {
    return getLivingBudget() - getCurrentMonthExpenses();
  }, [getLivingBudget, getCurrentMonthExpenses]);

  return (
    <DataContext.Provider value={{
      transactions, addTransaction, deleteTransaction,
      debts, addDebt, updateDebt, deleteDebt,
      credits, addCredit, deleteCredit,
      freedomPlan, setFreedomPlan,
      isPro, setIsPro,
      getCurrentMonthExpenses, getLivingBudget, getRemainingBudget,
    }}>
      {children}
    </DataContext.Provider>
  );
};
