export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  source: 'app' | 'bot';
}

export type DebtStatus = 'active' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  isLent: boolean;
  personName: string;
  phoneNumber?: string;
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
  { name: 'Kiyim', icon: '👕', color: 'hsl(280 80% 60%)' },
  { name: 'Sog\'liq', icon: '💊', color: 'hsl(0 84% 60%)' },
  { name: 'Ta\'lim', icon: '📚', color: 'hsl(38 92% 50%)' },
  { name: 'Ko\'ngilochar', icon: '🎮', color: 'hsl(239 84% 67%)' },
  { name: 'Boshqa', icon: '📦', color: 'hsl(230 10% 50%)' },
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

export const DEFAULT_MANDATORY_EXPENSES: Omit<MandatoryExpense, 'id' | 'amount'>[] = [
  { name: 'Uy ijarasi', icon: '🏠' },
  { name: 'Kommunal', icon: '💡' },
  { name: 'Bog\'cha / Maktab', icon: '👶' },
  { name: 'Internet / Tel', icon: '📱' },
  { name: 'Sug\'urta', icon: '🛡️' },
  { name: 'Boshqa majburiy', icon: '📋' },
];
