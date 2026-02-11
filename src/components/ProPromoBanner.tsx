import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

interface ProPromoBannerProps {
  onNavigatePro?: () => void;
  message?: string;
}

export default function ProPromoBanner({ onNavigatePro, message }: ProPromoBannerProps) {
  const { isPro } = useData();
  if (isPro) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/30 bg-accent cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigatePro}>
        <CardContent className="p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center shrink-0">
            <Crown size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Halos PRO</p>
            <p className="text-xs text-muted-foreground truncate">{message || "70/20/10 rejasi bilan qarzdan tezroq chiqing!"}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
