# backend/reset_database.py
import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base

def reset_database():
    """Supprime et recrée toutes les tables"""
    print("⚠️ ATTENTION: Cette action va supprimer TOUTES les données !")
    confirmation = input("Êtes-vous sûr ? (oui/non): ")
    
    if confirmation.lower() == 'oui':
        print("Suppression des tables...")
        Base.metadata.drop_all(bind=engine)
        
        print("Création des tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Base de données réinitialisée avec succès !")
    else:
        print("❌ Opération annulée")

if __name__ == "__main__":
    load_dotenv()
    reset_database()