// Supabase bazaga ulanishni tekshirish scripti
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhiuaflsdqriheynudye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaXVhZmxzZHFyaWhleW51ZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTIyMDgsImV4cCI6MjA4NjI2ODIwOH0.bc5qeVEFhD596c0w1iz--X5iIGYHId_8s-9tcUrA3cw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('🔄 Supabase bazaga ulanish tekshirilmoqda...\n');
    console.log(`📡 URL: ${SUPABASE_URL}`);
    console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...\n`);

    // 1. Auth xizmatini tekshirish
    try {
        const { data: session, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.log('❌ Auth xizmati xatolik:', authError.message);
        } else {
            console.log('✅ Auth xizmati ishlayapti!');
            console.log(`   Session: ${session?.session ? 'Mavjud' : 'Yo\'q (anonymous)'}`);
        }
    } catch (e) {
        console.log('❌ Auth xizmati ulanmadi:', e.message);
    }

    // 2. Jadvallarni tekshirish
    const tables = ['profiles', 'transactions', 'debts', 'credits', 'freedom_plans', 'user_settings'];

    console.log('\n📋 Jadvallarni tekshirish:');
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`   ❌ ${table}: ${error.message}`);
            } else {
                console.log(`   ✅ ${table}: mavjud (${count ?? 0} ta yozuv)`);
            }
        } catch (e) {
            console.log(`   ❌ ${table}: ${e.message}`);
        }
    }

    console.log('\n🏁 Tekshirish tugadi!');
}

testConnection();
