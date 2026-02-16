import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, TrendingUp, Infinity, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PLANS = [
    {
        id: 'weekly',
        name: 'Haftalik',
        price: 14990,
        discountedPrice: 7490,
        period: 'hafta',
        features: ['Barcha PRO imkoniyatlar', 'Cheklovsiz hisob-kitoblar', 'Telegram Bot-ga to\'liq kirish'],
        recommended: false,
        color: 'bg-blue-500/10 text-blue-500',
        buttonVariant: 'outline'
    },
    {
        id: 'monthly',
        name: 'Oylik',
        price: 29990,
        discountedPrice: 14990,
        period: 'oy',
        features: ['Barcha PRO imkoniyatlar', 'Kengaytirilgan statistika', 'Ovozli kiritish (Voice AI)', 'Excel eksport'],
        recommended: true,
        color: 'gradient-primary text-white',
        buttonVariant: 'default'
    },
    {
        id: 'yearly',
        name: 'Yillik',
        price: 249990,
        discountedPrice: 124990,
        period: 'yil',
        features: ['Eng katta tejash (30% dan ortiq)', 'Barcha kelajakdagi yangiliklar', 'Ustupuvchi qo\'llab-quvvatlash', 'VIP status'],
        recommended: false,
        color: 'bg-purple-500/10 text-purple-500',
        buttonVariant: 'outline'
    }
];

const FEATURES = [
    { icon: Infinity, title: "Cheklovsiz limitlar", desc: "Kunlik hisob-kitoblar va tranzaksiyalar uchun cheklov yo'q." },
    { icon: Sparkles, title: "Sun'iy Intellekt (AI)", desc: "Xarajatlaringizni tahlil qiluvchi va maslahat beruvchi shaxsiy yordamchi." },
    { icon: Zap, title: "Tezkor Kiritish", desc: "Telegram orqali ovozli xabarlar va rasmlar yordamida kiritish." },
    { icon: TrendingUp, title: "Chuqur Statistika", desc: "Qayerga qancha pul ketayotganini aniq ko'rsatib beruvchi grafiklar." },
    { icon: Shield, title: "Qarz Nazorati", desc: "Qarzlarni yopish uchun maxsus 'Qor uyumi' strategiyasi." },
    { icon: ArrowRight, title: "Excel Eksport", desc: "Barcha ma'lumotlaringizni Excel (.xlsx) formatida yuklab olish." },
];

const ProPage = () => {
    const { isPro } = useData();
    const [open, setOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSubscribe = (planId: string) => {
        setSelectedPlan(planId);
        setOpen(true);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen pb-24 md:pb-12 pt-4 px-4 md:px-8 max-w-7xl mx-auto">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">

                {/* Header */}
                <motion.div variants={item} className="text-center space-y-4 max-w-3xl mx-auto">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-sm px-4 py-1.5 rounded-full border-0">
                        ✨ Halos PRO
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Moliyaviy Imkoniyatlaringizni <br />
                        <span className="text-gradient-primary">Kengaytiring</span>
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                        Professional vositalar yordamida daromadingizni oshiring va xarajatlaringizni to'liq nazorat qiling.
                    </p>
                </motion.div>

                {/* Current Status */}
                {isPro && (
                    <motion.div variants={item} className="max-w-md mx-auto">
                        <Card className="border-primary/50 bg-primary/5 backdrop-blur-sm">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
                                    <Crown className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Sizda PRO obuna faol!</h3>
                                    <p className="text-sm text-muted-foreground">Barcha imkoniyatlardan cheklovsiz foydalaning.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Pricing Cards */}
                <motion.div variants={item} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PLANS.map((plan) => (
                        <Card key={plan.id} className={`relative overflow-hidden flex flex-col border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.recommended ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
                            {plan.recommended && (
                                <div className="absolute top-0 inset-x-0 h-1 gradient-primary" />
                            )}
                            {plan.recommended && (
                                <div className="absolute top-4 right-4">
                                    <Badge className="gradient-primary text-white border-0">Tavsiya etiladi</Badge>
                                </div>
                            )}

                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-extrabold">{formatCurrency(plan.discountedPrice)}</span>
                                    <span className="text-muted-foreground line-through text-sm">{formatCurrency(plan.price)}</span>
                                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                                </CardDescription>
                                <div className="inline-block px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded mt-2 w-fit">
                                    🔥 50% CHEGIRMA
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={12} className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-4">
                                <Button
                                    className={`w-full h-12 rounded-xl text-base font-semibold transition-all ${plan.recommended ? 'gradient-primary hover:shadow-lg hover:shadow-primary/25 text-white' : ''}`}
                                    // @ts-ignore
                                    variant={plan.recommended ? 'default' : 'outline'}
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={isPro}
                                >
                                    {isPro ? 'Faol' : 'Obuna bo\'lish'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </motion.div>

                {/* Features Grid */}
                <motion.div variants={item} className="pt-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold">Nega aynan PRO?</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
                        {FEATURES.map((f, i) => (
                            <Card key={i} className="bg-card/50 backdrop-blur border-border/50 hover:bg-card transition-colors">
                                <CardContent className="p-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <f.icon size={20} />
                                    </div>
                                    <h3 className="font-bold mb-2">{f.title}</h3>
                                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ Section can go here */}

                {/* Subscribe Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md rounded-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl">Telegram orqali to'lov</DialogTitle>
                            <DialogDescription className="text-center pt-2">
                                Xavfsizlik maqsadida to'lovlar rasmiy Telegram botimiz orqali amalga oshiriladi.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Bir zumda aktivlashadi</p>
                                    <p className="text-xs text-muted-foreground">To'lov qilishingiz bilan PRO avtomatik yonadi</p>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 gradient-primary text-white text-lg rounded-xl shadow-lg shadow-primary/20"
                                onClick={() => window.open(`https://t.me/HalosRobot?start=pro_${selectedPlan}`, '_blank')}
                            >
                                Botga o'tish va to'lash
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </motion.div>
        </div>
    );
};

export default ProPage;
