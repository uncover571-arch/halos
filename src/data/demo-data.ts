import { Transaction, Debt, User } from '@/types/models';

export const demoUser: User = {
  id: '1',
  firstName: 'Sardor',
  lastName: 'Rahimov',
  username: 'sardor_r',
  languageCode: 'uz',
  isPremium: false,
};

export const demoTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 8500000, category: 'Maosh', description: 'Oylik maosh', date: '2026-02-10T09:00:00', source: 'app' },
  { id: '2', type: 'expense', amount: 350000, category: 'Oziq-ovqat', description: 'Bozordan xarid', date: '2026-02-09T14:30:00', source: 'app' },
  { id: '3', type: 'expense', amount: 120000, category: 'Transport', description: 'Yandex taxi', date: '2026-02-09T08:15:00', source: 'bot' },
  { id: '4', type: 'expense', amount: 1500000, category: 'Kiyim', description: 'Yangi kurtka', date: '2026-02-08T16:00:00', source: 'app' },
  { id: '5', type: 'income', amount: 2000000, category: 'Freelance', description: 'Web sayt loyiha', date: '2026-02-07T10:00:00', source: 'app' },
  { id: '6', type: 'expense', amount: 80000, category: 'Ko\'ngilochar', description: 'Kino chipta', date: '2026-02-07T19:00:00', source: 'app' },
  { id: '7', type: 'expense', amount: 450000, category: 'Sog\'liq', description: 'Dorixona', date: '2026-02-06T11:00:00', source: 'bot' },
  { id: '8', type: 'expense', amount: 200000, category: 'Ta\'lim', description: 'Udemy kurs', date: '2026-02-05T15:00:00', source: 'app' },
  { id: '9', type: 'income', amount: 500000, category: 'Sovg\'a', description: 'Tug\'ilgan kun', date: '2026-02-04T12:00:00', source: 'app' },
  { id: '10', type: 'expense', amount: 2800000, category: 'Uy-joy', description: 'Kvartira ijarasi', date: '2026-02-01T09:00:00', source: 'app' },
];

export const demoDebts: Debt[] = [
  { id: '1', isLent: true, personName: 'Bobur', amount: 3000000, paidAmount: 1000000, currency: 'UZS', description: 'Telefon uchun', givenDate: '2026-01-15', dueDate: '2026-03-15', status: 'active' },
  { id: '2', isLent: false, personName: 'Jasur', amount: 500000, paidAmount: 0, currency: 'UZS', description: 'Tushlikka', givenDate: '2026-02-01', dueDate: '2026-02-28', status: 'active' },
  { id: '3', isLent: true, personName: 'Dilshod', amount: 1000000, paidAmount: 1000000, currency: 'UZS', description: 'Kurs uchun', givenDate: '2025-12-01', status: 'paid' },
  { id: '4', isLent: false, personName: 'Shoxrux', phoneNumber: '+998901234567', amount: 2000000, paidAmount: 500000, currency: 'UZS', givenDate: '2025-11-01', dueDate: '2026-01-31', status: 'overdue' },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(amount) + ' UZS';
};
