# create_users.py
import sys
import os
from dotenv import load_dotenv

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_users():
    """Crée les utilisateurs de test"""
    db = SessionLocal()
    try:
        users = [
            {
                "email": "admin@thesis.com",
                "full_name": "Administrateur Système",
                "password": "admin123",
                "role": "admin"
            },
            {
                "email": "rkule@thesis.com",
                "full_name": "Robert KULE",
                "password": "123456",
                "role": "admin"
            },
            {
                "email": "enseignant@thesis.com",
                "full_name": "Professeur Jean Dupont",
                "password": "enseignant123",
                "role": "enseignant"
            },
            {
                "email": "etudiant@thesis.com",
                "full_name": "Étudiant Pierre Martin",
                "password": "etudiant123",
                "role": "etudiant"
            },
            {
                "email": "etudiant2@thesis.com",
                "full_name": "Étudiant Marie Curie",
                "password": "etudiant123",
                "role": "etudiant"
            }
        ]
        
        for user_data in users:
            # Vérifier si l'utilisateur existe déjà
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=get_password_hash(user_data["password"]),
                    role=user_data["role"]
                )
                db.add(user)
                print(f"✅ Utilisateur créé: {user_data['email']} ({user_data['role']})")
            else:
                print(f"⚠️ Utilisateur existe déjà: {user_data['email']}")
        
        db.commit()
        print("\n🎉 Tous les utilisateurs de test ont été créés!")
        print("\nIdentifiants de test:")
        for user_data in users:
            print(f"  Email: {user_data['email']}")
            print(f"  Mot de passe: {user_data['password']}")
            print(f"  Rôle: {user_data['role']}")
            print()
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    load_dotenv()
    create_users()