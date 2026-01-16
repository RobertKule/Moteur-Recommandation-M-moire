# cleanup_database.py
import psycopg2

# Votre URL de connexion Neon
DATABASE_URL = "postgresql://neondb_owner:npg_5hHlUy3EaAzd@ep-cool-cherry-ac0595v5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def clean_alembic_version():
    try:
        print("Connexion à la base de données...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Vérifier si la table alembic_version existe
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'alembic_version'
            );
        """)
        
        exists = cursor.fetchone()[0]
        
        if exists:
            print("Suppression de la table alembic_version...")
            cursor.execute("DROP TABLE alembic_version;")
            print("✅ Table alembic_version supprimée")
        else:
            print("ℹ️ Table alembic_version n'existe pas")
        
        # Lister les tables existantes
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"\n📋 Tables existantes dans la base:")
        for table in tables:
            print(f"  - {table[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    clean_alembic_version()