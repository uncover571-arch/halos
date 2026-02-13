import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  // Use localStorage as defaults until Supabase loads
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('halos-theme') as Theme) || 'light');
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('halos-lang') as Language) || 'uz');
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem('halos-currency') as Currency) || 'UZS');
  const [notifications, setNotificationsState] = useState(() => localStorage.getItem('halos-notif') !== 'false');

  // Load settings from Supabase when user is available
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('theme, language, currency, notifications')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setThemeState((data.theme as Theme) || 'light');
        setLanguageState((data.language as Language) || 'uz');
        setCurrencyState((data.currency as Currency) || 'UZS');
        setNotificationsState(data.notifications ?? true);
      }
    };

    loadSettings();
  }, [user]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem('halos-theme', theme);
  }, [theme]);

  // Helper to save a single setting to Supabase
  const saveSetting = async (field: string, value: any) => {
    if (!user) return;
    await supabase
      .from('user_settings')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('halos-theme', t);
    saveSetting('theme', t);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('halos-lang', l);
    saveSetting('language', l);
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('halos-currency', c);
    saveSetting('currency', c);
  };

  const setNotifications = (n: boolean) => {
    setNotificationsState(n);
    localStorage.setItem('halos-notif', String(n));
    saveSetting('notifications', n);
  };

  return (
    <AppSettingsContext.Provider value={{ theme, language, currency, notifications, setTheme, setLanguage, setCurrency, setNotifications }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
