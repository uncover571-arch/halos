import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Transaction, Debt, Credit, FreedomPlan, PlanInput, PlanResult, FinancialProfile } from '@/types/models';
import { toast } from 'sonner';

interface DataContextType {
  transactions: Transaction[];
  debts: Debt[];
  credits: Credit[];
  freedomPlan: FreedomPlan;
  dataLoading: boolean;
  isPro: boolean;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
  addTransaction: (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => Promise<void>;
  updateTransaction: (id: string | number, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string | number) => Promise<void>;
  addDebt: (d: Omit<Debt, 'id' | 'paidAmount' | 'status' | 'currency'>) => Promise<void>;
  updateDebt: (id: string | number, d: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string | number) => Promise<void>;
  addCredit: (c: Omit<Credit, 'id'>) => Promise<void>;
  deleteCredit: (id: string) => Promise<void>;
  setFreedomPlan: (plan: FreedomPlan) => Promise<void>;
  // New Backend API Plan
  financialPlan: { profile: FinancialProfile | null; result: PlanResult | null };
  saveFinancialPlan: (input: PlanInput) => Promise<void>;
  refreshData: () => Promise<void>;
  getLivingBudget: () => number;
  getCurrentMonthExpenses: () => number;
  getRemainingBudget: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // ... existing state ...
  const { user } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [freedomPlan, setFreedomPlanState] = useState<FreedomPlan>({
    monthlyIncome: 0,
    mandatoryExpenses: [],
    isSetup: false,
  });

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0
  });

  const [financialPlan, setFinancialPlan] = useState<{ profile: FinancialProfile | null; result: PlanResult | null }>({
    profile: null,
    result: null
  });

  // ... (API URL setup) ...
  const AUTH_API_URL_RAW = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000';
  const API_BASE_URL = AUTH_API_URL_RAW.endsWith('/auth')
    ? AUTH_API_URL_RAW.slice(0, -5)
    : AUTH_API_URL_RAW;

  const AUTH_API_URL = API_BASE_URL;

  const getTelegramId = () => {
    return user?.user_metadata?.telegram_id;
  };

  // ... (loadAll function) ... 

  // Helper calculations
  const getLivingBudget = () => {
    if (!freedomPlan.isSetup) return 0;
    // 70% of income minus mandatory expenses? 
    // Logic from FreedomPlan.tsx: 
    // remaining = income - mandatory
    // living = remaining * 0.7
    const totalMandatory = freedomPlan.mandatoryExpenses.reduce((s, e) => s + e.amount, 0);
    // Note: credits are separate in FreedomPlan.tsx, here we might need to fetch them or pass them.
    // For simplicity, let's assume mandatoryExpenses includes everything or use simplified logic for now.
    // Actually, let's follow FreedomPlan logic:
    // We don't have credits inside freedomPlan state here easily without recalculating.
    // But we have `credits` state.
    const totalCredits = credits.reduce((s, c) => s + c.monthlyPayment, 0);
    const remaining = freedomPlan.monthlyIncome - (totalMandatory + totalCredits);
    return Math.max(0, Math.round(remaining * 0.7));
  };

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, t) => s + t.amount, 0);
  };

  const getRemainingBudget = () => {
    return getLivingBudget() - getCurrentMonthExpenses();
  };

  // ... (useEffect and API functions) ...
  // Inside DataContext.Provider value:
  /*
      financialPlan, saveFinancialPlan,
      getLivingBudget, getCurrentMonthExpenses, getRemainingBudget
  */


  const loadAll = async () => {
    if (!user) {
      console.log('[DataContext] No user, resetting data');
      setTransactions([]);
      setDebts([]);
      setSummary({ totalIncome: 0, totalExpense: 0, balance: 0, monthlyIncome: 0, monthlyExpense: 0 });
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      const telegramId = getTelegramId();
      console.log('[DataContext] Loading data for user:', {
        userId: user.id,
        telegramId,
        user_metadata: user.user_metadata,
        AUTH_API_URL
      });

      if (telegramId && AUTH_API_URL) {
        try {
          // 0. Load User Profile (Check PRO)
          const profileUrl = `${AUTH_API_URL}/user/profile?telegram_id=${telegramId}`;
          const profileRes = await fetch(profileUrl);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.user) {
              setIsPro(profileData.user.is_premium || false);
            }
          }

          // 1. Transactions (Latest 1000)
          const txUrl = `${AUTH_API_URL}/transactions?telegram_id=${telegramId}&limit=1000`;
          const txRes = await fetch(txUrl);
          if (txRes.ok) {
            const txData = await txRes.json();
            const txArray = Array.isArray(txData) ? txData : (txData.transactions || []);
            const categoryMap: Record<string, string> = {
              'oziq_ovqat': 'Oziq-ovqat',
              'transport': 'Transport',
              'uy_joy': 'Uy-joy',
              'kommunal': 'Kommunal',
              'sog\'liq': 'Sog\'liq',
              'kiyim': 'Kiyim',
              'ta\'lim': 'Ta\'lim',
              'ko\'ngilochar': 'Ko\'ngilochar',
              'aloqa': 'Aloqa',
              'kredit': 'Kredit',
              'ish_haqi': 'Maosh',
              'biznes': 'Freelance',
              'investitsiya': 'Investitsiya',
              'sovg\'a': 'Sovg\'a',
              'boshqa': 'Boshqa'
            };

            const mappedTxs = txArray.map((tx: any) => ({
              id: tx.id,
              type: tx.type,
              amount: tx.amount,
              category: categoryMap[tx.category] || tx.category,
              description: tx.description,
              date: tx.date || tx.created_at,
              source: tx.source || 'bot'
            }));
            setTransactions(mappedTxs);
          }

          // 2. Summary (All time & this month)
          const summaryAllUrl = `${AUTH_API_URL}/transactions/summary?telegram_id=${telegramId}&period=all`;
          const summaryMonthUrl = `${AUTH_API_URL}/transactions/summary?telegram_id=${telegramId}&period=month`;
          const [summaryAllRes, summaryMonthRes] = await Promise.all([
            fetch(summaryAllUrl),
            fetch(summaryMonthUrl)
          ]);

          const newSummary = { totalIncome: 0, totalExpense: 0, balance: 0, monthlyIncome: 0, monthlyExpense: 0 };

          if (summaryAllRes.ok) {
            const allData = await summaryAllRes.json();
            newSummary.totalIncome = allData.total_income || 0;
            newSummary.totalExpense = allData.total_expense || 0;
            newSummary.balance = (allData.total_income || 0) - (allData.total_expense || 0);
          }

          if (summaryMonthRes.ok) {
            const monthData = await summaryMonthRes.json();
            newSummary.monthlyIncome = monthData.total_income || 0;
            newSummary.monthlyExpense = monthData.total_expense || 0;
          }
          setSummary(newSummary);

          // 3. Debts
          const debtsUrl = `${AUTH_API_URL}/debts?telegram_id=${telegramId}`;
          const debtsRes = await fetch(debtsUrl);
          if (debtsRes.ok) {
            const debtsData = await debtsRes.json();
            const debtsArray = Array.isArray(debtsData) ? debtsData : (debtsData.debts || []);
            const mappedDebts = debtsArray.map((d: any) => ({
              id: d.id,
              isLent: d.is_lent,
              personName: d.person_name,
              phoneNumber: d.phone_number,
              amount: d.amount,
              paidAmount: d.paid_amount,
              currency: d.currency,
              description: d.description,
              givenDate: d.given_date,
              dueDate: d.due_date,
              status: d.status
            }));
            setDebts(mappedDebts);
          }

          // 4. Financial Plan
          const planUrl = `${AUTH_API_URL}/plan/current?telegram_id=${telegramId}`;
          const planRes = await fetch(planUrl);
          if (planRes.ok) {
            const planData = await planRes.json();
            setFinancialPlan({
              profile: planData.profile,
              result: planData.result
            });
          }

        } catch (e) {
          console.error('[DataContext] Auth API Load Error:', e);
          toast.error("Ma'lumotlarni yuklashda xatolik (API)");
        }
      } else {
        console.warn('[DataContext] No telegram ID or AUTH_API_URL!');
        setTransactions([]);
        setDebts([]);
      }

      // 5. Load Credits from Supabase (App specific)
      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (creditsData) {
        setCredits(creditsData.map((c: any) => ({
          id: c.id,
          bankName: c.bank_name,
          loanAmount: c.loan_amount,
          monthlyPayment: c.monthly_payment,
          annualRate: c.annual_rate,
          termMonths: c.term_months,
          startDate: c.start_date,
          description: c.description
        })));
      }

      // 6. Load Freedom Plan from Supabase (Legacy)
      const { data: fpData } = await supabase
        .from('freedom_plans')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fpData) {
        setFreedomPlanState({
          monthlyIncome: fpData.monthly_income,
          mandatoryExpenses: typeof fpData.mandatory_expenses === 'string'
            ? JSON.parse(fpData.mandatory_expenses)
            : fpData.mandatory_expenses,
          isSetup: fpData.is_setup
        });
      }

    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user]);

  const refreshData = async () => {
    await loadAll();
  };

  // --- Transactions ---
  const addTransaction = async (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    try {
      const telegramId = getTelegramId();
      if (telegramId && AUTH_API_URL) {
        const payload = {
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date || new Date().toISOString(),
          telegram_id: telegramId,
          source: 'app'
        };
        const res = await fetch(`${AUTH_API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('API Error');
        await refreshData();
        toast.success("Tranzaksiya qo'shildi");
      } else {
        toast.error("Telegram bilan ulanmagan!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi");
    }
  };

  const updateTransaction = async (id: string | number, t: Partial<Transaction>) => {
    toast.info("Tahrirlash hozircha mavjud emas");
  };

  const deleteTransaction = async (id: string | number) => {
    try {
      const telegramId = getTelegramId();
      if (telegramId && AUTH_API_URL) {
        await fetch(`${AUTH_API_URL}/transactions/${id}?telegram_id=${telegramId}`, { method: 'DELETE' });
        await refreshData();
        toast.success("O'chirildi");
      }
    } catch (e) {
      toast.error("O'chirishda xatolik");
    }
  };

  // --- Debts ---
  const addDebt = async (d: Omit<Debt, 'id' | 'paidAmount' | 'status' | 'currency'>) => {
    try {
      const telegramId = getTelegramId();
      if (telegramId && AUTH_API_URL) {
        const payload = {
          telegram_id: telegramId,
          is_lent: d.isLent,
          person_name: d.personName,
          amount: d.amount,
          phone_number: d.phoneNumber,
          description: d.description,
          given_date: d.givenDate,
          due_date: d.dueDate
        };
        const res = await fetch(`${AUTH_API_URL}/debts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('API Error');
        await refreshData();
        toast.success("Qarz qo'shildi");
      }
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const updateDebt = async (id: string | number, d: Partial<Debt>) => {
    try {
      const telegramId = getTelegramId();
      if (telegramId && AUTH_API_URL) {
        const payload: any = { telegram_id: telegramId };
        if (d.amount) payload.amount = d.amount;
        if (d.personName) payload.person_name = d.personName;
        await fetch(`${AUTH_API_URL}/debts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await refreshData();
        toast.success("Yangilandi");
      }
    } catch (e) {
      toast.error("Xatolik");
    }
  };

  const deleteDebt = async (id: string | number) => {
    try {
      const telegramId = getTelegramId();
      if (telegramId && AUTH_API_URL) {
        await fetch(`${AUTH_API_URL}/debts/${id}?telegram_id=${telegramId}`, { method: 'DELETE' });
        await refreshData();
        toast.success("O'chirildi");
      }
    } catch (e) { toast.error("Xatolik"); }
  };

  // --- Credits (Supabase) ---
  const addCredit = async (c: Omit<Credit, 'id'>) => {
    if (!user) return;
    const { error } = await supabase.from('credits').insert({
      user_id: user.id,
      bank_name: c.bankName,
      loan_amount: c.loanAmount,
      monthly_payment: c.monthlyPayment,
      annual_rate: c.annualRate,
      term_months: c.termMonths,
      start_date: c.startDate,
      description: c.description
    });
    if (error) { toast.error(error.message); return; }
    await refreshData();
    toast.success("Kredit qo'shildi");
  };

  const deleteCredit = async (id: string) => {
    await supabase.from('credits').delete().eq('id', id);
    await refreshData();
    toast.success("O'chirildi");
  };

  // --- Freedom Plan ---
  const setFreedomPlan = async (plan: FreedomPlan) => {
    if (!user) return;
    const { error } = await supabase.from('freedom_plans').upsert({
      user_id: user.id,
      monthly_income: plan.monthlyIncome,
      mandatory_expenses: plan.mandatoryExpenses,
      is_setup: plan.isSetup,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) toast.error("Xatolik (Plan)");
    else {
      setFreedomPlanState(plan);
      toast.success("Reja saqlandi");
    }
  };

  const saveFinancialPlan = async (input: PlanInput) => {
    try {
      const telegramId = getTelegramId();
      if (telegramId && AUTH_API_URL) {
        const res = await fetch(`${AUTH_API_URL}/plan/calculate?telegram_id=${telegramId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        if (res.ok) {
          const result = await res.json();
          setFinancialPlan(prev => ({ ...prev, result }));
          await refreshData();
          toast.success("Reja hisoblandi va saqlandi");
        } else {
          toast.error("Hisoblashda xatolik");
        }
      } else {
        toast.error("Telegramga ulanmagan");
      }
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <DataContext.Provider value={{
      transactions, debts, credits, freedomPlan, dataLoading, summary, isPro,
      addTransaction, updateTransaction, deleteTransaction,
      addDebt, updateDebt, deleteDebt,
      addCredit, deleteCredit,
      setFreedomPlan, refreshData,
      financialPlan, saveFinancialPlan,
      getLivingBudget, getCurrentMonthExpenses, getRemainingBudget
    }}>
      {children}
    </DataContext.Provider>
  );
};
