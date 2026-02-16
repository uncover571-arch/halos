import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { DataProvider } from "@/contexts/DataContext";
import MainLayout from "./pages/MainLayout";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { Loader2, Sparkles } from "lucide-react";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg text-white">
        <Sparkles size={32} fill="currentColor" />
      </div>
      <Loader2 className="animate-spin text-primary" size={24} />
      <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <AuthPage />;

  return (
    <AppSettingsProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AppSettingsProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
