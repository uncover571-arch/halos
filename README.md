# Halos - Moliyaviy Boshqaruv Ilovasi

Ushbu loyiha shaxsiy moliya boshqaruvi uchun mo'ljallangan bo'lib, daromadlar, xarajatlar, qarzlar va kreditlarni boshqarishga yordam beradi.

## Texnologiyalar

- React (Vite)
- TypeScript
- Tailwind CSS
- Supabase (Backend & Auth)
- Framer Motion

## O'rnatish va Ishga Tushirish

1. **Loyihani yuklab oling va bog'liqliklarni o'rnating:**

   ```bash
   npm install
   ```

2. **Supabase bazasini sozlash:**

   Baza jadvallarini yaratish uchun quyidagi SQL so'rovni **Supabase Dashboard > SQL Editor** bo'limida ishga tushiring.

   SQL fayl manzili: `supabase/migrations/001_create_tables.sql`

3. **Ilovani ishga tushirish:**

   ```bash
   npm run dev
   ```

   Ilova `http://localhost:8080` (yoki keyingi bo'sh port) da ochiladi.

## Supabase Auth Sozlamalari

- Supabase Dashboard > Authentication > Settings bo'limiga o'ting.
- **Email Auth** yoqilganligiga ishonch hosil qiling.
- Test uchun "Confirm email" funksiyasini o'chirib qo'yishingiz mumkin.

## Xususiyatlar

- **Tranzaksiyalar:** Kirim va chiqimlarni kiritish
- **Qarzlar:** Berilgan va olingan qarzlarni kuzatish
- **Kreditlar:** Kredit to'lovlarini rejalashtirish
- **Halos Rejasi:** 70/20/10 qoidasi bo'yicha moliya taqsimoti
- **Profil:** Tungi rejim, til va valyuta sozlamalari
