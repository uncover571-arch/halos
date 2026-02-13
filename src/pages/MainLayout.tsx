import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Receipt, Plus, Handshake, User, Crown, BarChart3, Target } from 'lucide-react';
import HomePage from '@/pages/HomePage';
import TransactionsPage from '@/pages/TransactionsPage';
import DebtsPage from '@/pages/DebtsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ProfilePage from '@/pages/ProfilePage';
import ProPage from '@/pages/ProPage';
import FreedomPlanPage from '@/pages/FreedomPlanPage';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'home' | 'transactions' | 'add' | 'debts' | 'analytics' | 'profile' | 'pro' | 'plan';

const navItems = [
  { id: 'home' as Tab, label: 'Asosiy', icon: Home },
  { id: 'plan' as Tab, label: 'Erkinlik', icon: Target },
  { id: 'transactions' as Tab, label: 'Tranzaksiyalar', icon: Receipt },
  { id: 'analytics' as Tab, label: 'Statistika', icon: BarChart3 },
  { id: 'debts' as Tab, label: 'Qarzlar', icon: Handshake },
  { id: 'profile' as Tab, label: 'Profil', icon: User },
];

const mobileNavItems = [
  { id: 'home' as Tab, label: 'Asosiy', icon: Home },
  { id: 'plan' as Tab, label: 'Erkinlik', icon: Target },
  { id: 'transactions' as Tab, label: 'O\'tqazmalar', icon: Receipt },
  { id: 'add' as Tab, label: '', icon: Plus },
  { id: 'debts' as Tab, label: 'Qarzlar', icon: Handshake },
  { id: 'profile' as Tab, label: 'Profil', icon: User },
];

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAdd, setShowAdd] = useState(false);
  const { isPro } = useData();
  const { user } = useAuth();

  const navigateTo = (tab: string) => setActiveTab(tab as Tab);

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage onNavigate={navigateTo} />;
      case 'plan': return <FreedomPlanPage onNavigate={navigateTo} />;
      case 'transactions': return <TransactionsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'debts': return <DebtsPage onNavigate={navigateTo} />;
      case 'profile': return <ProfilePage onNavigate={navigateTo} />;
      case 'pro': return <ProPage />;
      default: return <HomePage onNavigate={navigateTo} />;
    }
  };

  const handleTabClick = (tab: Tab) => {
    if (tab === 'add') {
      setShowAdd(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-border bg-card/50 backdrop-blur-sm fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-6 pb-4">
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="text-gradient-primary">Halos</span>
            {isPro && <span className="text-[10px] px-1.5 py-0.5 rounded-full gradient-purple text-white font-medium">PRO</span>}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Moliyaviy boshqaruv</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Add Transaction Button */}
        <div className="px-3 mb-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg"
          >
            <Plus size={20} />
            <span>Tranzaksiya qo'shish</span>
          </motion.button>
        </div>

        {/* PRO Upgrade */}
        {!isPro && (
          <div className="px-3 mb-4">
            <button
              onClick={() => setActiveTab('pro')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50 border border-primary/20 hover:border-primary/40 transition-all"
            >
              <Crown size={18} className="text-primary" />
              <div className="text-left">
                <p className="text-xs font-semibold">Halos PRO</p>
                <p className="text-[10px] text-muted-foreground">Erkinlik Strategiyasi</p>
              </div>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground">© 2026 Halos v1.0</p>
          <p className="text-[9px] text-muted-foreground/50 mt-1 font-mono">
            ID: {user?.user_metadata?.telegram_id || 'Not Connected'}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 lg:ml-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation — hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-50 md:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {mobileNavItems.map(tab => {
            const isAdd = tab.id === 'add';
            const isActive = activeTab === tab.id;

            if (isAdd) {
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleTabClick(tab.id)}
                  className="w-12 h-12 -mt-5 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center"
                >
                  <Plus size={24} />
                </motion.button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && <motion.div layoutId="tab-dot" className="w-1 h-1 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <AddTransactionSheet open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
};

export default MainLayout;
