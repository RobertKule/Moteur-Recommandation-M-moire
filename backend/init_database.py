# backend/init_database.py
import sys
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.models import User, UserPreference, UserProfile, UserSkill, Sujet, Feedback
from app.auth import get_password_hash

def create_tables():
    """Crée toutes les tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès")

def create_users():
    """Crée les utilisateurs de test"""
    db = SessionLocal()
    try:
        users_data = [
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
            },
            {
                "email": "etudiant3@thesis.com",
                "full_name": "Étudiant Ahmed Benali",
                "password": "etudiant123",
                "role": "etudiant"
            },
            {
                "email": "etudiant4@thesis.com",
                "full_name": "Étudiant Fatoumata Diallo",
                "password": "etudiant123",
                "role": "etudiant"
            }
        ]
        
        created_users = []
        for user_data in users_data:
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
                created_users.append(user_data["email"])
                print(f"✅ Utilisateur créé: {user_data['email']} ({user_data['role']})")
            else:
                print(f"⚠️ Utilisateur existe déjà: {user_data['email']}")
        
        db.commit()
        print(f"\n🎉 {len(created_users)} nouveaux utilisateurs créés")
        return True
        
    except Exception as e:
        print(f"❌ Erreur création utilisateurs: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def create_user_preferences_and_profiles():
    """Crée les préférences et profils pour chaque utilisateur"""
    db = SessionLocal()
    try:
        # Récupérer tous les utilisateurs étudiants et enseignants
        users = db.query(User).filter(User.role.in_(["etudiant", "enseignant"])).all()
        
        if not users:
            print("⚠️ Aucun utilisateur étudiant/enseignant trouvé")
            return False
        
        interests_options = [
            "IA, Machine Learning, Data Science, Big Data",
            "Cybersécurité, Réseaux, Cloud Computing",
            "Développement Web, Mobile, DevOps",
            "Robotique, Automatisation, IoT",
            "Énergie renouvelable, Développement durable",
            "Matériaux avancés, Nanotechnologie",
            "Simulation numérique, CFD, CAO",
            "Smart Cities, Transport intelligent"
        ]
        
        universities = [
            "Université de Kinshasa",
            "Université de Lubumbashi",
            "Université de Kisangani",
            "Institut Supérieur de Techniques Appliquées",
            "Université Pédagogique Nationale"
        ]
        
        fields = [
            "Génie Informatique",
            "Génie Électrique", 
            "Génie Électronique",
            "Génie Mécanique",
            "Génie Civil"
        ]
        
        levels = ["L1", "L2", "L3", "M1", "M2", "Doctorant"]
        
        created_count = 0
        for user in users:
            # Vérifier si les préférences existent déjà
            existing_pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
            if not existing_pref:
                preference = UserPreference(
                    user_id=user.id,
                    interests=random.choice(interests_options),
                    faculty=random.choice(fields),
                    level=random.choice(levels),
                    preferences='{"theme": "light", "notifications": true, "language": "fr"}'
                )
                db.add(preference)
                created_count += 1
            
            # Vérifier si le profil existe déjà
            existing_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
            if not existing_profile:
                profile = UserProfile(
                    user_id=user.id,
                    bio=f"{user.full_name}, passionné(e) par les technologies innovantes.",
                    location="Kinshasa, RDC",
                    university=random.choice(universities),
                    field=random.choice(fields),
                    level=random.choice(levels),
                    interests=random.choice(interests_options),
                    phone=f"+243 8{random.randint(10, 99)} {random.randint(100, 999)} {random.randint(100, 999)}",
                    linkedin=f"https://linkedin.com/in/{user.email.split('@')[0]}",
                    github=f"https://github.com/{user.email.split('@')[0]}"
                )
                db.add(profile)
                created_count += 1
            
            # Vérifier si des compétences existent déjà
            existing_skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).count()
            if existing_skills == 0:
                skills_data = [
                    {"name": "Python", "level": random.randint(6, 10), "category": "Programmation"},
                    {"name": "Java", "level": random.randint(5, 9), "category": "Programmation"},
                    {"name": "C++", "level": random.randint(4, 8), "category": "Programmation"},
                    {"name": "TensorFlow", "level": random.randint(3, 8), "category": "IA/ML"},
                    {"name": "React", "level": random.randint(5, 9), "category": "Web"},
                    {"name": "AutoCAD", "level": random.randint(4, 8), "category": "CAO"},
                    {"name": "MATLAB", "level": random.randint(5, 9), "category": "Calcul scientifique"},
                    {"name": "SolidWorks", "level": random.randint(4, 8), "category": "CAO"},
                    {"name": "Arduino", "level": random.randint(5, 9), "category": "Électronique"},
                    {"name": "SQL", "level": random.randint(6, 10), "category": "Base de données"}
                ]
                
                for skill_data in random.sample(skills_data, random.randint(3, 6)):
                    skill = UserSkill(
                        user_id=user.id,
                        name=skill_data["name"],
                        level=skill_data["level"],
                        category=skill_data["category"]
                    )
                    db.add(skill)
                    created_count += 1
        
        db.commit()
        print(f"✅ {created_count} éléments créés (préférences, profils et compétences)")
        return True
        
    except Exception as e:
        print(f"❌ Erreur création préférences/profils: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def create_sujets():
    """Crée des sujets pour chaque domaine d'ingénierie"""
    db = SessionLocal()
    try:
        # Vérifier si des sujets existent déjà
        existing_sujets = db.query(Sujet).count()
        if existing_sujets > 10:
            print(f"⚠️ {existing_sujets} sujets existent déjà, passage à l'étape suivante")
            return True
        
        # Données pour les sujets par domaine
        sujets_templates = [
            # Génie Informatique
            {
                "titre": "Système de recommandation intelligent pour bibliothèques universitaires",
                "keywords": "IA, recommandation, bibliothèque, machine learning, Python, Django",
                "domaine": "Génie Informatique",
                "faculté": "Informatique",
                "problématique": "Comment améliorer l'accès aux ressources documentaires universitaires grâce à un système de recommandation intelligent ?",
                "méthodologie": "Analyse des besoins, développement d'algorithme de recommandation, tests utilisateurs, validation statistique",
                "technologies": "Python, Django, Scikit-learn, PostgreSQL, React",
                "description": "Développement d'un système de recommandation basé sur l'IA pour suggérer des ressources documentaires pertinentes aux étudiants selon leur profil académique et leurs intérêts.",
                "difficulté": "moyenne",
                "durée_estimée": "6 mois",
                "ressources": "Accès à une base de données bibliographique, serveur de développement, documentation technique, datasets d'utilisation"
            },
            {
                "titre": "Application mobile pour la gestion des stages académiques",
                "keywords": "mobile, stages, gestion, Flutter, Firebase, éducation",
                "domaine": "Génie Informatique",
                "faculté": "Informatique",
                "problématique": "Comment digitaliser et optimiser la gestion des stages académiques dans les universités congolaises ?",
                "méthodologie": "Conception UX/UI, développement cross-platform, tests de validation, enquêtes utilisateurs",
                "technologies": "Flutter, Firebase, Node.js, REST API, MongoDB",
                "description": "Création d'une application mobile complète pour la gestion des stages (recherche, candidature, suivi, évaluation, attestation).",
                "difficulté": "moyenne",
                "durée_estimée": "5 mois",
                "ressources": "Smartphones de test, compte Firebase, documentation Flutter, API existantes"
            },
            {
                "titre": "Analyse prédictive de la réussite étudiante avec Machine Learning",
                "keywords": "analyse prédictive, éducation, machine learning, data mining, Python",
                "domaine": "Génie Informatique",
                "faculté": "Informatique",
                "problématique": "Peut-on prédire la réussite académique des étudiants à partir de leurs données académiques et personnelles ?",
                "méthodologie": "Collecte de données, préprocessing, modélisation ML, validation croisée, interprétation",
                "technologies": "Python, Pandas, Scikit-learn, XGBoost, Jupyter",
                "description": "Développement d'un modèle prédictif pour identifier les étudiants à risque d'échec académique et proposer des interventions ciblées.",
                "difficulté": "difficile",
                "durée_estimée": "8 mois",
                "ressources": "Données académiques anonymisées, serveur de calcul, outils d'analyse, littérature scientifique"
            },
            # Génie Électrique
            {
                "titre": "Optimisation de la consommation énergétique dans les bâtiments universitaires",
                "keywords": "énergie, optimisation, bâtiments intelligents, IoT, capteurs, smart grid",
                "domaine": "Génie Électrique",
                "faculté": "Électrique",
                "problématique": "Comment réduire la consommation énergétique des bâtiments universitaires grâce à l'IoT et l'IA ?",
                "méthodologie": "Installation de capteurs, collecte de données, analyse, optimisation algorithmique, simulation",
                "technologies": "Arduino, Raspberry Pi, Python, MQTT, TensorFlow, Grafana",
                "description": "Conception et déploiement d'un système intelligent de gestion énergétique pour campus universitaire avec monitoring en temps réel.",
                "difficulté": "difficile",
                "durée_estimée": "9 mois",
                "ressources": "Capteurs de température/humidité/consommation, modules IoT, logiciels de simulation, documentation technique"
            },
            {
                "titre": "Système de surveillance de la qualité de l'énergie électrique",
                "keywords": "qualité énergie, surveillance, harmoniques, perturbations, MATLAB, LabVIEW",
                "domaine": "Génie Électrique",
                "faculté": "Électrique",
                "problématique": "Comment surveiller et analyser la qualité de l'énergie électrique dans les installations sensibles des universités ?",
                "méthodologie": "Mesures sur site, analyse des données, simulation numérique, recommandations techniques",
                "technologies": "MATLAB, Simulink, analyseur de qualité d'énergie, LabVIEW, Python",
                "description": "Développement d'un système de surveillance en temps réel de la qualité de l'énergie avec alertes et rapports automatisés.",
                "difficulté": "moyenne",
                "durée_estimée": "6 mois",
                "ressources": "Analyseur de qualité d'énergie, logiciels de simulation, données de mesure, normes techniques"
            },
            # Génie Électronique
            {
                "titre": "Conception d'un système embarqué pour agriculture de précision",
                "keywords": "système embarqué, agriculture, capteurs, IoT, ARM, LoRa",
                "domaine": "Génie Électronique",
                "faculté": "Électronique",
                "problématique": "Comment développer un système embarqué low-cost pour l'agriculture de précision adapté au contexte congolais ?",
                "méthodologie": "Conception électronique, programmation embarquée, tests terrain, validation agricole",
                "technologies": "STM32, capteurs agricoles, LoRa, C/C++, PCB design",
                "description": "Développement d'une station météo intelligente autonome pour l'optimisation des ressources agricoles (eau, engrais, pesticides).",
                "difficulté": "difficile",
                "durée_estimée": "10 mois",
                "ressources": "Kits de développement STM32, capteurs divers, logiciels de CAO électronique, terrain de test"
            },
            {
                "titre": "Système de détection précoce des feux de brousse",
                "keywords": "détection feu, capteurs, drone, traitement image, alarme, surveillance",
                "domaine": "Génie Électronique",
                "faculté": "Électronique",
                "problématique": "Comment détecter rapidement les départs de feu dans les zones rurales et forestières ?",
                "méthodologie": "Conception hardware, algorithmes de détection, tests en conditions réelles, optimisation",
                "technologies": "Caméra thermique, traitement d'images, communications sans fil, drone, AI",
                "description": "Création d'un système autonome de surveillance et d'alerte précoce pour feux de brousse avec notification SMS/email.",
                "difficulté": "moyenne",
                    "durée_estimée": "7 mois",
                "ressources": "Composants électroniques, caméra thermique, drone de test, logiciels de traitement"
            },
            # Génie Mécanique
            {
                "titre": "Conception et fabrication d'un broyeur de manioc amélioré",
                "keywords": "conception mécanique, fabrication, manioc, rendement, SolidWorks, fabrication additive",
                "domaine": "Génie Mécanique",
                "faculté": "Mécanique",
                "problématique": "Comment améliorer l'efficacité et la sécurité des broyeurs traditionnels de manioc utilisés par les producteurs locaux ?",
                "méthodologie": "Analyse des besoins, conception 3D, prototypage, tests mécaniques, amélioration itérative",
                "technologies": "SolidWorks, fabrication additive, tests mécaniques, analyse FEM",
                "description": "Conception et fabrication d'un broyeur de manioc plus efficace, sécuritaire et économique pour les producteurs locaux.",
                "difficulté": "moyenne",
                "durée_estimée": "5 mois",
                "ressources": "Logiciel CAO, atelier de fabrication, matériaux locaux, machines de test"
            },
            {
                "titre": "Optimisation aérodynamique d'un véhicule solaire",
                "keywords": "aérodynamique, véhicule solaire, CFD, optimisation, énergie, compétition",
                "domaine": "Génie Mécanique",
                "faculté": "Mécanique",
                "problématique": "Comment optimiser la forme aérodynamique d'un véhicule solaire pour minimiser la consommation énergétique ?",
                "méthodologie": "Modélisation 3D, simulation CFD, optimisation paramétrique, validation expérimentale",
                "technologies": "ANSYS Fluent, SolidWorks, Python (optimisation), impression 3D",
                "description": "Étude et optimisation aérodynamique complète d'un véhicule à énergie solaire pour compétition universitaire.",
                "difficulté": "difficile",
                "durée_estimée": "8 mois",
                "ressources": "Logiciels de simulation, accès à cluster de calcul, documentation technique, véhicule prototype"
            },
            # Génie Civil
            {
                "titre": "Étude de la durabilité des bétons à base de matériaux locaux",
                "keywords": "béton, durabilité, matériaux locaux, construction, tests, RDC",
                "domaine": "Génie Civil",
                "faculté": "Civil",
                "problématique": "Comment améliorer la durabilité des bétons fabriqués avec des matériaux locaux disponibles en RDC ?",
                "méthodologie": "Formulation béton, tests mécaniques, analyse microstructure, vieillissement accéléré, comparaison",
                "technologies": "Logiciels de formulation, presse de compression, microscope électronique, analyse chimique",
                "description": "Recherche sur l'optimisation des formulations de béton utilisant des matériaux locaux pour une meilleure durabilité et réduction des coûts.",
                "difficulté": "moyenne",
                "durée_estimée": "7 mois",
                "ressources": "Laboratoire de matériaux, équipements de test, échantillons locaux, normes techniques"
            },
            {
                "titre": "Système de monitoring structural pour ponts routiers",
                "keywords": "monitoring, ponts, capteurs, intégrité structurale, sécurité, IoT",
                "domaine": "Génie Civil",
                "faculté": "Civil",
                "problématique": "Comment surveiller en temps réel l'intégrité structurale des ponts routiers vieillissants en RDC ?",
                "méthodologie": "Instrumentation sur site, acquisition données, analyse vibratoire, seuils d'alerte, maintenance prédictive",
                "technologies": "Accéléromètres, strain gauges, acquisition données, traitement signal, dashboard",
                "description": "Développement et déploiement d'un système de monitoring intelligent pour ponts avec alertes et suivi à long terme.",
                "difficulté": "difficile",
                "durée_estimée": "10 mois",
                "ressources": "Capteurs structurels, système d'acquisition, logiciels d'analyse, accès à ponts réels"
            }
        ]
        
        created_count = 0
        niveaux = ["L3", "M1", "M2"]
        
        for template in sujets_templates:
            for niveau in niveaux:
                # Ajouter une variation au titre pour chaque niveau
                titre_variation = {
                    "L3": "Étude préliminaire sur",
                    "M1": "Développement et implémentation d'un",
                    "M2": "Recherche approfondie sur un"
                }
                
                sujet = Sujet(
                    titre=f"{titre_variation[niveau]} {template['titre']}",
                    keywords=template['keywords'],
                    domaine=template['domaine'],
                    faculté=template['faculté'],
                    niveau=niveau,
                    problématique=template['problématique'],
                    méthodologie=template['méthodologie'],
                    technologies=template['technologies'],
                    description=template['description'],
                    difficulté=template['difficulté'],
                    durée_estimée=template['durée_estimée'],
                    ressources=template['ressources'],
                    vue_count=random.randint(10, 250),
                    like_count=random.randint(5, 80),
                    is_active=True,
                    created_at=datetime.now() - timedelta(days=random.randint(1, 365))
                )
                db.add(sujet)
                created_count += 1
        
        db.commit()
        print(f"✅ {created_count} sujets créés pour tous les domaines d'ingénierie")
        return True
        
    except Exception as e:
        print(f"❌ Erreur création sujets: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def create_feedbacks():
    """Crée des feedbacks pour simuler des interactions"""
    db = SessionLocal()
    try:
        # Vérifier si des feedbacks existent déjà
        existing_feedbacks = db.query(Feedback).count()
        if existing_feedbacks > 5:
            print(f"⚠️ {existing_feedbacks} feedbacks existent déjà, passage à l'étape suivante")
            return True
        
        # Récupérer tous les étudiants
        etudiants = db.query(User).filter(User.role == "etudiant").all()
        
        # Récupérer tous les sujets
        sujets = db.query(Sujet).all()
        
        if not etudiants or not sujets:
            print("⚠️ Pas assez d'étudiants ou de sujets pour créer des feedbacks")
            return False
        
        feedbacks_created = 0
        for etudiant in etudiants:
            # Sélectionner 3-6 sujets aléatoires par étudiant
            selected_sujets = random.sample(sujets, min(len(sujets), random.randint(3, 6)))
            
            for sujet in selected_sujets:
                # Vérifier si un feedback existe déjà pour cette combinaison
                existing = db.query(Feedback).filter(
                    Feedback.user_id == etudiant.id,
                    Feedback.sujet_id == sujet.id
                ).first()
                
                if not existing:
                    feedback = Feedback(
                        user_id=etudiant.id,
                        sujet_id=sujet.id,
                        rating=random.randint(3, 5),
                        pertinence=random.randint(6, 10),
                        commentaire=random.choice([
                            "Sujet très intéressant et pertinent pour mes études",
                            "Bonne problématique, à approfondir avec plus de détails techniques",
                            "Méthodologie claire et réalisable dans le temps imparti",
                            "Domaine d'avenir, je suis très intéressé par cette thématique",
                            "Technologies adaptées au niveau et aux compétences requises",
                            "Proposition innovante avec une bonne valeur ajoutée",
                            "Sujet bien structuré mais nécessite plus de précision sur la méthodologie",
                            "Excellent sujet pour un mémoire de master"
                        ]),
                        intéressé=random.choice([True, False]),
                        sélectionné=random.choice([True, False, False, False]),  # 25% de chance
                        created_at=datetime.now() - timedelta(days=random.randint(1, 90))
                    )
                    db.add(feedback)
                    feedbacks_created += 1
        
        db.commit()
        print(f"✅ {feedbacks_created} feedbacks créés pour simuler les interactions")
        return True
        
    except Exception as e:
        print(f"❌ Erreur création feedbacks: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def get_database_stats():
    """Récupère les statistiques de la base de données"""
    db = SessionLocal()
    try:
        stats = {
            "users": db.query(User).count(),
            "admins": db.query(User).filter(User.role == "admin").count(),
            "enseignants": db.query(User).filter(User.role == "enseignant").count(),
            "etudiants": db.query(User).filter(User.role == "etudiant").count(),
            "sujets": db.query(Sujet).count(),
            "feedbacks": db.query(Feedback).count(),
            "preferences": db.query(UserPreference).count(),
            "profiles": db.query(UserProfile).count(),
            "skills": db.query(UserSkill).count()
        }
        return stats
    except Exception as e:
        print(f"❌ Erreur récupération stats: {e}")
        return {}
    finally:
        db.close()

def display_stats():
    """Affiche les statistiques de la base de données"""
    stats = get_database_stats()
    if stats:
        print("\n" + "=" * 60)
        print("📊 STATISTIQUES DE LA BASE DE DONNÉES")
        print("=" * 60)
        print(f"   👥 Utilisateurs: {stats['users']}")
        print(f"     ├─ Administrateurs: {stats['admins']}")
        print(f"     ├─ Enseignants: {stats['enseignants']}")
        print(f"     └─ Étudiants: {stats['etudiants']}")
        print(f"   📚 Sujets: {stats['sujets']}")
        print(f"   💬 Feedbacks: {stats['feedbacks']}")
        print(f"   ⚙️ Préférences: {stats['preferences']}")
        print(f"   👤 Profils: {stats['profiles']}")
        print(f"   🛠️ Compétences: {stats['skills']}")
        print("=" * 60)

def main():
    """Fonction principale d'initialisation"""
    print("=" * 60)
    print("INITIALISATION COMPLÈTE DE LA BASE DE DONNÉES MEMOBOT")
    print("=" * 60)
    
    # Charger les variables d'environnement
    load_dotenv()
    
    # 1. Créer les tables
    print("\n1️⃣ Création des tables...")
    create_tables()
    
    # 2. Créer les utilisateurs
    print("\n2️⃣ Création des utilisateurs...")
    if not create_users():
        print("❌ Échec de la création des utilisateurs")
        return
    
    # 3. Créer les profils et préférences
    print("\n3️⃣ Création des profils, préférences et compétences...")
    create_user_preferences_and_profiles()
    
    # 4. Créer les sujets
    print("\n4️⃣ Création des sujets de mémoire...")
    create_sujets()
    
    # 5. Créer les feedbacks
    print("\n5️⃣ Création des feedbacks et interactions...")
    create_feedbacks()
    
    # Afficher les statistiques finales
    display_stats()
    
    print("\n🎉 INITIALISATION TERMINÉE AVEC SUCCÈS !")
    
    print("\n🔑 IDENTIFIANTS DE TEST :")
    print("   👑 Administrateurs:")
    print("      • admin@thesis.com / admin123")
    print("      • rkule@thesis.com / 123456")
    print("   🎓 Enseignant:")
    print("      • enseignant@thesis.com / enseignant123")
    print("   🧑‍🎓 Étudiants:")
    print("      • etudiant@thesis.com / etudiant123")
    print("      • etudiant2@thesis.com / etudiant123")
    print("      • etudiant3@thesis.com / etudiant123")
    print("      • etudiant4@thesis.com / etudiant123")
    
    print("\n🌐 URLs d'accès :")
    print("   Frontend: http://localhost:3000")
    print("   Backend API: http://localhost:8000")
    print("   Documentation API: http://localhost:8000/docs")
    print("   Test API: http://localhost:8000/health")
    
    print("\n💡 Conseils :")
    print("   1. Connectez-vous avec un compte étudiant pour explorer les fonctionnalités")
    print("   2. Testez la recherche de sujets par domaine et niveau")
    print("   3. Utilisez l'assistant IA pour obtenir des recommandations")
    print("   4. Consultez les statistiques dans le dashboard")

if __name__ == "__main__":
    main()