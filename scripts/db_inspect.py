import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres.txewsaiagkfkqdrlixxb:NewHalos2026!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def inspect():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("Connected to DB ✅")

        # 1. List Users
        print("\n--- Users (Last 10) ---")
        users = await conn.fetch("SELECT id, telegram_id, first_name, username FROM users ORDER BY id DESC LIMIT 10")
        for u in users:
            print(f"ID: {u['id']} | TG: {u['telegram_id']} | Name: {u['first_name']} (@{u['username']})")

        # 2. List Transactions
        print("\n--- Transactions (Last 5) ---")
        txs = await conn.fetch("""
            SELECT t.id, t.user_id, t.amount, t.type, u.first_name 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            ORDER BY t.created_at DESC LIMIT 5
        """)
        for t in txs:
            print(f"TX: {t['id']} | User: {t['first_name']} | {t['type']} {t['amount']}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(inspect())
