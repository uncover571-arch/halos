import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { PlanInput } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FreedomPlanPageProps {
    onNavigate?: (tab: string) => void;
}

export default function FreedomPlanPage({ onNavigate }: FreedomPlanPageProps) {
    const { financialPlan, saveFinancialPlan, dataLoading, isPro } = useData();
    const [calcLoading, setCalcLoading] = useState(false);

    // Local form state
    const [input, setInput] = useState<PlanInput>({
        income_self: 0,
        income_partner: 0,
        rent: 0,
        kindergarten: 0,
        utilities: 0,
        loan_payment: 0,
        total_debt: 0
    });

    // Populate form from API data when loaded
    useEffect(() => {
        if (financialPlan.profile) {
            setInput({
                income_self: financialPlan.profile.income_self || 0,
                income_partner: financialPlan.profile.income_partner || 0,
                rent: financialPlan.profile.rent || 0,
                kindergarten: financialPlan.profile.kindergarten || 0,
                utilities: financialPlan.profile.utilities || 0,
                loan_payment: financialPlan.profile.loan_payment || 0,
                total_debt: financialPlan.profile.total_debt || 0
            });
        }
    }, [financialPlan.profile]);

    const handleChange = (field: keyof PlanInput, value: string) => {
        // Allow empty string for better ux during typing, but convert to float on submit
        const numValue = value === '' ? 0 : parseFloat(value);
        setInput(prev => ({ ...prev, [field]: numValue }));
    };

    const handleCalculate = async () => {
        setCalcLoading(true);
        try {
            await saveFinancialPlan(input);
        } catch (e) {
            console.error(e);
        } finally {
            setCalcLoading(false);
        }
    };

    const formatMoney = (amount: number | undefined | null) => {
        if (amount === undefined || amount === null) return '0 UZS';
        return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(amount);
    };

    if (dataLoading) {
        return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const result = financialPlan.result;

    return (
        <div className="container mx-auto p-4 max-w-5xl space-y-8 pb-24">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Moliyaviy Erkinlik Rejasi
                </h1>
                <p className="text-muted-foreground mt-2">
                    Solvo AI tomonidan shaxsiy moliyaviy strukturangiz tahlili va rejalashtirish.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: INPUT FORM */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Ma'lumotlar
                        </CardTitle>
                        <CardDescription>Aniq hisob-kitob uchun ma'lumotlarni yangilang.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Income Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-primary uppercase tracking-wider">Daromadlar</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Sizning daromadingiz</Label>
                                    <Input
                                        type="number"
                                        value={input.income_self || ''}
                                        onChange={e => handleChange('income_self', e.target.value)}
                                        placeholder="0"
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Juftingiz daromadi</Label>
                                    <Input
                                        type="number"
                                        value={input.income_partner || ''}
                                        onChange={e => handleChange('income_partner', e.target.value)}
                                        placeholder="0"
                                        className="bg-muted/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mandatory Expenses */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-orange-500 uppercase tracking-wider">Majburiy Xarajatlar</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ijara haqi</Label>
                                        <Input type="number" value={input.rent || ''} onChange={e => handleChange('rent', e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bog'cha / Maktab</Label>
                                        <Input type="number" value={input.kindergarten || ''} onChange={e => handleChange('kindergarten', e.target.value)} placeholder="0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Kommunal, Yeb-ichish va boshqalar</Label>
                                    <Input type="number" value={input.utilities || ''} onChange={e => handleChange('utilities', e.target.value)} placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* Debts */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-red-500 uppercase tracking-wider">Qarz Majburiyati</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Oylik to'lov (Kredit)</Label>
                                    <Input type="number" value={input.loan_payment || ''} onChange={e => handleChange('loan_payment', e.target.value)} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jami qarz summasi</Label>
                                    <Input type="number" value={input.total_debt || ''} onChange={e => handleChange('total_debt', e.target.value)} placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleCalculate}
                            className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                            disabled={calcLoading}
                        >
                            {calcLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                            Hisoblash
                        </Button>
                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: RESULTS */}
                <div className="space-y-6">
                    {result ? (
                        <>
                            {/* MAIN SUMMARY CARD */}
                            <Card className={`border-l-4 shadow-md ${result.mode === 'wealth' ? 'border-l-green-500 bg-green-50/30' :
                                result.mode === 'debt' ? 'border-l-blue-500 bg-blue-50/30' :
                                    'border-l-red-500 bg-red-50/30'
                                }`}>
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        {result.mode === 'wealth' ? '🚀 Boylik Ortirish Rejasi' :
                                            result.mode === 'debt' ? '🛡️ Qarzdan Qutulish Rejasi' :
                                                '⚠️ Xavfli Moliyaviy Holat'}
                                    </CardTitle>
                                    <CardDescription>
                                        Sizning erkin pul oqimingiz (Free Cash) asosida hisoblandi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Erkin Pul Oqimi</span>
                                        <span className={`text-4xl font-black mt-2 ${result.free_cash > 0 ? 'text-primary' : 'text-red-500'
                                            }`}>
                                            {formatMoney(result.free_cash)}
                                        </span>
                                        {result.mode === 'negative' && (
                                            <div className="flex items-center gap-2 mt-4 text-red-600 font-medium text-center text-sm bg-red-100 p-2 rounded-lg">
                                                <AlertCircle className="w-4 h-4" />
                                                Daromadingiz xarajatlaringizni qoplamayapti!
                                            </div>
                                        )}
                                    </div>

                                    {/* STATS GRID */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-white rounded-lg border">
                                            <p className="text-xs text-muted-foreground">Jami Daromad</p>
                                            <p className="font-bold text-slate-700">{formatMoney(result.total_income)}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border">
                                            <p className="text-xs text-muted-foreground">Majburiy Xarajat</p>
                                            <p className="font-bold text-slate-700">{formatMoney(result.mandatory_living + result.mandatory_debt)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DEBT MODE SPECIFIC */}
                            {result.mode === 'debt' && (
                                <Card className="relative overflow-hidden">
                                    {!isPro && result.exit_months > 0 && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                                            <Lock className="w-12 h-12 text-slate-400 mb-2" />
                                            <h3 className="text-lg font-bold text-slate-800">To'liq Reja PRO versiyada</h3>
                                            <p className="text-sm text-slate-600 mb-4 max-w-xs">Tezkor qutulish sanasi va samarali taqsimotni ko'rish uchun PRO obunasini faollashtiring.</p>
                                            <Button
                                                variant="default"
                                                className="text-white bg-gradient-to-r from-indigo-500 to-purple-600"
                                                onClick={() => onNavigate?.('pro')}
                                            >
                                                PRO ga o'tish
                                            </Button>
                                        </div>
                                    )}

                                    <CardHeader>
                                        <CardTitle className="text-lg">Qarzdan Qutulish Strategiyasi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-sm text-blue-600 font-medium">Oddiy to'lov bilan</p>
                                                <p className="text-2xl font-bold text-blue-900 mt-1">{result.simple_exit_months || "?"} oy</p>
                                                <p className="text-xs text-blue-500 mt-1">Sana: {result.simple_exit_date}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 relative">
                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SOLVO TAVSIYASI</div>
                                                <p className="text-sm text-green-600 font-medium">Tezkor Strategiya</p>
                                                <p className="text-2xl font-bold text-green-900 mt-1">{result.exit_months} oy</p>
                                                <p className="text-xs text-green-500 mt-1">Sana: {result.exit_date}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                            <p className="font-semibold text-sm uppercase text-slate-500 mb-2">Strategik Taqsimot (Solvo Algorithm)</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Ozodlik Yo'li (+Tezlatish)</span>
                                                <span className="font-bold">{formatMoney(result.monthly_debt_payment)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Hayotiy Farovonlik</span>
                                                <span className="font-bold">{formatMoney(result.monthly_living_extra)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Shaxsiy Kapital</span>
                                                <span className="font-bold">{formatMoney(result.monthly_savings)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-green-100 p-3 rounded-lg text-green-800 text-sm">
                                            <span>💵 Qutulganingizda yig'iladigan summa:</span>
                                            <span className="font-bold">{formatMoney(result.savings_at_exit)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* WEALTH MODE SPECIFIC */}
                            {result.mode === 'wealth' && (
                                <Card className="relative overflow-hidden">
                                    {!isPro && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                                            <Lock className="w-12 h-12 text-slate-400 mb-2" />
                                            <h3 className="text-lg font-bold text-slate-800">Boylik Rejasi PRO versiyada</h3>
                                            <p className="text-sm text-slate-600 mb-4 max-w-xs">Investitsiya va jamg'arma strategiyasini ko'rish uchun PRO obunasini faollashtiring.</p>
                                            <Button
                                                variant="default"
                                                className="text-white bg-gradient-to-r from-indigo-500 to-purple-600"
                                                onClick={() => onNavigate?.('pro')}
                                            >
                                                PRO ga o'tish
                                            </Button>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-lg">Kapital Qurish Strategiyasi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Aktiv Investitsiya</span>
                                                <span className="font-bold">{formatMoney(result.monthly_invest)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Shaxsiy Kapital</span>
                                                <span className="font-bold">{formatMoney(result.monthly_savings)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Hayotiy Farovonlik</span>
                                                <span className="font-bold">{formatMoney(result.monthly_living_extra)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl">
                                                <p className="text-xs text-purple-600 mb-1">1 Yilda Investitsiya</p>
                                                <p className="font-bold text-lg text-purple-900">{formatMoney(result.invest_12_months)}</p>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl">
                                                <p className="text-xs text-green-600 mb-1">1 Yilda Jamg'arma</p>
                                                <p className="font-bold text-lg text-green-900">{formatMoney(result.savings_12_months)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl text-slate-400 bg-slate-50/50">
                            <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-slate-800">Natija Yo'q</h3>
                            <p className="max-w-xs mx-auto mt-2">Chap tomondagi formani to'ldirib, "Hisoblash" tugmasini bosing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
