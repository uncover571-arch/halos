import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'uz' | 'ru' | 'en';
type Currency = 'UZS' | 'USD' | 'EUR' | 'RUB';

interface AppSettings {
  theme: Theme;
  language: Language;
  currency: Currency;
  notifications: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  setNotifications: (enabled: boolean) => void;
}

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
};

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('halos-theme') as Theme) || 'light');
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('halos-lang') as Language) || 'uz');
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem('halos-currency') as Currency) || 'UZS');
  const [notifications, setNotificationsState] = useState(() => localStorage.getItem('halos-notif') !== 'false');

  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem('halos-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setLanguage = (l: Language) => { setLanguageState(l); localStorage.setItem('halos-lang', l); };
  const setCurrency = (c: Currency) => { setCurrencyState(c); localStorage.setItem('halos-currency', c); };
  const setNotifications = (n: boolean) => { setNotificationsState(n); localStorage.setItem('halos-notif', String(n)); };

  return (
    <AppSettingsContext.Provider value={{ theme, language, currency, notifications, setTheme, setLanguage, setCurrency, setNotifications }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
