import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Receipt, Plus, Handshake, User, Crown } from 'lucide-react';
import HomePage from '@/pages/HomePage';
import TransactionsPage from '@/pages/TransactionsPage';
import DebtsPage from '@/pages/DebtsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ProfilePage from '@/pages/ProfilePage';
import HalosProPage from '@/pages/HalosProPage';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';

type Tab = 'home' | 'transactions' | 'add' | 'debts' | 'profile' | 'pro';

const tabs = [
  { id: 'home' as Tab, label: 'Asosiy', icon: Home },
  { id: 'transactions' as Tab, label: 'Tranzaksiyalar', icon: Receipt },
  { id: 'add' as Tab, label: '', icon: Plus },
  { id: 'debts' as Tab, label: 'Qarzlar', icon: Handshake },
  { id: 'profile' as Tab, label: 'Profil', icon: User },
];

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAdd, setShowAdd] = useState(false);

  const navigateTo = (tab: string) => setActiveTab(tab as Tab);

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage onNavigate={navigateTo} />;
      case 'transactions': return <TransactionsPage />;
      case 'debts': return <DebtsPage onNavigate={navigateTo} />;
      case 'profile': return <ProfilePage onNavigate={navigateTo} />;
      case 'pro': return <HalosProPage onBack={() => setActiveTab('home')} />;
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
    <div className="min-h-screen bg-background">
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto flex items-center justify-around md:justify-center md:gap-2 h-16 px-2">
          {tabs.map(tab => {
            const isAdd = tab.id === 'add';
            const isActive = activeTab === tab.id;

            if (isAdd) {
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleTabClick(tab.id)}
                  className="w-12 h-12 -mt-5 md:mt-0 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center"
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
