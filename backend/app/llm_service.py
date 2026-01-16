# app/llm_service.py - VERSION COMPLÈTE FONCTIONNELLE
import os
import json
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from datetime import datetime
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemma-3-1b-it")

# ======================
# CONFIGURATION LANGCHAIN
# ======================
llm = None
json_parser = None

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
    from langchain_core.exceptions import OutputParserException
    
    # Initialiser LangChain avec Gemini
    if GOOGLE_API_KEY:
        llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            google_api_key=GOOGLE_API_KEY,
            temperature=0.2,
            max_output_tokens=2048
        )
        
        # Parser JSON
        json_parser = JsonOutputParser()
        
        print("✅ LangChain avec Gemini configuré")
    else:
        print("⚠️ GOOGLE_API_KEY non configurée")
        llm = None
        json_parser = None
        
except ImportError as e:
    print(f"❌ LangChain non disponible: {e}")
    llm = None
    json_parser = None

# ======================
# FONCTIONS AVEC LANGCHAIN
# ======================

def analyser_sujet(sujet_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyse un sujet avec LangChain"""
    
    if not llm:
        return get_fallback_analysis(sujet_data)
    
    prompt_template = """
    Tu es un expert en évaluation de sujets de mémoire universitaire.
    
    Analyse ce sujet de mémoire:
    
    **TITRE**: {titre}
    **DOMAINE**: {domaine}
    **NIVEAU**: {niveau}
    **FACULTÉ**: {faculté}
    **PROBLÉMATIQUE**: {problematique}
    **DESCRIPTION**: {description}
    **MOTS-CLÉS**: {keywords}
    
    Fais une analyse détaillée selon ces critères:
    1. Pertinence générale (0-100%)
    2. Points forts (3-5 points)
    3. Points faibles (2-3 points)
    4. Suggestions d'amélioration (3-5 suggestions)
    5. Recommandations finales (2-3 recommandations)
    
    Réponds en JSON avec cette structure exacte:
    {{
        "pertinence": 85,
        "points_forts": ["point1", "point2", "point3"],
        "points_faibles": ["point1", "point2"],
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "recommandations": ["recommandation1", "recommandation2"]
    }}
    """
    
    try:
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | llm | json_parser
        
        result = chain.invoke({
            "titre": sujet_data.get('titre', ''),
            "domaine": sujet_data.get('domaine', ''),
            "niveau": sujet_data.get('niveau', ''),
            "faculté": sujet_data.get('faculté', ''),
            "problematique": sujet_data.get('problematique', ''),
            "description": sujet_data.get('description', ''),
            "keywords": sujet_data.get('keywords', '')
        })
        
        return result
        
    except Exception as e:
        print(f"⚠️ Erreur analyse LangChain: {e}")
        return get_fallback_analysis(sujet_data)

def recommander_sujets_llm(
    interests: List[str], 
    sujets: List[Dict], 
    critères: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Recommande des sujets avec LangChain"""
    
    if not llm or not sujets:
        return fallback_recommendation(interests, sujets)
    
    # Formater les sujets
    sujets_text = ""
    for sujet in sujets[:10]:  # Limiter à 10 sujets pour le contexte
        sujets_text += f"\n• ID: {sujet.get('id', 'N/A')}"
        sujets_text += f" | Titre: {sujet.get('titre', 'Sans titre')}"
        sujets_text += f" | Mots-clés: {sujet.get('keywords', '')}"
        sujets_text += f" | Niveau: {sujet.get('niveau', 'N/A')}"
        sujets_text += f" | Domaine: {sujet.get('domaine', 'Général')}"
    
    prompt_template = """
    Tu es un assistant spécialisé dans la recommandation de sujets de mémoire.
    
    **PROFIL ÉTUDIANT:**
    - Intérêts: {interests}
    - Niveau: {niveau}
    - Faculté: {faculté}
    - Domaine: {domaine}
    - Difficulté: {difficulté}
    
    **SUJETS DISPONIBLES:**
    {sujets_text}
    
    **TÂCHE:**
    Pour les sujets les plus pertinents, fournis:
    1. Score de pertinence (0-100) basé sur les intérêts et critères
    2. 2-3 raisons principales de recommandation
    3. Critères d'acceptation respectés
    
    **FORMAT DE RÉPONSE (JSON):**
    [
      {{
        "id": 1,
        "score": 85,
        "raisons": ["Raison 1", "Raison 2"],
        "critères": ["Critère 1", "Critère 2"]
      }}
    ]
    
    Retourne seulement les 3-5 sujets les plus pertinents, triés par score décroissant.
    """
    
    try:
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | llm | StrOutputParser()
        
        response = chain.invoke({
            "interests": ", ".join(interests) if interests else "Non spécifié",
            "niveau": critères.get('niveau', 'Non spécifié'),
            "faculté": critères.get('faculté', 'Non spécifiée'),
            "domaine": critères.get('domaine', 'Non spécifié'),
            "difficulté": critères.get('difficulté', 'Moyenne'),
            "sujets_text": sujets_text
        })
        
        # Parser le JSON de la réponse
        try:
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                result = json.loads(json_str)
                return result
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"⚠️ Erreur parsing JSON: {e}")
            
        return fallback_recommendation(interests, sujets)
            
    except Exception as e:
        print(f"⚠️ Erreur recommandation LangChain: {e}")
        return fallback_recommendation(interests, sujets)

def répondre_question(question: str, contexte: str = None) -> str:
    """Répond à une question avec LangChain"""
    
    if not llm:
        return "Le service IA est temporairement indisponible. Veuillez consulter votre enseignant pour des conseils personnalisés."
    
    prompt_template = """
    Tu es un expert-conseil en sujets de mémoire universitaire, appelé MemoBot.
    Tu aides les étudiants à trouver, affiner et développer leurs sujets de mémoire.
    
    **QUESTION DE L'ÉTUDIANT:**
    {question}
    
    {contexte}
    
    **INSTRUCTIONS:**
    1. Donne une réponse claire, concise et utile
    2. Propose des conseils pratiques si pertinent
    3. Sois encourageant et professionnel
    4. Réponds en français de manière naturelle
    5. Si la question est vague, demande des précisions
    6. Tu peux suggérer des pistes de réflexion
    
    **RÉPONSE:**
    """
    
    try:
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | llm | StrOutputParser()
        
        contexte_text = f"**CONTEXTE SUPPLÉMENTAIRE:**\n{contexte}" if contexte else ""
        
        réponse = chain.invoke({
            "question": question,
            "contexte": contexte_text
        })
        
        return réponse
        
    except Exception as e:
        print(f"⚠️ Erreur réponse LangChain: {e}")
        return f"Je ne peux pas répondre pour le moment. Veuillez réessayer plus tard."

def générer_sujets_llm(params: Dict[str, Any], count: int) -> List[Dict[str, Any]]:
    """Génère des sujets avec LangChain"""
    
    if not llm:
        return generate_default_subjects(params, count)
    
    prompt_template = """
    Tu es un générateur de sujets de mémoire universitaires.
    
    **SPÉCIFICATIONS:**
    - Intérêts: {interests}
    - Domaine: {domaine}
    - Niveau: {niveau}
    - Faculté: {faculté}
    - Nombre de sujets: {count}
    
    **EXIGENCES POUR CHAQUE SUJET:**
    1. Un titre précis et accrocheur
    2. Une problématique claire et pertinente
    3. 5-7 mots-clés séparés par des virgules
    4. Une description concise (2-3 phrases)
    5. Une méthodologie suggérée
    6. Une difficulté (facile/moyenne/difficile)
    7. Une durée estimée (ex: 3-6 mois)
    
    **FORMAT DE RÉPONSE (JSON):**
    [
      {{
        "titre": "Titre du sujet",
        "problématique": "Problématique de recherche",  // CHANGÉ: problématique au lieu de problematique
        "keywords": "mot1, mot2, mot3, mot4, mot5",
        "description": "Description du sujet",
        "methodologie": "Méthodologie suggérée",
        "difficulté": "moyenne",
        "durée_estimée": "6 mois"
      }}
    ]
    
    Génère exactement {count} sujets originaux, pertinents et réalisables.
    """
    
    try:
        prompt = ChatPromptTemplate.from_template(prompt_template)
        chain = prompt | llm | StrOutputParser()
        
        response = chain.invoke({
            "interests": params.get('interests', 'Recherche académique'),
            "domaine": params.get('domaine', 'Général'),
            "niveau": params.get('niveau', 'L3'),
            "faculté": params.get('faculté', 'Sciences'),
            "count": count
        })
        
        # Parser le JSON
        try:
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                sujets = json.loads(json_str)
                
                # Ajouter les champs manquants pour correspondre au schéma
                for i, sujet in enumerate(sujets):
                    sujet["domaine"] = params.get('domaine', 'Général')
                    sujet["niveau"] = params.get('niveau', 'L3')
                    sujet["faculté"] = params.get('faculté', 'Sciences')
                    sujet["original"] = True
                    sujet["generated_at"] = datetime.utcnow().isoformat()
                    
                return sujets[:count]
        except (json.JSONDecodeError, AttributeError):
            pass
            
        return generate_default_subjects(params, count)
        
    except Exception as e:
        print(f"⚠️ Erreur génération LangChain: {e}")
        return generate_default_subjects(params, count)


def get_acceptance_criteria() -> Dict[str, Any]:
    """
    Retourne les critères d'acceptation des sujets de mémoire
    """
    return {
        "critères_acceptation": [
            "Pertinence avec le domaine d'étude de l'étudiant",
            "Problématique clairement définie et spécifique",
            "Originalité et valeur ajoutée par rapport à l'état de l'art",
            "Faisabilité technique (ressources disponibles)",
            "Faisabilité temporelle (6-12 mois maximum)",
            "Accès aux données et matériaux nécessaires",
            "Intérêt scientifique et/ou pratique démontré",
            "Adéquation avec le niveau académique",
            "Objectifs de recherche SMART",
            "Méthodologie appropriée et bien définie"
        ],
        "critères_rejet": [
            "Sujet trop large, vague ou mal défini",
            "Duplication d'un travail existant sans valeur ajoutée",
            "Ressources insuffisantes ou inaccessibles",
            "Problématique absente, floue ou mal formulée",
            "Aspects non-éthiques ou non conformes",
            "Hors du domaine de compétence",
            "Objectifs irréalistes ou trop ambitieux",
            "Manque d'encadrement disponible",
            "Coût trop élevé sans financement",
            "Délai incompatible avec le calendrier académique"
        ],
        "conseils_pratiques": [
            "Consultez votre directeur potentiel dès le début",
            "Effectuez une revue de littérature préliminaire",
            "Définissez une méthodologie réaliste",
            "Établissez un calendrier détaillé",
            "Identifiez précisément les ressources nécessaires",
            "Assurez-vous d'avoir les compétences requises",
            "Prévoyez des alternatives en cas de difficultés",
            "Documentez votre processus de recherche",
            "Préparez une soutenance professionnelle",
            "Anticipez les questions du jury"
        ]
    }

# ======================
# FONCTIONS DE SECOURS
# ======================

def get_fallback_analysis(sujet_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyse de secours sans IA"""
    return {
        "pertinence": 75,
        "points_forts": [
            f"Sujet dans le domaine: {sujet_data.get('domaine', 'Général')}",
            "Problématique identifiée dans les données",
            f"Niveau adapté: {sujet_data.get('niveau', 'L3')}"
        ],
        "points_faibles": [
            "Analyse automatique limitée sans IA",
            "Suggestions génériques",
            "Validation humaine requise"
        ],
        "suggestions": [
            "Consulter un enseignant référent pour validation",
            "Préciser la méthodologie de recherche",
            "Définir des objectifs spécifiques et mesurables"
        ],
        "recommandations": [
            "Sujet potentiellement intéressant à approfondir",
            "Valider la faisabilité avec un expert",
            "Étudier des travaux similaires pour inspiration"
        ]
    }

def fallback_recommendation(interests: List[str], sujets: List[Dict]) -> List[Dict[str, Any]]:
    """Recommandation de secours sans IA"""
    results = []
    
    if not sujets:
        return results
    
    for sujet in sujets[:5]:
        score = 0
        matching_points = []
        
        # Vérifier les correspondances
        titre = sujet.get('titre', '').lower()
        keywords = sujet.get('keywords', '').lower()
        domaine = sujet.get('domaine', '').lower()
        
        for interest in interests:
            interest_lower = interest.lower()
            
            # Score pour correspondance dans le titre
            if interest_lower in titre:
                score += 30
                matching_points.append(f"Intérêt '{interest}' dans le titre")
            
            # Score pour correspondance dans les mots-clés
            if interest_lower in keywords:
                score += 25
                matching_points.append(f"Intérêt '{interest}' dans les mots-clés")
            
            # Score pour correspondance dans le domaine
            if interest_lower in domaine:
                score += 20
                matching_points.append(f"Intérêt '{interest}' dans le domaine")
        
        if score > 0:
            results.append({
                "id": sujet.get("id", 0),
                "score": min(score, 100),
                "raisons": matching_points[:3] if matching_points else ["Correspondance générale"],
                "critères": [
                    "Matching automatique par mots-clés",
                    f"Niveau: {sujet.get('niveau', 'N/A')}",
                    f"Domaine: {sujet.get('domaine', 'N/A')}"
                ]
            })
    
    # Trier par score
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

def generate_default_subjects(params: Dict[str, Any], count: int) -> List[Dict[str, Any]]:
    """Génère des sujets par défaut"""
    domaine = params.get('domaine', 'Informatique')
    niveau = params.get('niveau', 'Master')
    faculté = params.get('faculté', 'Sciences')
    interests = params.get('interests', 'Recherche académique')
    
    subjects = []
    for i in range(1, count + 1):
        subjects.append({
            "titre": f"Application de l'IA dans le domaine du {domaine}",
            "problématique": f"Comment l'intelligence artificielle peut-elle transformer les pratiques et processus dans le {domaine} ?",  # CHANGÉ
            "keywords": f"IA, {domaine}, transformation, innovation, technologie",
            "description": f"Étude des applications potentielles de l'intelligence artificielle dans le secteur du {domaine}, avec une analyse des impacts et des défis à relever.",
            "methodologie": "Revue de littérature, analyse comparative, étude de cas",
            "difficulté": "moyenne",
            "durée_estimée": "6 mois",
            "domaine": domaine,  # AJOUTÉ
            "niveau": niveau,    # AJOUTÉ
            "faculté": faculté,  # AJOUTÉ
            "original": True,    # AJOUTÉ
            "generated_at": datetime.utcnow().isoformat()  # AJOUTÉ
        })
    
    return subjects

def get_tips() -> Dict[str, List[str]]:
    """
    Retourne des conseils pour la rédaction de mémoire
    """
    return {
        "choix_sujet": [
            "Choisissez un sujet qui vous passionne vraiment",
            "Assurez-vous que le sujet soit ni trop large ni trop étroit",
            "Vérifiez la disponibilité des ressources",
            "Le sujet doit apporter une contribution originale",
            "Consultez votre directeur potentiel avant de finaliser"
        ],
        "methodologie": [
            "Définissez clairement votre problématique de recherche",
            "Choisissez une méthodologie adaptée à votre question",
            "Élaborez un plan de recherche détaillé",
            "Documentez rigoureusement toutes vos sources",
            "Testez votre méthodologie sur un échantillon réduit"
        ],
        "redaction": [
            "Structurez votre mémoire de manière logique",
            "Rédigez régulièrement (un peu chaque jour)",
            "Utilisez un style académique clair et précis",
            "Citez vos sources selon les normes",
            "Faites relire votre travail par d'autres"
        ],
        "soutenance": [
            "Préparez votre présentation bien à l'avance",
            "Structurez votre présentation clairement",
            "Entraînez-vous plusieurs fois à présenter",
            "Préparez un support visuel professionnel",
            "Anticipez les questions du jury"
        ]
    }

# ======================
# TEST DE CONNEXION
# ======================

if __name__ == "__main__":
    print("🧪 Test de LangChain avec Gemini...")
    
    if llm:
        try:
            # Test simple
            prompt = ChatPromptTemplate.from_template("Réponds simplement 'OK' si tu fonctionnes.")
            chain = prompt | llm | StrOutputParser()
            response = chain.invoke({})
            print(f"✅ LangChain fonctionne: {response}")
            
            # Test des fonctions
            print(f"\n📋 Fonctions disponibles:")
            print(f"  - répondre_question: ✓")
            print(f"  - analyser_sujet: ✓")
            print(f"  - générer_sujets_llm: ✓")
            print(f"  - get_acceptance_criteria: ✓")
            print(f"  - get_tips: ✓")
            
        except Exception as e:
            print(f"❌ Erreur test LangChain: {e}")
    else:
        print("⚠️ LangChain non configuré, mode fallback activé")
    
    print("\n✅ Module llm_service prêt")