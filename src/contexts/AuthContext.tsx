import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as AppUser } from '@/types/models';

// Extend the AppUser with metadata for our internal use
interface AuthUser extends AppUser {
  user_metadata?: {
    telegram_id?: number;
    username?: string;
    avatar_url?: string;
  };
}

interface TelegramUser {
  id?: number;
  telegram_id?: number;
  first_name: string;
  last_name?: string;
  telegram_username?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithTelegram: (telegramUser: TelegramUser, token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('AUTH_TOKEN');
        const storedUser = localStorage.getItem('AUTH_USER');

        console.log('[AuthContext] checkAuth - storedToken exists:', !!storedToken);
        console.log('[AuthContext] checkAuth - storedUser:', storedUser);

        if (storedToken && storedUser) {
          const parsed = JSON.parse(storedUser);
          console.log('[AuthContext] checkAuth - parsed user:', parsed);
          console.log('[AuthContext] checkAuth - telegram_id:', parsed?.user_metadata?.telegram_id);
          setUser(parsed);
        }
      } catch (error) {
        console.error("[AuthContext] Auth check failed:", error);
        localStorage.removeItem('AUTH_TOKEN');
        localStorage.removeItem('AUTH_USER');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signInWithTelegram = (telegramUser: TelegramUser, token: string) => {
    console.log('[AuthContext] signInWithTelegram called with:', { telegramUser, token: token?.slice(0, 20) + '...' });

    // Determine telegram ID
    const tgId = telegramUser.telegram_id || telegramUser.id;
    console.log('[AuthContext] Determined telegram ID:', tgId);

    // Create user object compatible with our App
    const newUser: AuthUser = {
      id: tgId?.toString() || '0',
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name || '',
      username: telegramUser.telegram_username || telegramUser.username || '',
      languageCode: telegramUser.language_code || 'uz',
      isPremium: telegramUser.is_premium || false,
      user_metadata: {
        telegram_id: tgId,
        username: telegramUser.telegram_username || telegramUser.username
      }
    };

    console.log('[AuthContext] Created user object:', newUser);

    // Save to local storage
    localStorage.setItem('AUTH_TOKEN', token);
    localStorage.setItem('AUTH_USER', JSON.stringify(newUser));

    console.log('[AuthContext] Saved to localStorage. Verification:', {
      savedToken: !!localStorage.getItem('AUTH_TOKEN'),
      savedUser: localStorage.getItem('AUTH_USER')
    });

    // Update state
    setUser(newUser);
    setLoading(false);
  };

  const signOut = () => {
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('AUTH_USER');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithTelegram, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
