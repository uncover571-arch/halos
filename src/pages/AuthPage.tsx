import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Loader2, MessageCircle, ChevronRight, CheckCircle2,
    Shield, TrendingUp, Wallet, Zap, ArrowRight,
    Menu, X, Sparkles, PieChart, Target, Smartphone
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const AuthPage = () => {
    // --- Login Logic (Preserved & Adapted) ---
    const [isTelegramLoading, setIsTelegramLoading] = useState(false);
    const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
    const [telegramDeepLink, setTelegramDeepLink] = useState('');
    const [telegramSessionId, setTelegramSessionId] = useState('');
    const { signInWithTelegram } = useAuth();
    const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

    const handleTelegramLogin = async () => {
        if (!AUTH_API_URL) {
            toast.error("Auth API URL sozlanmagan!");
            return;
        }
        setIsTelegramLoading(true);
        try {
            const response = await fetch(`${AUTH_API_URL}/telegram/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (!response.ok) throw new Error("Sessiya yaratib bo'lmadi");
            const data = await response.json();
            setTelegramSessionId(data.session_id);
            setTelegramDeepLink(data.deep_link);
            setTelegramDialogOpen(true);
        } catch (error) {
            console.error(error);
            toast.error("Telegramga ulanishda xatolik");
        } finally {
            setIsTelegramLoading(false);
        }
    };

    // Poll for Telegram session
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (telegramDialogOpen && telegramSessionId && AUTH_API_URL) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`${AUTH_API_URL}/telegram/session/${telegramSessionId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'confirmed' && data.user && data.access_token) {
                            clearInterval(interval);
                            setTelegramDialogOpen(false);
                            signInWithTelegram(data.user, data.access_token);
                            toast.success(`Xush kelibsiz, ${data.user.first_name}!`);
                            setTimeout(() => window.location.reload(), 500);
                        } else if (data.status === 'expired' || data.status === 'cancelled') {
                            clearInterval(interval);
                            setTelegramDialogOpen(false);
                            toast.error("Kirish bekor qilindi");
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [telegramDialogOpen, telegramSessionId, AUTH_API_URL, signInWithTelegram]);

    // --- Landing Page UI ---
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
            {/* Navigation */}
            <motion.nav
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 py-3' : 'bg-transparent py-5'}`}
            >
                <div className="container px-4 mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Halos</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Imkoniyatlar</a>
                        <a href="#how-it-works" className="hover:text-primary transition-colors">Qanday ishlaydi?</a>
                        <a href="#pro" className="hover:text-primary transition-colors">PRO</a>
                    </div>
                    <Button onClick={handleTelegramLogin} size="sm" className="gradient-primary text-white rounded-full px-6 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                        Kirish
                    </Button>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px]" />
                    <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                </div>

                <div className="container px-4 mx-auto text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="max-w-4xl mx-auto space-y-6"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 border border-accent text-xs font-medium text-muted-foreground w-fit mx-auto mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Halos 2.0 ishga tushdi
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                            Moliyaviy <span className="text-gradient-primary">Erkinlik</span> <br className="hidden md:block" />
                            Sari Ishonchli Qadam
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            O'zingizga xos moliyaviy muvozanatni toping. Qarzdan qutuling, shaxsiy kapitalingizni quring va moliyaviy mustaqillikka erishing.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button onClick={handleTelegramLogin} size="lg" className="h-14 px-8 text-lg rounded-full gradient-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                                <MessageCircle className="mr-2" />
                                Boshlash (Telegram)
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto hover:bg-accent hover:text-accent-foreground border-2">
                                Batafsil tanishish
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring" }}
                        className="mt-16 md:mt-24 relative max-w-5xl mx-auto perspective-1000"
                    >
                        <MockupCard />
                        {/* 3D Floating Elements */}
                        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-10 -right-10 md:right-10 hidden md:block z-20">
                            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-sm p-4 rounded-2xl w-48">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-600">+12.5%</div>
                                        <div className="text-[10px] text-muted-foreground">Jamg'arma o'sishi</div>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[75%]" />
                                </div>
                            </Card>
                        </motion.div>
                        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-20 -left-10 md:left-10 hidden md:block z-20">
                            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-sm p-4 rounded-2xl w-48">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600">
                                        <Target size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold">Maqsad</div>
                                        <div className="text-[10px] text-muted-foreground">Qarzdan ozodlik: 85%</div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section className="py-20 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Moliya boshqaruvi qiyin tuyuladimi?</h2>
                        <p className="text-muted-foreground">Ko'pchilik odamlar bir xil muammolardan aziyat chekadi. Agar bu sizga tanish bo'lsa, Halos aynan siz uchun.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PainPointCard
                            icon="😫"
                            title="Pul qayerga ketyapti?"
                            desc="Oylik maosh keladi, lekin oy oxiriga yetmaydi. Hech narsa olmagandek tuyulasiz, lekin hamyon bo'sh."
                        />
                        <PainPointCard
                            icon="📉"
                            title="Qarzlar yuki"
                            desc="Eski qarzlarni yopish uchun yangi qarz olishga majbur bo'lyapsiz. Bu sikldan chiqish imkonsizdek."
                        />
                        <PainPointCard
                            icon="🤷‍♂️"
                            title="Rejasizlik"
                            desc="Kelajak uchun jamg'arma yo'q. Har qanday kutilmagan xarajat sizni stressga soladi."
                        />
                    </div>
                </div>
            </section>

            {/* Features / Solution Section */}
            <section id="features" className="py-20 md:py-32 relative">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="md:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                                    AUTOMATIK TIZIM
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                    Yechim: <span className="text-blue-600 dark:text-blue-400">Halos Erkinlik Strategiyasi</span>
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Ilovamiz sizning daromadingizni aqlli algoritmlar yordamida uchta strategik yo'nalishga taqsimlaydi.
                                </p>
                                <ul className="space-y-6">
                                    <FeatureItem
                                        icon={<Wallet className="text-blue-500" />}
                                        title="Hayotiy Farovonlik"
                                        desc="Kundalik ehtiyojlar, oziq-ovqat va sifatli hayot tarzi uchun optimal chegara."
                                    />
                                    <FeatureItem
                                        icon={<Shield className="text-amber-500" />}
                                        title="Ozodlik Yo'li"
                                        desc="Qarzlardan va moliyaviy to'siqlardan tezroq xalos bo'lish uchun strategik tezlatgich."
                                    />
                                    <FeatureItem
                                        icon={<Zap className="text-emerald-500" />}
                                        title="Shaxsiy Kapital"
                                        desc="Moliyaviy erkinlik sari poydevor. Sizning kelajakdagi boyligingiz va xavfsizligingiz."
                                    />
                                </ul>
                                <div className="pt-8">
                                    <Button onClick={handleTelegramLogin} className="rounded-full px-8 h-12 text-base font-semibold" variant="outline">
                                        Rejani sinab ko'rish <ChevronRight size={16} className="ml-1" />
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[80px] rounded-full" />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative z-10"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                    alt="Dashboard Preview"
                                    className="rounded-3xl shadow-2xl border border-border/50 rotate-3 hover:rotate-0 transition-all duration-500"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-xl border border-border/50 flex items-center gap-4 animate-bounce-slow">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Reja bajarildi!</p>
                                        <p className="text-xs text-muted-foreground">Bu oy 1.2 mln so'm tejaldi</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 bg-muted/50">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Qanday ishlaydi?</h2>
                        <p className="text-muted-foreground">3 oddiy qadam bilan moliyaviy tartib o'rnating</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <StepCard
                            num="01"
                            title="Telegram orqali kiring"
                            desc="Ro'yxatdan o'tish shart emas. Shunchaki Telegram orqali bosing."
                        />
                        <StepCard
                            num="02"
                            title="Daromadni kiriting"
                            desc="Oylik daromadingizni kiriting va biz sizga shaxsiy reja tuzib beramiz."
                        />
                        <StepCard
                            num="03"
                            title="Xarajatni kuzating"
                            desc="Har bir xarajatni kiriting. Biz sizni chegaradan chiqmaslikka ogohlantiramiz."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing / PRO Section */}
            <section id="pro" className="py-24 relative">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <Badge className="bg-primary/10 text-primary border-0 mb-4 px-4 py-1 rounded-full">⚡ Halos PRO</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Moliyaviy erkinlik uchun professional vositalar</h2>
                        <p className="text-muted-foreground text-lg">Hozir qo'shiling va 50% chegirmaga ega bo'ling. Birinchi haftangiz mutlaqo bepul!</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <LandingPricingCard
                            title="Haftalik"
                            price="7 490"
                            originalPrice="14 990"
                            period="hafta"
                            features={['Barcha PRO imkoniyatlar', 'Cheklovsiz kiritish', 'AI yordamchi']}
                            onClick={handleTelegramLogin}
                        />
                        <LandingPricingCard
                            title="Oylik"
                            price="14 990"
                            originalPrice="29 990"
                            period="oy"
                            recommended
                            features={['Eng ommabop tanlov', 'Batafsil statistika', 'Ovozli AI', 'Excel eksport']}
                            onClick={handleTelegramLogin}
                        />
                        <LandingPricingCard
                            title="Yillik"
                            price="124 990"
                            originalPrice="249 990"
                            period="yil"
                            features={['Eng katta tejash', 'VIP qo\'llab-quvvatlash', 'Barcha yangilanishlar', 'Umrbod status?']}
                            onClick={handleTelegramLogin}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-purple-700 opacity-90" />
                <div className="container px-4 mx-auto relative z-10 text-center text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Moliyaviy erkinlikka tayyormisiz?</h2>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                        Bugun boshlang va kelajagingiz uchun poydevor quring. Bu mutlaqo bepul.
                    </p>
                    <Button onClick={handleTelegramLogin} size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 active:scale-95">
                        Hoziroq Boshlash — Bepul
                    </Button>
                    <p className="mt-6 text-sm text-white/60">
                        Telegram Login • Kredit kartasiz • 10 soniyada kirish
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 bg-background">
                <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl opacity-80">
                        <Sparkles size={16} />
                        <span>Halos</span>
                    </div>
                    <div className="text-sm text-muted-foreground text-center md:text-right">
                        <p>© 2026 Halos. Barcha huquqlar himoyalangan.</p>
                        <div className="flex justify-center md:justify-end gap-4 mt-2">
                            <a href="#" className="hover:text-primary">Maxfiylik</a>
                            <a href="#" className="hover:text-primary">Shartlar</a>
                            <a href="#" className="hover:text-primary">Yordam</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Login Dialog */}
            <Dialog open={telegramDialogOpen} onOpenChange={setTelegramDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#24A1DE]/10 flex items-center justify-center text-[#24A1DE] mb-2">
                                <MessageCircle size={32} />
                            </div>
                            Telegram orqali tasdiqlash
                        </DialogTitle>
                        <DialogDescription className="text-center text-base pt-2">
                            Telegram botimizga o'ting va <b>"Start"</b> yoki <b>"Tasdiqlash"</b> tugmasini bosing.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-6 py-6">
                        <Button
                            className="w-full bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white rounded-2xl h-14 text-lg font-medium shadow-md transition-transform hover:-translate-y-0.5"
                            onClick={() => window.open(telegramDeepLink, '_blank')}
                        >
                            Botni ochish <MessageCircle className="ml-2" size={20} />
                        </Button>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-accent/50 px-4 py-2 rounded-full">
                            <Loader2 className="animate-spin w-4 h-4" />
                            <span>Sizni kutyapmiz...</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Helper Components
const FeatureItem = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex gap-4 items-start">
        <div className="p-3 bg-muted rounded-xl shrink-0 mt-1">{icon}</div>
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-muted-foreground leading-snug">{desc}</p>
        </div>
    </div>
);

const PainPointCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="font-bold text-xl mb-3">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </CardContent>
    </Card>
);

const StepCard = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
    <div className="relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors group">
        <div className="text-6xl font-black text-muted/20 absolute top-4 right-4 group-hover:text-primary/10 transition-colors pointer-events-none">
            {num}
        </div>
        <h3 className="font-bold text-xl mb-3 relative z-10">{title}</h3>
        <p className="text-sm text-muted-foreground relative z-10">{desc}</p>
    </div>
);

const LandingPricingCard = ({ title, price, originalPrice, period, features, recommended = false, onClick }: any) => (
    <Card className={`relative overflow-hidden flex flex-col border-2 transition-all duration-300 hover:shadow-xl ${recommended ? 'border-primary shadow-lg shadow-primary/10 scale-105 z-10' : 'border-border bg-card/50'}`}>
        {recommended && <div className="absolute top-0 inset-x-0 h-1.5 gradient-primary" />}
        <CardContent className="p-8 flex-1 flex flex-col">
            <div className="mb-6">
                <h3 className="font-bold text-xl mb-2">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-muted-foreground line-through text-sm">{originalPrice}</span>
                    <span className="text-muted-foreground text-sm">/{period}</span>
                </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <Check size={16} className="text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                    </li>
                ))}
            </ul>
            <Button onClick={onClick} className={`w-full h-12 rounded-xl font-bold transition-all ${recommended ? 'gradient-primary text-white shadow-lg' : ''}`} variant={recommended ? 'default' : 'outline'}>
                Hoziroq boshlash
            </Button>
        </CardContent>
    </Card>
);

const MockupCard = () => (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[300px] md:h-[450px] w-[280px] md:w-[600px] shadow-2xl flex flex-col overflow-hidden">
        <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[8px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[8px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[8px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[8px] top-[142px] rounded-e-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background dark:bg-slate-950 relative">
            {/* Fake App UI */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 opacity-90">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-8 rounded-full bg-muted/50" />
                    <div className="h-4 w-24 bg-muted/50 rounded" />
                    <div className="h-8 w-8 rounded-full bg-muted/50" />
                </div>
                <div className="h-32 md:h-48 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl opacity-80" />
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 md:h-20 rounded-xl bg-muted/50" />)}
                </div>
                <div className="space-y-2 md:space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted/50" />
                            <div className="flex-1 h-3 bg-muted/50 rounded" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
    </div>
);

export default AuthPage;
