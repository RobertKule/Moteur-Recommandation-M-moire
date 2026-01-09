# app_console.py - VERSION AVEC HISTORIQUE CONVERSATIONNEL
"""
Interface console du système de recommandation de sujets de mémoire
avec historique conversationnel intelligent
"""

import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuration avancée du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)-25s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Ajout du répertoire courant au chemin Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import des modules métier
try:
    from loader import load_thesis_data
    from embeddings import VectorStoreManager
    from recommender import ThesisRecommender
    logger.info("✅ Modules métier importés avec succès")
except ImportError as e:
    logger.error(f"❌ Erreur d'importation: {str(e)}")
    print("\n⚠️  Vérifiez l'installation des packages:")
    print("   pip install sentence-transformers langchain-chroma langchain-huggingface")
    sys.exit(1)

# Configuration
CHROMA_DIR = "chroma_db"
DATA_PATH = "data/Sujet_EtudiantsB.csv"

class ConversationManager:
    """
    Gestionnaire intelligent de conversation
    """
    def __init__(self, max_history: int = 5):
        self.messages = []
        self.max_history = max_history
        self.current_context = None
        self.last_recommendations = []
        self.conversation_topic = None
        
    def add_message(self, role: str, content: str, metadata: dict = None):
        """Ajoute un message à l'historique"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        })
        
        # Garder seulement les derniers messages
        if len(self.messages) > self.max_history * 2:  # *2 pour user + assistant
            self.messages = self.messages[-(self.max_history * 2):]
            
    def get_conversation_summary(self) -> str:
        """Retourne un résumé de la conversation pour le contexte"""
        if not self.messages:
            return "Première interaction."
        
        summary = "Résumé de la conversation:\n"
        user_messages = [m for m in self.messages if m["role"] == "user"]
        assistant_messages = [m for m in self.messages if m["role"] == "assistant"]
        
        if user_messages:
            summary += f"Dernière requête utilisateur: '{user_messages[-1]['content'][:100]}...'\n"
        
        if self.conversation_topic:
            summary += f"Thème en cours: {self.conversation_topic}\n"
            
        if self.last_recommendations:
            summary += f"Dernières recommandations: {len(self.last_recommendations)} sujets\n"
            
        return summary
    
    def update_topic(self, topic: str):
        """Met à jour le thème de conversation"""
        self.conversation_topic = topic
        
    def store_recommendations(self, recommendations: list):
        """Stocke les dernières recommandations"""
        self.last_recommendations = recommendations
        
    def clear(self):
        """Efface l'historique"""
        self.messages = []
        self.current_context = None
        self.last_recommendations = []
        self.conversation_topic = None

class ConsoleRecommender:
    """
    Interface console complète pour le système de recommandation
    avec gestion intelligente de la conversation
    """
    
    def __init__(self):
        self.history = []  # Historique des recherches (pour statistiques)
        self.vectorstore_manager = None
        self.recommender = None
        self.data_loaded = False
        self.conversation = ConversationManager()  # Nouveau: gestionnaire de conversation
        
    def initialize_system(self) -> bool:
        """
        Initialise le système complet
        """
        try:
            print("\n" + "="*60)
            print("🎓 SYSTÈME DE RECOMMANDATION DE SUJETS DE MÉMOIRE")
            print("="*60)
            print("🤖 Version avec historique conversationnel intelligent")
            print("="*60)
            
            # 1. Vérification du fichier de données
            print("\n📂 Vérification des données...")
            if not os.path.exists(DATA_PATH):
                print(f"❌ Fichier de données non trouvé: {DATA_PATH}")
                print("   Placez le fichier 'Sujet_EtudiantsB.csv' dans le dossier 'data/'")
                return False
            
            # 2. Chargement des données
            print("📊 Chargement des sujets de mémoire...")
            df = load_thesis_data(DATA_PATH)
            print(f"   ✅ {len(df)} sujets chargés")
            
            # Aperçu des données
            print(f"   📋 Exemples de sujets:")
            faculties = df["student_faculty"].dropna().unique()[:3]
            for i, faculty in enumerate(faculties, 1):
                count = len(df[df["student_faculty"] == faculty])
                print(f"     {i}. {faculty}: {count} sujets")
            
            # 3. Préparation des données pour embeddings
            print("\n🔧 Préparation des textes pour embeddings...")
            texts = df["full_text"].tolist()
            
            # Préparation des métadonnées
            metadatas = []
            for _, row in df.iterrows():
                metadata = {
                    "title": str(row.get("thesis_title", ""))[:200],
                    "faculty": str(row.get("student_faculty", "")),
                    "level": str(row.get("student_level", "")),
                    "keywords": str(row.get("thesis_keywords", ""))[:100],
                    "id": str(row.get("ID", "")),
                    "description": str(row.get("description_sujet", ""))[:200]
                }
                metadatas.append(metadata)
            
            print(f"   ✅ {len(texts)} textes préparés")
            print(f"   ✅ {len(metadatas)} métadonnées préparées")
            
            # 4. Initialisation du vectorstore
            print("\n🧠 Initialisation de la base vectorielle...")
            self.vectorstore_manager = VectorStoreManager(persist_directory=CHROMA_DIR)
            
            # Création ou chargement de la base
            print("   Création/chargement de la base Chroma...")
            if not self.vectorstore_manager.ensure_vectorstore(texts, metadatas):
                print("❌ Échec de la création de la base vectorielle")
                return False
            
            # Vérification
            vec_info = self.vectorstore_manager.get_vectorstore_info()
            if vec_info["status"] == "initialise":
                count = vec_info.get("documents_count", 0)
                print(f"   ✅ Base vectorielle prête: {count} sujets indexés")
            else:
                print(f"❌ Problème avec la base vectorielle: {vec_info}")
                return False
            
            # 5. Initialisation du recommender
            print("\n🤖 Initialisation du moteur de recommandation...")
            self.recommender = ThesisRecommender(self.vectorstore_manager)
            print("   ✅ Moteur de recommandation prêt")
            
            # 6. Affichage du statut système
            status = self.recommender.get_system_status()
            print(f"\n📊 Statut du système:")
            print(f"   • LLM: {'✅ Initialisé' if status['llm_initialized'] else '❌ Erreur'}")
            print(f"   • Vectorstore: {vec_info.get('documents_count', 'N/A')} sujets")
            print(f"   • Mode: Conversationnel avec historique")
            
            self.data_loaded = True
            print("\n" + "="*60)
            print("✅ Système initialisé avec succès!")
            print("="*60)
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'initialisation: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def display_welcome(self):
        """Affiche le message de bienvenue"""
        print("\n" + "="*60)
        print("💬 INTERACTION CONSOLE AVEC HISTORIQUE")
        print("="*60)
        print("\nJe vais vous aider à trouver un sujet de mémoire pertinent.")
        print("\nLe système se souvient de notre conversation!")
        print("\nExemples de dialogues intelligents:")
        print("   Vous: 'Je veux un sujet en génie info sur la compression d'images'")
        print("   Moi: [propose des sujets sur la compression]")
        print("   Vous: 'Développe le premier sujet'")
        print("   Moi: [développe le sujet 1 sur la compression]")
        print("\nCommandes disponibles: help, status, history, clear, quit")
        print("-"*60)
    
    def display_help(self):
        """Affiche l'aide"""
        print("\n" + "="*60)
        print("📖 AIDE - DIALOGUE INTELLIGENT")
        print("="*60)
        print("\n🌟 NOUVEAU: Le système se souvient de la conversation!")
        
        print("\n💬 Exemples de dialogues:")
        print("  • 'Je suis en Génie Info M1, compression d'images'")
        print("  • 'Développe le sujet 2' (référence aux recommandations précédentes)")
        print("  • 'Et pour la vidéo ?' (suite logique)")
        print("  • 'Changeons pour la sécurité réseau' (nouveau thème)")
        
        print("\n📋 Commandes spéciales:")
        print("  help     - Afficher cette aide")
        print("  status   - Afficher l'état du système")
        print("  history  - Afficher l'historique des recherches")
        print("  clear    - Effacer l'historique de conversation")
        print("  quit     - Quitter le programme")
        
        print("\n🎯 Conseils:")
        print("  1. Plus vous détaillez votre profil, mieux c'est")
        print("  2. Référencez les numéros de sujet (ex: 'sujet 1')")
        print("  3. Le système adapte ses réponses au contexte")
        print("-"*60)
    
    def display_status(self):
        """Affiche le statut du système"""
        if not self.data_loaded:
            print("\n⚠️  Système non initialisé")
            return
        
        status = self.recommender.get_system_status()
        
        print("\n" + "="*60)
        print("📊 STATUT DU SYSTÈME ET CONVERSATION")
        print("="*60)
        print(f"\n• Date/Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"• Historique recherches: {len(self.history)} requêtes")
        print(f"• Messages conversation: {len(self.conversation.messages)}")
        print(f"• Thème en cours: {self.conversation.conversation_topic or 'Aucun'}")
        print(f"• LLM: {'✅ Prêt' if status['llm_initialized'] else '❌ Erreur'}")
        
        vec_info = self.vectorstore_manager.get_vectorstore_info()
        if vec_info.get('status') == 'initialise':
            print(f"• Vectorstore: {vec_info.get('documents_count', 'N/A')} sujets indexés")
        else:
            print(f"• Vectorstore: {vec_info.get('status', 'inconnu')}")
        
        # Afficher les derniers messages
        if self.conversation.messages:
            print(f"\n📝 Derniers échanges:")
            for msg in self.conversation.messages[-4:]:
                role_icon = "👤" if msg["role"] == "user" else "🤖"
                print(f"  {role_icon} {msg['content'][:60]}...")
        
        print("="*60)
    
    def display_history(self):
        """Affiche l'historique des recherches ET de conversation"""
        print("\n" + "="*60)
        print("📜 HISTORIQUE COMPLET")
        print("="*60)
        
        # Historique des recherches
        if self.history:
            print("\n🔍 HISTORIQUE DES RECHERCHES:")
            for i, entry in enumerate(self.history[-5:], 1):
                print(f"\n{i}. {entry['timestamp'][11:19]}")
                print(f"   👤 {entry['input'][:80]}...")
                if entry['result'].get('success'):
                    print(f"   ✅ {entry['result'].get('existing_count', 0)} sujets trouvés")
                else:
                    print("   ❌ Échec")
            print(f"\nTotal recherches: {len(self.history)}")
        else:
            print("\n📭 Aucune recherche dans l'historique")
        
        # Historique de conversation
        if self.conversation.messages:
            print(f"\n💬 HISTORIQUE DE CONVERSATION:")
            for i, msg in enumerate(self.conversation.messages[-6:], 1):
                role = "Utilisateur" if msg["role"] == "user" else "Assistant"
                icon = "👤" if msg["role"] == "user" else "🤖"
                print(f"\n{i}. {icon} {role} ({msg['timestamp'][11:19]}):")
                print(f"   {msg['content'][:100]}...")
        
        print("="*60)
    
    def clear_history(self):
        """Efface l'historique"""
        self.history = []
        self.conversation.clear()
        print("\n🗑️  Historique de recherche ET de conversation effacé")
    
    def _prepare_contextual_input(self, user_input: str) -> str:
        """
        Prépare l'input utilisateur avec le contexte de conversation
        """
        # Vérifier si c'est une référence à un sujet précédent
        input_lower = user_input.lower()
        
        # Détection des références aux sujets
        if any(word in input_lower for word in ["sujet 1", "premier sujet", "le 1", "numero 1"]):
            if self.conversation.last_recommendations and len(self.conversation.last_recommendations) > 0:
                subject = self.conversation.last_recommendations[0]
                return f"Développe et approfondis ce sujet: {subject.get('title', 'Sujet 1')}. Contexte précédent: {self.conversation.conversation_topic or ''}"
        
        elif any(word in input_lower for word in ["sujet 2", "deuxième sujet", "le 2", "numero 2"]):
            if self.conversation.last_recommendations and len(self.conversation.last_recommendations) > 1:
                subject = self.conversation.last_recommendations[1]
                return f"Développe et approfondis ce sujet: {subject.get('title', 'Sujet 2')}. Contexte précédent: {self.conversation.conversation_topic or ''}"
        
        # Ajouter le contexte de conversation si disponible
        if self.conversation.conversation_topic:
            context_summary = self.conversation.get_conversation_summary()
            return f"{user_input} (Contexte: {self.conversation.conversation_topic})"
        
        return user_input
    
    def process_recommendation(self, user_input: str):
        """
        Traite une requête de recommandation avec contexte
        """
        try:
            # Ajouter à l'historique de conversation
            self.conversation.add_message("user", user_input)
            
            # Préparer l'input avec contexte
            contextual_input = self._prepare_contextual_input(user_input)
            
            print(f"\n{'='*50}")
            print(f"🔍 Analyse contextuelle")
            print(f"{'='*50}")
            
            # Afficher le contexte si disponible
            if self.conversation.conversation_topic:
                print(f"💭 Thème en cours: {self.conversation.conversation_topic}")
            
            print(f"👤 Vous: '{user_input[:80]}...'")
            
            # Génération des recommandations AVEC contexte
            print("\n🧠 Processus intelligent en cours...")
            print("1. 🔎 Analyse du contexte conversationnel")
            print("2. 📚 Recherche de sujets pertinents")
            print("3. 🚀 Génération de NOUVEAUX sujets adaptés")
            
            # Passer le contexte de conversation au recommender
            conversation_context = {
                "topic": self.conversation.conversation_topic,
                "last_recommendations": self.conversation.last_recommendations,
                "message_count": len(self.conversation.messages)
            }
            
            # Note: Tu devras modifier recommender.py pour accepter ce paramètre
            result = self.recommender.recommend(
                student_input=contextual_input,
                conversation_context=conversation_context
            )
            
            # Enregistrer dans l'historique des recherches
            history_entry = {
                "timestamp": datetime.now().isoformat(),
                "input": user_input,
                "contextual_input": contextual_input,
                "result": result
            }
            self.history.append(history_entry)
            
            if result["success"]:
                print(f"\n✅ Recommandations générées avec succès!")
                
                # Mettre à jour le thème de conversation
                profile_info = result.get("profile", {}).get("extracted_info", {})
                if "thematiques" in profile_info:
                    self.conversation.update_topic(profile_info["thematiques"])
                elif "faculte" in profile_info:
                    self.conversation.update_topic(profile_info["faculte"])
                
                # Stocker les recommandations pour référence future
                if "inspiration_sources" in result:
                    self.conversation.store_recommendations(result["inspiration_sources"])
                
                # Afficher les sources d'inspiration
                if "inspiration_sources" in result and result["inspiration_sources"]:
                    print(f"\n{'='*40}")
                    print("📚 SOURCES D'INSPIRATION")
                    print(f"{'='*40}")
                    
                    print("\n🔍 Sujets existants qui ont inspiré les nouvelles propositions:")
                    for i, source in enumerate(result["inspiration_sources"][:3], 1):
                        title = source.get("title", "Sans titre")
                        if len(title) > 70:
                            title = title[:67] + "..."
                        
                        print(f"\n{i}. 📍 {title}")
                        print(f"   🎯 Score: {source.get('score', 0):.3f}")
                        print(f"   🏫 {source.get('faculty', 'N/A')} - {source.get('level', 'N/A')}")
                        if "keywords" in source and source["keywords"]:
                            keywords = source["keywords"]
                            if len(keywords) > 60:
                                keywords = keywords[:57] + "..."
                            print(f"   🔑 {keywords}")
                
                # Afficher l'analyse des sujets existants
                if "existing_analysis" in result and result["existing_analysis"]:
                    print(f"\n{'='*40}")
                    print("📊 ANALYSE DES THÈMES EXISTANTS")
                    print(f"{'='*40}")
                    print("\n" + result["existing_analysis"][:800] + "...")
                
                # Afficher les NOUVEAUX sujets
                if "new_topics" in result and result["new_topics"]:
                    print(f"\n{'='*40}")
                    print("🚀 NOUVEAUX SUJETS PROPOSÉS")
                    print("✨ ORIGINAUX - Non présents dans la base")
                    print("💡 Inspirés par votre contexte et les thèmes pertinents")
                    print(f"{'='*40}")
                    print("\n" + result["new_topics"])
                
                # Afficher les actions possibles avec contexte
                print(f"\n{'='*40}")
                print("🎯 PROCHAINES ÉTAPES POSSIBLES")
                print(f"{'='*40}")
                
                if self.conversation.last_recommendations:
                    print("\n💬 Vous pouvez dire:")
                    for i in range(min(3, len(self.conversation.last_recommendations))):
                        print(f"   • 'Développe le sujet {i+1}'")
                    
                    if len(self.conversation.last_recommendations) > 1:
                        print("   • 'Compare les sujets 1 et 2'")
                    
                    print("   • 'Propose un sujet plus spécifique'")
                    print("   • 'Changeons de thème pour [nouveau thème]'")
                else:
                    print("\n💬 Essayez de:")
                    print("   • Être plus spécifique dans votre demande")
                    print("   • Mentionner votre niveau académique")
                    print("   • Décrire vos compétences techniques")
                    print("   • Préciser le domaine d'application")
                
            else:
                print(f"\n⚠️  {result.get('message', 'Erreur lors de la recommandation')}")
                
                # Suggestions en cas d'erreur
                print(f"\n💡 Suggestions:")
                print("   • Reformulez votre demande")
                print("   • Essayez sans filtre de faculté")
                print("   • Utilisez des mots-clés plus généraux")
                print("   • Tapez 'clear' pour réinitialiser la conversation")
            
            # Ajouter la réponse à l'historique de conversation
            response_summary = "Recommandations générées" if result.get("success") else "Erreur"
            self.conversation.add_message("assistant", response_summary, {
                "success": result.get("success", False),
                "topics_count": result.get("existing_count", 0)
            })
            
            print(f"\n{'='*50}")
            print("💭 Contexte mis à jour | Tapez votre prochaine requête")
            print(f"{'='*50}")
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement: {str(e)}")
            print(f"\n❌ Erreur: {str(e)}")
            print("💡 Essayez de reformuler ou tapez 'clear' pour réinitialiser")
    
    def run(self):
        """
        Boucle principale de l'application console
        """
        if not self.initialize_system():
            print("\n❌ Impossible d'initialiser le système. Vérifiez les logs.")
            return
        
        self.display_welcome()
        
        while True:
            try:
                # Afficher le contexte actuel
                context_indicator = ""
                if self.conversation.conversation_topic:
                    context_indicator = f" [{self.conversation.conversation_topic[:20]}...]"
                
                print(f"\n[{len(self.conversation.messages)//2 + 1}]{context_indicator}", end="")
                user_input = input(" 👤 Vous: ").strip()
                
                # Commandes spéciales
                if user_input.lower() == 'quit':
                    print("\n👋 Au revoir! Bonne chance pour votre mémoire.")
                    break
                
                elif user_input.lower() == 'help':
                    self.display_help()
                    continue
                
                elif user_input.lower() == 'status':
                    self.display_status()
                    continue
                
                elif user_input.lower() == 'history':
                    self.display_history()
                    continue
                
                elif user_input.lower() == 'clear':
                    self.clear_history()
                    print("🔄 Prêt pour une nouvelle conversation!")
                    continue
                
                elif not user_input:
                    continue
                
                # Traitement normal de la requête
                self.process_recommendation(user_input)
                
            except KeyboardInterrupt:
                print("\n\n🛑 Interruption par l'utilisateur")
                print("💾 Conversation sauvegardée. Au revoir!")
                break
            except Exception as e:
                logger.error(f"Erreur dans la boucle principale: {str(e)}")
                print(f"\n⚠️  Erreur système: {str(e)}")
                print("   Tapez 'clear' pour réinitialiser ou 'quit' pour quitter")

def main():
    """
    Point d'entrée principal
    """
    print("\n" + "="*60)
    print("🚀 LANCEMENT DU SYSTÈME DE RECOMMANDATION")
    print("🤖 Version: Conversationnel Intelligent v2.0")
    print("="*60)
    
    try:
        # Vérification des dépendances
        print("\n🔍 Vérification de l'environnement...")
        
        # Vérification de la clé API
        if not os.getenv("GOOGLE_API_KEY"):
            print("⚠️  GOOGLE_API_KEY non définie")
            print("   Certaines fonctionnalités avancées peuvent être limitées")
            print("   Pour Gemini complet: définir GOOGLE_API_KEY dans .env")
        
        # Vérification des packages
        try:
            import sentence_transformers
            print("✅ sentence-transformers: OK")
        except ImportError:
            print("❌ sentence-transformers: MANQUANT")
            print("   Exécutez: pip install sentence-transformers")
            return
        
        try:
            import chromadb
            print("✅ chromadb: OK")
        except ImportError:
            print("❌ chromadb: MANQUANT")
            print("   Exécutez: pip install chromadb")
            return
        
        # Création du système et lancement
        app = ConsoleRecommender()
        app.run()
        
    except Exception as e:
        logger.error(f"Erreur fatale: {str(e)}")
        print(f"\n❌ Erreur fatale: {str(e)}")
        import traceback
        traceback.print_exc()
        
        print("\n🔧 Dépannage immédiat:")
        print("1. pip install sentence-transformers chromadb langchain-chroma langchain-huggingface")
        print("2. Vérifiez data/Sujet_EtudiantsB.csv")
        print("3. python reset_chroma.py (si problèmes de base vectorielle)")
        print("4. Définir GOOGLE_API_KEY dans .env (optionnel)")

if __name__ == "__main__":
    main()