# recommender.py - VERSION AVEC HISTORIQUE CONVERSATIONNEL
"""
Moteur principal de recommandation de sujets
Combine embeddings sémantiques avec analyse LLM pour générer de NOUVEAUX sujets
inspirés par la base existante mais non présents dans les données
"""

import logging
import re
from typing import Dict, List, Optional
from datetime import datetime

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from embeddings import VectorStoreManager

logger = logging.getLogger(__name__)

class ThesisRecommender:
    """
    Système intelligent de recommandation de NOUVEAUX sujets de mémoire
    inspirés par une base existante de sujets
    """
    
    def __init__(self, vectorstore_manager: VectorStoreManager):
        self.vectorstore = vectorstore_manager
        self.llm = self._initialize_llm()
        self.conversation_history = []  # Historique de conversation
        self.last_recommendations = []  # Dernières recommandations générées
        self.conversation_topic = None  # Thème en cours de conversation
        self.original_prompt = self._create_original_recommendation_prompt()
        self.new_topic_prompt = self._create_new_topic_prompt()
        self.elaboration_prompt = self._create_elaboration_prompt()
        
        logger.info("🎓 Initialisation du ThesisRecommender (version conversationnelle)")
    
    def _initialize_llm(self):
        """Initialise le modèle de langage Gemini"""
        try:
            logger.info("🤖 Initialisation du LLM Gemini...")
            # Essaie gemma-3-1b-it d'abord, sinon gemini-pro
            try:
                return ChatGoogleGenerativeAI(
                    model="gemma-3-1b-it",
                    temperature=0.4,
                    max_tokens=1500
                )
            except:
                return ChatGoogleGenerativeAI(
                    model="gemini-pro",
                    temperature=0.4,
                    max_tokens=1500
                )
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'initialisation du LLM: {str(e)}")
            raise
    
    def _prepare_conversation_context(self) -> str:
        """
        Prépare le contexte de conversation pour les prompts
        VERSION AMÉLIORÉE
        """
        if not self.conversation_history:
            return "Première interaction. L'étudiant commence une nouvelle recherche."
        
        context_lines = []
        
        # Ajouter le thème en cours
        if self.conversation_topic:
            context_lines.append(f"THÈME EN COURS : {self.conversation_topic}")
        
        # Ajouter les derniers échanges (max 3 tours)
        recent_exchanges = []
        for i in range(min(6, len(self.conversation_history))):  # 3 tours complets
            msg = self.conversation_history[-(i+1)]
            role = "ÉTUDIANT" if msg["role"] == "user" else "ASSISTANT"
            recent_exchanges.insert(0, f"{role}: {msg['content'][:80]}...")
        
        if recent_exchanges:
            context_lines.append("DERNIERS ÉCHANGES :")
            context_lines.extend(recent_exchanges)
        
        # Ajouter les sujets précédemment recommandés
        if self.last_recommendations:
            context_lines.append("\nSUJETS PRÉCÉDEMMENT RECOMMANDÉS :")
            for i, rec in enumerate(self.last_recommendations[:3], 1):
                title = rec.get('title', 'Sans titre')
                if len(title) > 50:
                    title = title[:47] + "..."
                context_lines.append(f"{i}. {title}")
        
        return "\n".join(context_lines)
        
    def _analyze_user_intent(self, user_input: str) -> Dict:
        """
        Analyse l'intention de l'utilisateur en fonction de l'input
        VERSION COMPLÈTE
        """
        intent = {
            "type": "new_query",
            "referenced_topic": None,
            "action": "generate",
            "topic_number": None,
            "raw_intent": user_input
        }
        
        input_lower = user_input.lower().strip()
        
        # 1. DÉTECTION DE RÉFÉRENCE À UN SUJET PRÉCÉDENT (prioritaire)
        # Patterns pour "sujet 1", "le 1", "développe le 1", etc.
        patterns = [
            # Patterns explicites avec numéro
            (r"(?:développe|élabore|explique|décris|fais|propose|parle).*?(?:sujet|le|numéro|n°)?\s*(\d+)", 1),
            (r"(?:sujet|le|numéro|n°)\s*(\d+)", 1),
            (r"^(\d+)$", 1),  # Juste un chiffre
            (r"(\d+)(?:ème|eme|er|ère|ere)\s*(?:sujet|proposition|idée)", 1),
            
            # Patterns textuels pour les premiers sujets
            (r"premier\s*sujet", 1),
            (r"deuxi[èe]me\s*sujet", 2),
            (r"troisi[èe]me\s*sujet", 3),
            
            # Patterns de confirmation
            (r"celui\s*(?:la|là|ci)?\s*(\d+)", 1),
            (r"le\s*(\d+)(?:er|ème|eme)?\s*(?:svp|stp|please|s'il te plait|s'il vous plait)", 1),
        ]
        
        for pattern, group_num in patterns:
            match = re.search(pattern, input_lower)
            if match:
                intent["type"] = "reference"
                intent["action"] = "elaborate"
                try:
                    # Gérer les cas spéciaux (premier, deuxième, troisième)
                    if "premier" in pattern:
                        intent["topic_number"] = 1
                    elif "deuxième" in pattern or "deuxieme" in pattern:
                        intent["topic_number"] = 2
                    elif "troisième" in pattern or "troisieme" in pattern:
                        intent["topic_number"] = 3
                    else:
                        intent["topic_number"] = int(match.group(group_num))
                    logger.info(f"🎯 Référence détectée: sujet {intent['topic_number']}")
                    return intent
                except (ValueError, IndexError) as e:
                    logger.warning(f"Erreur d'extraction du numéro: {e}")
                    continue
        
        # 2. DÉTECTION D'AUTRES INTENTIONS
        # Demande de conseil
        if any(word in input_lower for word in ["conseille", "recommandes", "suggères", "proposes", "choisis", "lequel", "le mieux"]):
            intent["type"] = "advice"
            intent["action"] = "give_advice"
            logger.info("🎯 Intention: demande de conseil")
            return intent
        
        # Demande de développement (sans numéro)
        if any(word in input_lower for word in ["développe", "élabore", "explique", "détaille", "approfondis"]):
            intent["type"] = "elaboration"
            intent["action"] = "elaborate"
            logger.info("🎯 Intention: demande de développement général")
            return intent
        
        # Demande de variation
        if any(word in input_lower for word in ["autre", "différent", "nouveau", "encore", "suivant", "variation"]):
            intent["type"] = "variation"
            intent["action"] = "generate_variation"
            logger.info("🎯 Intention: demande de variation")
            return intent
        
        # Changement de thème
        if any(word in input_lower for word in ["change", "autre thème", "différent sujet", "pas ça", "autre chose"]):
            intent["type"] = "change_topic"
            intent["action"] = "generate_new"
            logger.info("🎯 Intention: changement de thème")
            return intent
        
        # Demande de clarification
        if any(word in input_lower for word in ["quoi", "comment", "qu'est", "que veux", "explique"]):
            intent["type"] = "clarification"
            intent["action"] = "clarify"
            logger.info("🎯 Intention: demande de clarification")
            return intent
        
        logger.info(f"📊 Intention par défaut: nouvelle requête")
        return intent
    
    def _create_original_recommendation_prompt(self):
        """Crée le template de prompt pour analyser les sujets existants"""
        
        prompt_template = """Tu es un expert académique qui analyse des sujets de mémoire existants pour inspirer de nouvelles idées.

    CONTEXTE DE LA CONVERSATION :
    {conversation_context}

    PROFIL DE L'ÉTUDIANT :
    {student_profile}

    REQUÊTE ACTUELLE :
    {student_query}

    SUJETS EXISTANTS TROUVÉS (par similarité) :
    {similar_subjects}

    SCORES DE SIMILARITÉ (0-1) :
    {similarity_scores}

    INSTRUCTIONS STRICTES :
    1. Analyse uniquement les sujets fournis ci-dessus
    2. Présente 3 sujets maximum dans un format STRUCTURÉ
    3. Pour chaque sujet : Titre, Score, Pertinence, Thèmes
    4. Ne sors pas du format ci-dessous
    5. Sois concis et précis

    FORMAT DE RÉPONSE OBLIGATOIRE (ne rien ajouter avant ou après) :

    ### 🎯 ANALYSE DES SUJETS EXISTANTS

    **Sujet 1 :** [Titre exact du premier sujet]
    - **Score de similarité :** [score]
    - **Pertinence pour la requête :** [1-2 phrases expliquant pourquoi ce sujet est pertinent]
    - **Thèmes principaux :** [liste de 3-5 mots-clés]

    **Sujet 2 :** [Titre exact du deuxième sujet]
    - **Score de similarité :** [score]
    - **Pertinence pour la requête :** [1-2 phrases]
    - **Thèmes principaux :** [liste]

    **Sujet 3 :** [Titre exact du troisième sujet]
    - **Score de similarité :** [score]
    - **Pertinence pour la requête :** [1-2 phrases]
    - **Thèmes principaux :** [liste]

    ### 🔍 THÈMES RÉCURRENTS IDENTIFIÉS
    - [Thème 1]
    - [Thème 2]
    - [Thème 3]

    ### 💡 PISTES D'INSPIRATION POUR UN SUJET ORIGINAL
    - [Piste 1 : suggestion concrète]
    - [Piste 2 : suggestion concrète]"""
        
        return ChatPromptTemplate.from_template(prompt_template)

    def _create_new_topic_prompt(self):
        """Crée le template pour générer de NOUVEAUX sujets originaux"""
        
        prompt_template = """Tu es un directeur de recherche expérimenté qui formule des sujets de mémoire originaux et académiquement valides.

    CONTEXTE DE LA CONVERSATION :
    {conversation_context}

    PROFIL DE L'ÉTUDIANT :
    {student_profile}

    REQUÊTE ORIGINALE :
    {student_query}

    SUJETS EXISTANTS POUR INSPIRATION (NE PAS COPIER) :
    {existing_subjects}

    INSTRUCTIONS ABSOLUMENT CRITIQUES :
    1. Crée 2-3 sujets COMPLÈTEMENT NOUVEAUX et ORIGINAUX
    2. Les sujets NE DOIVENT PAS EXISTER dans la liste ci-dessus
    3. Chaque sujet doit être FAISABLE pour le niveau de l'étudiant
    4. Chaque sujet doit avoir un titre précis et une problématique claire
    5. Suis strictement le format ci-dessous

    FORMAT DE RÉPONSE OBLIGATOIRE (ne rien ajouter avant ou après) :

    ### 🚀 NOUVEAUX SUJETS PROPOSÉS

    #### Sujet 1 : [TITRE PRÉCIS ET ACCROCHEUR]
    **📌 Problématique :** [Question de recherche claire et spécifique en 1 phrase]
    **🎯 Inspiration des sujets existants :** [Quel aspect t'a inspiré ? Ex: "L'approche algorithmique du sujet X" mais PAS le même titre]
    **🔬 Méthodologie suggérée :** [Approche méthodologique concrète en 2-3 points]
    **🛠️ Compétences requises :** [Liste de compétences techniques/théoriques]

    #### Sujet 2 : [TITRE PRÉCIS ET ACCROCHEUR]
    **📌 Problématique :** [Question de recherche claire et spécifique]
    **🎯 Inspiration des sujets existants :** [Quel aspect t'a inspiré ?]
    **🔬 Méthodologie suggérée :** [Approche méthodologique concrète]
    **🛠️ Compétences requises :** [Liste de compétences]

    ### 📋 RECOMMANDATIONS PRATIQUES
    - **Niveau de difficulté :** [Facile/Intermédiaire/Avancé]
    - **Durée estimée :** [4-6 mois / 6-9 mois / 9-12 mois]
    - **Ressources clés :** [2-3 références ou outils principaux]
    - **Conseil :** [Conseil pratique pour démarrer]"""
        
        return ChatPromptTemplate.from_template(prompt_template)

    def _create_elaboration_prompt(self):
        """Crée le template pour développer un sujet spécifique"""
        
        prompt_template = """Tu es un directeur de mémoire qui développe un sujet spécifique en profondeur.

    CONTEXTE DE LA CONVERSATION :
    {conversation_context}

    SUJET À DÉVELOPPER (référencé par l'étudiant) :
    {topic_to_elaborate}

    PROFIL DE L'ÉTUDIANT :
    {student_profile}

    REQUÊTE DE DÉVELOPPEMENT :
    {student_query}

    INSTRUCTIONS :
    1. Développe CE sujet spécifique, pas un autre
    2. Sois très concret et pratique
    3. Propose des étapes actionnables
    4. Inclus des détails techniques précis

    FORMAT DE RÉPONSE OBLIGATOIRE :

    ### 🎓 DÉVELOPPEMENT DU SUJET : [TITRE DU SUJET]

    #### 📝 PROBLÉMATIQUE APPROFONDIE
    **Question centrale :** [Formulation précise]
    **Contexte :** [Pourquoi cette question est importante]
    **Objectifs :** 
    - Objectif 1 : [Spécifique et mesurable]
    - Objectif 2 : [Spécifique et mesurable]
    - Objectif 3 : [Spécifique et mesurable]

    #### 🔬 MÉTHODOLOGIE DÉTAILLÉE
    **Étape 1 :** [Description détaillée avec outils concrets]
    **Étape 2 :** [Description détaillée avec outils concrets]
    **Étape 3 :** [Description détaillée avec outils concrets]
    **Étape 4 :** [Description détaillée avec outils concrets]

    #### 🛠️ OUTILS ET TECHNOLOGIES
    - **Langages de programmation :** [Python, Java, etc.]
    - **Bibliothèques/Frameworks :** [TensorFlow, OpenCV, etc.]
    - **Outils d'analyse :** [Jupyter, Tableau, etc.]
    - **Données nécessaires :** [Sources et format]

    #### 📅 PLAN DE TRAVAIL (6 MOIS)
    **Mois 1-2 :** [Revue littérature + cadrage]
    **Mois 3-4 :** [Implémentation + tests]
    **Mois 5 :** [Expérimentations + analyse]
    **Mois 6 :** [Rédaction + validation]

    #### ⚠️ DÉFIS ANTICIPÉS ET SOLUTIONS
    1. **Défi :** [Description] → **Solution :** [Proposition]
    2. **Défi :** [Description] → **Solution :** [Proposition]

    #### 📚 RESSOURCES RECOMMANDÉES
    - Article 1 : [Référence pertinente]
    - Article 2 : [Référence pertinente]
    - Tutoriel : [Lien utile]
    - Dataset : [Lien vers les données]"""
        
        return ChatPromptTemplate.from_template(prompt_template)
    
    def analyze_student_profile(self, input_text: str) -> Dict[str, str]:
        """
        Analyse le texte d'entrée de l'étudiant pour extraire le profil
        Version améliorée avec détection de 'genie info'
        """
        try:
            # Normaliser le texte
            input_lower = input_text.lower()
            input_clean = re.sub(r'[^\w\s]', ' ', input_lower)
            
            profile = {
                "raw_input": input_text,
                "extracted_info": {},
                "timestamp": datetime.now().isoformat()
            }
            
            # Détection AVANCÉE de la faculté
            faculty_patterns = {
                "Génie Civil": [
                    r"genie civil", r"génie civil", r"civil", r"pont", r"béton", 
                    r"structure", r"construction", r"bâtiment"
                ],
                "Génie Informatique": [
                    r"genie info", r"génie info", r"informatique", r"info", 
                    r"programmation", r"logiciel", r"donnée", r"base de donnée",
                    r"réseau", r"web", r"mobile", r"ia", r"intelligence artificielle",
                    r"machine learning", r"développement"
                ],
                "Génie Électrique": [
                    r"genie electri", r"génie electri", r"électri", r"electri",
                    r"circuit", r"électronique", r"automatique"
                ],
                "Génie Mécanique": [
                    r"genie mecan", r"génie mecan", r"mécanique", r"mecanique",
                    r"robot", r"automobile", r"thermique"
                ]
            }
            
            detected_faculty = None
            for faculty, patterns in faculty_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, input_clean):
                        detected_faculty = faculty
                        break
                if detected_faculty:
                    break
            
            if detected_faculty:
                profile["extracted_info"]["faculte"] = detected_faculty
            
            # Détection AVANCÉE du niveau
            level_patterns = {
                "L1": [r"\bl1\b", r"licence 1", r"première année", r"bac\+1"],
                "L2": [r"\bl2\b", r"licence 2", r"deuxième année", r"bac\+2"],
                "L3": [r"\bl3\b", r"licence 3", r"licence", r"bac\+3", r"bac \+3"],
                "M1": [r"\bm1\b", r"master 1", r"bac\+4", r"master première année"],
                "M2": [r"\bm2\b", r"master 2", r"master", r"bac\+5", r"bac \+5"],
                "TECH2": [r"tech2", r"technicien 2", r"technicien", r"technique"]
            }
            
            detected_level = None
            for level, patterns in level_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, input_clean):
                        detected_level = level
                        break
                if detected_level:
                    break
            
            if detected_level:
                profile["extracted_info"]["niveau"] = detected_level
            
            # Détection des THÉMATIQUES d'intérêt (pour information uniquement, pas pour filtre)
            themes = []
            common_themes = {
                "compression": [r"compress", r"réduction", r"optimisation taille"],
                "image": [r"image", r"photo", r"visuel", r"multimédia"],
                "données": [r"donnée", r"data", r"base de donnée", r"bd"],
                "sécurité": [r"sécurité", r"securite", r"cyber", r"protection"],
                "réseau": [r"réseau", r"reseau", r"network", r"connexion"],
                "web": [r"web", r"internet", r"site", r"application web"],
                "mobile": [r"mobile", r"android", r"ios", r"application mobile"],
                "IA": [r"intelligence artificielle", r"ia", r"machine learning", r"ml", r"deep learning"],
                "cloud": [r"cloud", r"nuage", r"serveur distant", r"aws", r"azure"],
                "IoT": [r"iot", r"internet des objets", r"objet connecté"]
            }
            
            for theme, patterns in common_themes.items():
                for pattern in patterns:
                    if re.search(pattern, input_clean):
                        if theme not in themes:
                            themes.append(theme)
                        break
            
            if themes:
                profile["extracted_info"]["thematiques"] = ", ".join(themes)
            
            # Détection des MOTS-CLÉS spécifiques
            words = input_clean.split()
            keywords = [word for word in words if len(word) > 4 and word not in 
                       ['etude', 'etudes', 'travail', 'sujet', 'mémoire', 'recherche']]
            
            if keywords:
                profile["extracted_info"]["mots_cles"] = ", ".join(keywords[:5])
            
            logger.info(f"📋 Profil analysé: {profile['extracted_info']}")
            return profile
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'analyse du profil: {str(e)}")
            return {
                "raw_input": input_text,
                "extracted_info": {},
                "timestamp": datetime.now().isoformat()
            }
    
    def _prepare_filters(self, profile_info: dict) -> Optional[dict]:
        """
        Prépare les filtres pour la recherche Chroma
        Chroma ne supporte qu'un seul champ de filtre à la fois dans cette configuration
        """
        if not profile_info:
            return None
        
        # PRIORITÉ des filtres (utiliser un seul)
        if "faculte" in profile_info and profile_info["faculte"]:
            # Utiliser seulement la faculté comme filtre
            logger.info(f"🔍 Filtre appliqué: faculté = {profile_info['faculte']}")
            return {"faculte": profile_info["faculte"]}
        elif "niveau" in profile_info and profile_info["niveau"]:
            # Sinon utiliser le niveau
            logger.info(f"🔍 Filtre appliqué: niveau = {profile_info['niveau']}")
            return {"niveau": profile_info["niveau"]}
        else:
            # Si pas de faculté ni niveau, ne pas filtrer
            logger.info("🔍 Aucun filtre applicable (recherche sans filtre)")
            return None
    
    def find_similar_existing_topics(self, student_input: str, top_k: int = 8) -> Dict:
        """
        Étape 1 : Trouver des sujets existants similaires pour inspiration
        Version corrigée avec filtres simplifiés
        """
        try:
            logger.info(f"🔍 Recherche de sujets existants similaires...")
            
            # Analyser le profil
            profile = self.analyze_student_profile(student_input)
            
            # Préparer les filtres (version simplifiée - un seul champ)
            filters = self._prepare_filters(profile["extracted_info"])
            
            # Rechercher les sujets similaires (avec ou sans filtre)
            similar_subjects = self.vectorstore.search_similar(
                query=student_input,
                k=top_k,
                filters=filters  # Peut être None
            )
            
            if not similar_subjects:
                logger.warning("   Aucun sujet existant similaire trouvé")
                return {
                    "success": False,
                    "message": "Aucun sujet similaire trouvé dans la base",
                    "profile": profile
                }
            
            logger.info(f"   ✅ {len(similar_subjects)} sujets existants trouvés")
            
            # Préparer la présentation des sujets existants
            existing_subjects_text = "\n".join([
                f"{i+1}. {subject['metadata'].get('title', 'Sans titre')} "
                f"(Faculté: {subject['metadata'].get('faculty', 'N/A')}, "
                f"Score: {subject['score']:.3f})"
                for i, subject in enumerate(similar_subjects)
            ])
            
            return {
                "success": True,
                "profile": profile,
                "existing_subjects": similar_subjects,
                "existing_subjects_text": existing_subjects_text,
                "count": len(similar_subjects)
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la recherche des sujets existants: {str(e)}")
            # En cas d'erreur, essayer sans filtre
            try:
                logger.info("   Nouvelle tentative sans filtre...")
                similar_subjects = self.vectorstore.search_similar(
                    query=student_input,
                    k=top_k,
                    filters=None  # Sans filtre
                )
                
                if similar_subjects:
                    logger.info(f"   ✅ {len(similar_subjects)} sujets trouvés (sans filtre)")
                    profile = self.analyze_student_profile(student_input)
                    
                    return {
                        "success": True,
                        "profile": profile,
                        "existing_subjects": similar_subjects,
                        "existing_subjects_text": "\n".join([
                            f"{i+1}. {s['metadata'].get('title', 'Sans titre')}"
                            for i, s in enumerate(similar_subjects)
                        ]),
                        "count": len(similar_subjects)
                    }
            except:
                pass
            
            return {
                "success": False,
                "error": str(e),
                "profile": {"raw_input": student_input}
            }
    
    def generate_new_topics(self, student_input: str, existing_topics_result: Dict) -> Dict:
        """
        Étape 2 : Générer de NOUVEAUX sujets inspirés par les sujets existants
        """
        try:
            if not existing_topics_result["success"]:
                return existing_topics_result
            
            logger.info("🧠 Génération de NOUVEAUX sujets inspirés...")
            
            profile = existing_topics_result["profile"]
            existing_subjects = existing_topics_result["existing_subjects"]
            
            # Préparer le contexte de conversation
            conversation_context = self._prepare_conversation_context()
            
            # Préparer le texte des sujets existants pour le prompt
            existing_details = "\n".join([
                f"{i+1}. [{subject['metadata'].get('faculty', 'N/A')} - "
                f"{subject['metadata'].get('level', 'N/A')}] "
                f"{subject['metadata'].get('title', 'Sans titre')[:80]}... | "
                f"Mots-clés: {subject['metadata'].get('keywords', 'N/A')[:40]}..."
                for i, subject in enumerate(existing_subjects[:5])
            ])
            
            # Chaîne pour générer de NOUVEAUX sujets
            new_topic_chain = (
                {
                    "conversation_context": RunnablePassthrough(),
                    "student_profile": RunnablePassthrough(),
                    "student_query": RunnablePassthrough(),
                    "existing_subjects": RunnablePassthrough()
                }
                | self.new_topic_prompt
                | self.llm
            )
            
            new_topics = new_topic_chain.invoke({
                "conversation_context": conversation_context,
                "student_profile": str(profile["extracted_info"]),
                "student_query": student_input,
                "existing_subjects": existing_details
            })
            
            # Chaîne pour analyser les sujets existants (étape 1)
            analysis_chain = (
                {
                    "conversation_context": RunnablePassthrough(),
                    "student_profile": RunnablePassthrough(),
                    "student_query": RunnablePassthrough(),
                    "similar_subjects": RunnablePassthrough(),
                    "similarity_scores": RunnablePassthrough()
                }
                | self.original_prompt
                | self.llm
            )
            
            # Préparer les scores pour l'analyse
            scores_text = "\n".join([
                f"{i+1}. {subject['score']:.3f}"
                for i, subject in enumerate(existing_subjects)
            ])
            
            subjects_text = "\n".join([
                f"{i+1}. {subject['content'][:150]}..."
                for i, subject in enumerate(existing_subjects)
            ])
            
            existing_analysis = analysis_chain.invoke({
                "conversation_context": conversation_context,
                "student_profile": str(profile["extracted_info"]),
                "student_query": student_input,
                "similar_subjects": subjects_text,
                "similarity_scores": scores_text
            })
            
            # Préparer les sources d'inspiration pour le stockage
            inspiration_sources = [
                {
                    "title": subject["metadata"].get("title", "Sans titre"),
                    "score": subject["score"],
                    "faculty": subject["metadata"].get("faculty", "N/A"),
                    "level": subject["metadata"].get("level", "N/A"),
                    "keywords": subject["metadata"].get("keywords", "N/A")[:50],
                    "content_preview": subject["content"][:100] + "..."
                }
                for subject in existing_subjects[:3]
            ]
            
            # Mettre à jour les dernières recommandations
            self.last_recommendations = inspiration_sources
            
            # Mettre à jour le thème de conversation si disponible
            if "thematiques" in profile["extracted_info"]:
                self.conversation_topic = profile["extracted_info"]["thematiques"]
            elif "faculte" in profile["extracted_info"]:
                self.conversation_topic = profile["extracted_info"]["faculte"]
            
            # Résultat final combiné
            result = {
                "success": True,
                "profile": profile,
                "existing_analysis": existing_analysis.content,
                "new_topics": new_topics.content,
                "inspiration_sources": inspiration_sources,
                "existing_count": len(existing_subjects),
                "conversation_topic": self.conversation_topic,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info("✅ Nouveaux sujets générés avec succès")
            return result
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la génération des nouveaux sujets: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "profile": existing_topics_result.get("profile", {})
            }
    
    
    def elaborate_topic(self, topic_number: int, student_input: str) -> Dict:
        """
        Développe un sujet spécifique référencé par l'utilisateur
        VERSION CORRIGÉE
        """
        try:
            logger.info(f"🔍 Développement du sujet {topic_number}...")
            
            # Vérifier si nous avons des recommandations précédentes
            if not self.last_recommendations:
                logger.warning("Aucune recommandation précédente trouvée")
                return {
                    "success": False,
                    "message": "❌ Aucun sujet précédent à développer. Veuillez d'abord demander des recommandations avec 'help' pour voir les commandes disponibles.",
                    "suggestion": "D'abord, demandez des recommandations sur un thème. Exemple: 'Je cherche un sujet en génie info sur la compression d'images'"
                }
            
            # Vérifier si le numéro de sujet est valide
            if topic_number < 1 or topic_number > len(self.last_recommendations):
                available_topics = ", ".join([f"{i+1}" for i in range(len(self.last_recommendations))])
                logger.warning(f"Numéro de sujet invalide: {topic_number}. Disponibles: {available_topics}")
                return {
                    "success": False,
                    "message": f"❌ Sujet {topic_number} non disponible.",
                    "available_topics": f"Sujets disponibles: {available_topics}",
                    "suggestion": f"Veuillez choisir un numéro entre 1 et {len(self.last_recommendations)}"
                }
            
            # Récupérer le sujet à développer
            topic_to_elaborate = self.last_recommendations[topic_number - 1]
            logger.info(f"📌 Sujet à développer: {topic_to_elaborate.get('title', 'Sans titre')[:50]}...")
            
            # Analyser le profil actuel
            profile = self.analyze_student_profile(student_input)
            
            # Préparer le contexte de conversation
            conversation_context = self._prepare_conversation_context()
            
            # Chaîne pour développer le sujet
            elaboration_chain = (
                {
                    "conversation_context": RunnablePassthrough(),
                    "topic_to_elaborate": RunnablePassthrough(),
                    "student_profile": RunnablePassthrough(),
                    "student_query": RunnablePassthrough()
                }
                | self.elaboration_prompt
                | self.llm
            )
            
            elaboration = elaboration_chain.invoke({
                "conversation_context": conversation_context,
                "topic_to_elaborate": f"Sujet {topic_number}: {topic_to_elaborate.get('title', 'Titre non disponible')}\n"
                                    f"Faculté: {topic_to_elaborate.get('faculty', 'N/A')}\n"
                                    f"Niveau: {topic_to_elaborate.get('level', 'N/A')}\n"
                                    f"Mots-clés: {topic_to_elaborate.get('keywords', 'N/A')}",
                "student_profile": str(profile["extracted_info"]),
                "student_query": student_input
            })
            
            # Ajouter à l'historique de conversation
            self.conversation_history.append({
                "role": "assistant",
                "content": f"Développement du sujet {topic_number} terminé",
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "success": True,
                "elaboration": elaboration.content,
                "topic_info": topic_to_elaborate,
                "topic_number": topic_number,
                "profile": profile,
                "conversation_topic": self.conversation_topic,
                "timestamp": datetime.now().isoformat(),
                "type": "elaboration"
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du développement du sujet: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "topic_number": topic_number,
                "message": "Une erreur est survenue lors du développement du sujet."
            }
    
    def recommend(self, student_input: str, top_k: int = 8, conversation_context: dict = None) -> Dict:
        """
        Processus complet de recommandation avec contexte conversationnel
        VERSION AMÉLIORÉE AVEC GESTION D'INTENTIONS COMPLÈTE
        """
        # Ajouter à l'historique de conversation
        self.conversation_history.append({
            "role": "user",
            "content": student_input,
            "timestamp": datetime.now().isoformat()
        })
        
        # Limiter la taille de l'historique
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]
        
        # Analyser l'intention de l'utilisateur
        intent = self._analyze_user_intent(student_input)
        
        try:
            logger.info(f"🎯 Traitement de la requête: '{student_input[:80]}...'")
            logger.info(f"   Intention détectée: {intent['type']} | Action: {intent['action']} | Topic: {intent['topic_number']}")
            
            # ================= TRAITEMENT SPÉCIFIQUE PAR TYPE D'INTENTION =================
            
            # 1. INTENTION: RÉFÉRENCE À UN SUJET PRÉCÉDENT (ex: "sujet 1", "développe le 2")
            if intent["type"] == "reference" and intent["topic_number"]:
                logger.info(f"   ➡️ Développement du sujet {intent['topic_number']} demandé")
                result = self.elaborate_topic(intent["topic_number"], student_input)
                
                # Si succès, ajouter à l'historique
                if result.get("success"):
                    self.conversation_history.append({
                        "role": "assistant",
                        "content": f"Développement du sujet {intent['topic_number']} terminé",
                        "timestamp": datetime.now().isoformat()
                    })
                
                return result
            
            # 2. INTENTION: DEMANDE DE CONSEIL (ex: "conseille-moi", "lequel choisir")
            elif intent["type"] == "advice":
                logger.info("   ➡️ Demande de conseil détectée")
                
                if not self.last_recommendations:
                    return {
                        "success": False,
                        "message": "❌ Aucun sujet précédent à conseiller.",
                        "suggestion": "D'abord, demandez des recommandations sur un thème. Exemple: 'Je cherche un sujet en génie info sur la compression d'images'",
                        "type": "advice_error"
                    }
                
                # Générer des conseils basés sur le profil et les sujets précédents
                advice_prompt = ChatPromptTemplate.from_template("""Tu es un conseiller académique expérimenté.

    CONTEXTE DE CONVERSATION :
    {conversation_context}

    SUJETS PRÉCÉDEMENT RECOMMANDÉS :
    {previous_topics}

    PROFIL DE L'ÉTUDIANT :
    {student_profile}

    DEMANDE DE CONSEIL :
    {student_query}

    INSTRUCTIONS :
    1. Analyse les sujets précédents et le profil de l'étudiant
    2. Recommande le sujet le plus adapté avec des arguments concrets
    3. Compare brièvement les options
    4. Donne des conseils pratiques pour le choix

    FORMAT DE RÉPONSE :

    ### 🤝 CONSEIL PERSONNALISÉ

    #### 🏆 SUJET RECOMMANDÉ : [Numéro et titre]
    **Pourquoi ce sujet est idéal pour vous :**
    - [Argument 1 basé sur votre profil]
    - [Argument 2 basé sur vos compétences]
    - [Argument 3 basé sur vos intérêts]

    #### 📊 COMPARATIF RAPIDE
    1. **Sujet 1 :** [Avantage principal] / [Inconvénient principal]
    2. **Sujet 2 :** [Avantage principal] / [Inconvénient principal]
    3. **Sujet 3 :** [Avantage principal] / [Inconvénient principal]

    #### 🎯 CRITÈRES DE CHOIX
    - Critère 1 : [Explication]
    - Critère 2 : [Explication]
    - Critère 3 : [Explication]

    #### 💡 PROCHAINES ÉTAPES
    1. [Action concrète 1]
    2. [Action concrète 2]
    3. [Action concrète 3]""")
                
                chain = advice_prompt | self.llm
                conversation_context_text = self._prepare_conversation_context()
                
                # Préparer la liste des sujets précédents
                previous_topics_text = "\n".join([
                    f"{i+1}. {rec.get('title', 'Sans titre')} "
                    f"({rec.get('faculty', 'N/A')}, {rec.get('level', 'N/A')}) - "
                    f"Mots-clés: {rec.get('keywords', 'N/A')[:50]}"
                    for i, rec in enumerate(self.last_recommendations[:3])
                ])
                
                profile = self.analyze_student_profile(student_input)
                advice = chain.invoke({
                    "conversation_context": conversation_context_text,
                    "previous_topics": previous_topics_text,
                    "student_profile": str(profile["extracted_info"]),
                    "student_query": student_input
                })
                
                result = {
                    "success": True,
                    "advice": advice.content,
                    "available_topics": self.last_recommendations[:3],
                    "profile": profile,
                    "type": "advice",
                    "conversation_topic": self.conversation_topic,
                    "timestamp": datetime.now().isoformat()
                }
                
                self.conversation_history.append({
                    "role": "assistant",
                    "content": f"Conseil donné sur {len(self.last_recommendations[:3])} sujets",
                    "timestamp": datetime.now().isoformat()
                })
                
                return result
            
            # 3. INTENTION: CHANGEMENT DE THÈME (ex: "changeons de sujet", "autre thème")
            elif intent["type"] == "change_topic":
                logger.info("🔄 Changement de thème détecté")
                self.conversation_topic = None
                self.last_recommendations = []  # Effacer aussi les recommandations précédentes
                
                # Répondre avec confirmation
                return {
                    "success": True,
                    "message": "✅ Thème de conversation réinitialisé.",
                    "suggestion": "Parlez-moi de votre nouveau centre d'intérêt. Exemple: 'Je m'intéresse maintenant à la sécurité réseau'",
                    "type": "topic_change",
                    "timestamp": datetime.now().isoformat()
                }
            
            # 4. INTENTION: DÉVELOPPEMENT GÉNÉRAL (sans numéro spécifique)
            elif intent["type"] == "elaboration" and not intent["topic_number"]:
                logger.info("   ➡️ Demande de développement général")
                
                if not self.last_recommendations:
                    return {
                        "success": False,
                        "message": "❌ Aucun sujet précédent à développer.",
                        "suggestion": "D'abord, demandez des recommandations spécifiques. Essayez: 'Propose-moi des sujets sur [votre thème]'",
                        "type": "elaboration_error"
                    }
                
                # Demander à l'utilisateur de préciser
                available_topics_info = "\n".join([
                    f"{i+1}. {rec.get('title', 'Sans titre')[:60]}..."
                    for i, rec in enumerate(self.last_recommendations[:3])
                ])
                
                return {
                    "success": True,
                    "message": "📋 Plusieurs sujets disponibles pour développement.",
                    "available_topics": self.last_recommendations[:3],
                    "prompt": f"Précisez le numéro du sujet à développer:\n{available_topics_info}",
                    "type": "clarification_needed",
                    "timestamp": datetime.now().isoformat()
                }
            
            # 5. INTENTION: VARIATION OU NOUVEAUX SUJETS (cas par défaut)
            else:
                logger.info("   ➡️ Génération de nouveaux sujets demandée")
                
                # Vérifier si c'est une demande de variation sur thème existant
                if intent["type"] == "variation" and self.conversation_topic:
                    logger.info(f"   Variation demandée sur le thème: {self.conversation_topic}")
                    # Ajouter une indication de variation dans la requête
                    student_input = f"{student_input} (variation sur: {self.conversation_topic})"
                
                # Étape 1 : Trouver des sujets existants pour inspiration
                existing_topics = self.find_similar_existing_topics(student_input, top_k)
                
                if not existing_topics["success"]:
                    # Même si aucun sujet similaire n'est trouvé, on peut quand même générer des sujets
                    logger.info("   Aucun sujet similaire trouvé, génération basée sur le profil uniquement")
                    profile = self.analyze_student_profile(student_input)
                    
                    # Utiliser un prompt spécial pour générer sans inspiration
                    no_inspiration_prompt = ChatPromptTemplate.from_template("""Tu es un expert en création de sujets de mémoire.

    CONTEXTE DE CONVERSATION :
    {conversation_context}

    PROFIL DE L'ÉTUDIANT :
    {student_profile}

    REQUÊTE SPÉCIFIQUE :
    {student_query}

    INSTRUCTIONS :
    1. Crée 2-3 sujets ORIGINAUX et ACADÉMIQUEMENT VALIDES
    2. Adapte les sujets au profil de l'étudiant
    3. Sois concret et précis

    FORMAT DE RÉPONSE :

    ### 🚀 NOUVEAUX SUJETS PROPOSÉS

    #### Sujet 1 : [TITRE PRÉCIS]
    **📌 Problématique :** [Question de recherche en 1 phrase]
    **🎯 Pourquoi ce sujet vous convient :** [2-3 arguments basés sur votre profil]
    **🔬 Approche méthodologique :** [Méthode principale]
    **🛠️ Compétences mobilisées :** [2-3 compétences clés]

    #### Sujet 2 : [TITRE PRÉCIS]
    **📌 Problématique :** [Question de recherche]
    **🎯 Pourquoi ce sujet vous convient :** [Arguments]
    **🔬 Approche méthodologique :** [Méthode]
    **🛠️ Compétences mobilisées :** [Compétences]

    ### 💡 CONSEILS POUR COMMENCER
    - [Conseil pratique 1]
    - [Conseil pratique 2]""")
                    
                    chain = no_inspiration_prompt | self.llm
                    conversation_context_text = self._prepare_conversation_context()
                    
                    new_topics = chain.invoke({
                        "conversation_context": conversation_context_text,
                        "student_profile": str(profile["extracted_info"]),
                        "student_query": student_input
                    })
                    
                    # Mettre à jour le thème de conversation
                    if "thematiques" in profile["extracted_info"]:
                        self.conversation_topic = profile["extracted_info"]["thematiques"]
                    elif "faculte" in profile["extracted_info"]:
                        self.conversation_topic = profile["extracted_info"]["faculte"]
                    
                    result = {
                        "success": True,
                        "profile": profile,
                        "existing_analysis": "ℹ️ Aucun sujet similaire trouvé dans la base. Ces suggestions sont créées spécialement pour vous.",
                        "new_topics": new_topics.content,
                        "inspiration_sources": [],
                        "existing_count": 0,
                        "conversation_topic": self.conversation_topic,
                        "timestamp": datetime.now().isoformat(),
                        "type": "new_topics_no_inspiration"
                    }
                    
                else:
                    # Étape 2 : Générer de NOUVEAUX sujets inspirés
                    logger.info(f"   ✅ {existing_topics['count']} sujets d'inspiration trouvés")
                    final_result = self.generate_new_topics(student_input, existing_topics)
                    result = final_result
                    result["type"] = "new_topics_with_inspiration"
                
                # Stocker les sources d'inspiration pour référence future
                if "inspiration_sources" in result and result["inspiration_sources"]:
                    self.last_recommendations = result["inspiration_sources"]
                    logger.info(f"   💾 {len(result['inspiration_sources'])} recommandations stockées")
                
                # Ajouter à l'historique de conversation
                self.conversation_history.append({
                    "role": "assistant",
                    "content": f"{len(result.get('inspiration_sources', []))} sujets d'inspiration trouvés, {result.get('existing_count', 0)} sujets analysés",
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "topics_generated": True,
                        "inspiration_count": len(result.get('inspiration_sources', [])),
                        "topic": result.get('conversation_topic', 'général')
                    }
                })
                
                return result
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du processus de recommandation: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Ajouter l'erreur à l'historique
            self.conversation_history.append({
                "role": "assistant",
                "content": f"Erreur lors du traitement: {str(e)[:80]}...",
                "timestamp": datetime.now().isoformat(),
                "metadata": {"error": True}
            })
            
            return {
                "success": False,
                "error": str(e),
                "message": "❌ Une erreur technique est survenue. Essayez de reformuler votre demande.",
                "suggestion": "Veuillez réessayer avec une formulation plus simple ou tapez 'clear' pour réinitialiser.",
                "profile": {"raw_input": student_input},
                "conversation_topic": self.conversation_topic,
                "type": "error"
            }
    
    def get_system_status(self) -> Dict:
        """Retourne l'état du système"""
        return {
            "llm_initialized": self.llm is not None,
            "vectorstore_info": self.vectorstore.get_vectorstore_info(),
            "conversation_history_count": len(self.conversation_history),
            "last_recommendations_count": len(self.last_recommendations),
            "current_topic": self.conversation_topic,
            "timestamp": datetime.now().isoformat(),
            "version": "3.0 - Conversationnel Intelligent"
        }
    
    def clear_conversation(self):
        """Efface l'historique de conversation"""
        self.conversation_history = []
        self.last_recommendations = []
        self.conversation_topic = None
        logger.info("🗑️  Conversation effacée")

if __name__ == "__main__":
    # Test du module
    print("✅ Module recommender.py (version conversationnelle) chargé avec succès")

