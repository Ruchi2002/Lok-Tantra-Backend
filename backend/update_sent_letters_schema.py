#!/usr/bin/env python3
"""
Database migration script to update sent_letters table schema
- Increase content field length to 5000 characters (1000 words)
- Add documents field for file uploads
"""

import asyncio
import aiomysql
from config import Settings

async def update_sent_letters_schema():
    """Update the sent_letters table schema"""
    
    # Get database settings
    settings = Settings()
    
    try:
        # Connect to database
        conn = await aiomysql.connect(
            host=settings.DB_HOST,
            port=int(settings.DB_PORT),
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            db=settings.DB_NAME,
            charset='utf8mb4'
        )
        
        async with conn.cursor() as cursor:
            print("🔄 Starting sent_letters table schema update...")
            
            # Check if documents column exists
            await cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'sent_letters' 
                AND COLUMN_NAME = 'documents'
                AND TABLE_SCHEMA = %s
            """, (settings.DB_NAME,))
            
            check_documents = await cursor.fetchone()
            
            if not check_documents:
                print("📝 Adding documents column...")
                await cursor.execute("""
                    ALTER TABLE sent_letters 
                    ADD COLUMN documents TEXT
                """)
                print("✅ Documents column added successfully")
            else:
                print("ℹ️  Documents column already exists")
            
            # Update content column to allow 5000 characters
            print("📝 Updating content column length...")
            await cursor.execute("""
                ALTER TABLE sent_letters 
                MODIFY COLUMN content VARCHAR(5000)
            """)
            print("✅ Content column updated to 5000 characters")
            
            # Update response_content column to allow 5000 characters
            print("📝 Updating response_content column length...")
            await cursor.execute("""
                ALTER TABLE sent_letters 
                MODIFY COLUMN response_content VARCHAR(5000)
            """)
            print("✅ Response content column updated to 5000 characters")
            
            # Commit the changes
            await conn.commit()
            
            print("✅ Schema update completed successfully!")
            
            # Verify the changes
            print("\n🔍 Verifying schema changes...")
            
            # Check content column
            await cursor.execute("""
                SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'sent_letters' 
                AND COLUMN_NAME = 'content'
                AND TABLE_SCHEMA = %s
            """, (settings.DB_NAME,))
            
            content_info = await cursor.fetchone()
            if content_info:
                print(f"✅ Content column: {content_info[0]} (max length: {content_info[1]})")
            
            # Check documents column
            await cursor.execute("""
                SELECT DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'sent_letters' 
                AND COLUMN_NAME = 'documents'
                AND TABLE_SCHEMA = %s
            """, (settings.DB_NAME,))
            
            documents_info = await cursor.fetchone()
            if documents_info:
                print(f"✅ Documents column: {documents_info[0]}")
        
        conn.close()
        print("\n🎉 Database migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(update_sent_letters_schema())
