import asyncio
import asyncpg
import os

# Your provided DATABASE_URL
DATABASE_URL = "postgresql://postgres.txewsaiagkfkqdrlixxb:NewHalos2026!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_db():
    print("Connecting to database...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("Connected successfully! ✅")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    try:
        # Check users table
        print("\n--- Checking 'users' table ---")
        users_exist = await conn.fetchval("SELECT to_regclass('public.users')")
        if users_exist:
            id_type = await conn.fetchval(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'"
            )
            count = await conn.fetchval("SELECT COUNT(*) FROM users")
            print(f"Table 'users' exists. ID Type: {id_type}. Row Count: {count}")
        else:
            print("Table 'users' DOES NOT EXIST! ❌ (Bot hasn't created it yet)")

        # Check transactions table
        print("\n--- Checking 'transactions' table ---")
        tx_exist = await conn.fetchval("SELECT to_regclass('public.transactions')")
        
        if tx_exist:
            user_id_type = await conn.fetchval(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id'"
            )
            count = await conn.fetchval("SELECT COUNT(*) FROM transactions")
            print(f"Table 'transactions' exists. user_id Type: {user_id_type}. Row Count: {count}")
            
            if user_id_type == 'uuid':
                print("\n⚠️  CONFLICT DETECTED: 'transactions.user_id' is UUID!")
                print("   The Telegram Bot uses INTEGER IDs. This table prevents the bot from saving data.")
                print("   Action: Dropping table 'transactions' so the Bot can recreate it correctly...")
                await conn.execute("DROP TABLE transactions CASCADE")
                print("   Table DROPPED successfully. ✅")
            else:
                print("   Schema is correct (INTEGER user_id). Sync should work.")
        else:
            print("Table 'transactions' DOES NOT EXIST. Bot will create it on next startup.")

        # Check profiles table (Supabase Auth)
        print("\n--- Checking 'profiles' table (App Users) ---")
        profiles_exist = await conn.fetchval("SELECT to_regclass('public.profiles')")
        if profiles_exist:
            count = await conn.fetchval("SELECT COUNT(*) FROM profiles")
            print(f"Table 'profiles' exists. Row Count: {count}")
            # Check for telegram_id column
            tg_col = await conn.fetchval(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'telegram_id'"
            )
            if tg_col:
                print("   Column 'telegram_id' exists. Linkage is possible. ✅")
            else:
                print("   Column 'telegram_id' MISSING! ❌")

    except Exception as e:
        print(f"Error checking DB: {e}")
    finally:
        await conn.close()
        print("\nDone.")

if __name__ == "__main__":
    asyncio.run(check_db())
