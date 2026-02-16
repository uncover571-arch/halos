export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string | number;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  source: 'app' | 'bot';
}

export type DebtStatus = 'active' | 'paid' | 'overdue';

export interface Debt {
  id: string | number;
  isLent: boolean;
  personName: string;
  phoneNumber?: string | null;
  amount: number;
  paidAmount: number;
  currency: string;
  description?: string;
  givenDate: string;
  dueDate?: string;
  status: DebtStatus;
}

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  phoneNumber?: string;
  languageCode: string;
  isPremium: boolean;
}

export const EXPENSE_CATEGORIES = [
  { name: 'Oziq-ovqat', icon: '🍕', color: 'hsl(15 80% 55%)' },
  { name: 'Transport', icon: '🚗', color: 'hsl(217 91% 60%)' },
  { name: 'Uy-joy', icon: '🏠', color: 'hsl(142 71% 45%)' },
  { name: 'Kommunal', icon: '💡', color: 'hsl(199 89% 48%)' },
  { name: 'Aloqa', icon: '📱', color: 'hsl(180 70% 45%)' },
  { name: 'Kiyim', icon: '👕', color: 'hsl(280 80% 60%)' },
  { name: 'Sog\'liq', icon: '💊', color: 'hsl(0 84% 60%)' },
  { name: 'Ta\'lim', icon: '📚', color: 'hsl(38 92% 50%)' },
  { name: 'Ko\'ngilochar', icon: '🎮', color: 'hsl(239 84% 67%)' },
  { name: 'Kredit', icon: '💳', color: 'hsl(330 70% 50%)' },
  { name: 'Boshqa', icon: 'Box', color: 'hsl(230 10% 50%)' },
] as const;

export const INCOME_CATEGORIES = [
  { name: 'Maosh', icon: '💰', color: 'hsl(142 71% 45%)' },
  { name: 'Freelance', icon: '💻', color: 'hsl(217 91% 60%)' },
  { name: 'Investitsiya', icon: '📈', color: 'hsl(239 84% 67%)' },
  { name: 'Sovg\'a', icon: '🎁', color: 'hsl(280 80% 60%)' },
  { name: 'Boshqa', icon: '📦', color: 'hsl(230 10% 50%)' },
] as const;

export interface Credit {
  id: string;
  bankName: string;
  loanAmount: number;
  monthlyPayment: number;
  annualRate: number;
  termMonths: number;
  startDate: string;
  description?: string;
}

export interface MandatoryExpense {
  id: string;
  name: string;
  amount: number;
  icon: string;
}

// Backend API compatible types
export interface PlanInput {
  income_self: number;
  income_partner: number;
  rent: number;
  kindergarten: number;
  utilities: number;
  loan_payment: number;
  total_debt: number;
}

export interface FinancialProfile {
  id: number;
  user_id: number;
  income_self: number;
  income_partner: number;
  rent: number;
  kindergarten: number;
  utilities: number;
  loan_payment: number;
  total_debt: number;
  updated_at: string;
}

export interface PlanResult {
  mode: 'debt' | 'wealth' | 'negative';
  total_income: number;
  mandatory_living: number;
  mandatory_debt: number;
  free_cash: number;

  // Recommendations
  monthly_savings: number;
  monthly_debt_payment: number;
  monthly_invest: number;
  monthly_living_extra: number;

  // Projections
  exit_months: number;
  exit_date: string | null; // "YYYY-MM"
  simple_exit_months?: number;
  simple_exit_date?: string | null;
  months_saved?: number;

  savings_12_months: number;
  savings_at_exit: number;
  invest_12_months?: number;
  total_12_months?: number;
}

// Legacy FreedomPlan (can be removed later if not needed)
export interface FreedomPlan {
  monthlyIncome: number;
  mandatoryExpenses: MandatoryExpense[];
  isSetup: boolean;
  result?: PlanResult;
  profile?: FinancialProfile;
}

export const DEFAULT_MANDATORY_EXPENSES: Omit<MandatoryExpense, 'id' | 'amount'>[] = [
  { name: 'Uy ijarasi', icon: '🏠' },
  { name: 'Kommunal', icon: '💡' },
  { name: 'Bog\'cha / Maktab', icon: '👶' },
  { name: 'Internet / Tel', icon: '📱' },
  { name: 'Sug\'urta', icon: '🛡️' },
  { name: 'Boshqa majburiy', icon: '📋' },
];
