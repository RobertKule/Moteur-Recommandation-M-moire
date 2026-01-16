# app/routes/ai.py - NOUVELLE VERSION AMÉLIORÉE
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.dependencies import get_current_user, get_db
from app import schemas, crud
from app.recommendation import recommendation_engine

router = APIRouter(tags=["ai"])

# Importer dynamiquement le service LLM
try:
    from app.llm_service import (
        répondre_question, 
        get_acceptance_criteria, 
        analyser_sujet,
        générer_sujets_llm,
        get_tips,
        recommander_sujets_llm
    )
    LLM_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Erreur import llm_service: {e}")
    LLM_AVAILABLE = False
    
    # Fonctions de secours (version améliorée)
    def répondre_question(question: str, contexte: str = None) -> str:
        return """Je suis MemoBot, votre assistant pour les sujets de mémoire. Pour mieux vous aider :
        
1. **Décrivez votre domaine d'étude et vos intérêts**
2. **Précisez votre niveau académique (L3, M1, M2, Doctorat)**
3. **Mentionnez les technologies/méthodes qui vous intéressent**
4. **Indiquez si vous avez déjà des idées précises**

Je pourrai alors vous proposer des sujets pertinents et vous guider dans votre recherche !"""

    def recommander_sujets_llm(interests: List[str], sujets: List[Dict], critères: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Version améliorée de secours"""
        results = []
        for i, sujet in enumerate(sujets[:3]):  # 3 sujets maximum
            results.append({
                "id": sujet.get("id", i+1),
                "score": 75 + (i * 5),
                "raisons": [
                    f"Correspond à vos intérêts en {', '.join(interests[:2])}",
                    f"Niveau adapté: {critères.get('niveau', 'Master')}",
                    f"Domaine pertinent: {sujet.get('domaine', 'Général')}"
                ],
                "critères": [
                    "Matching avec vos intérêts",
                    "Niveau académique approprié",
                    "Problématique bien définie"
                ],
                "titre": sujet.get("titre", f"Sujet {i+1} sur {critères.get('domaine', 'votre domaine')}"),
                "description": sujet.get("description", "Description générée automatiquement")
            })
        return results

    def analyser_sujet(sujet_data: dict) -> dict:
        return {
            "pertinence": 75,
            "points_forts": ["Sujet bien structuré", "Problématique claire", "Domaine porteur"],
            "points_faibles": ["Méthodologie à préciser", "Ressources à vérifier"],
            "suggestions": [
                "Approfondir la revue de littérature",
                "Définir un protocole expérimental précis",
                "Établir un calendrier détaillé"
            ],
            "recommandations": ["Sujet prometteur à développer", "Consulter un expert du domaine"]
        }

    def générer_sujets_llm(params: dict, count: int) -> List[Dict]:
        """Génère des sujets avec contexte intelligent"""
        domaine = params.get('domaine', 'Informatique')
        niveau = params.get('niveau', 'Master')
        interests = params.get('interests', 'Recherche académique')
        
        sujets = []
        templates = [
            {
                "template": "L'impact de {tech} sur {domaine} : analyse et perspectives",
                "keywords": ["impact", "analyse", "perspectives", "transformation"]
            },
            {
                "template": "Développement d'un système de {application} utilisant {method}",
                "keywords": ["développement", "système", "application", "méthodologie"]
            },
            {
                "template": "Étude comparative des approches de {probleme} en {domaine}",
                "keywords": ["étude comparative", "approches", "performance", "évaluation"]
            }
        ]
        
        for i in range(min(count, 3)):
            template = templates[i % len(templates)]
            titre = template["template"].format(
                tech="l'IA" if "IA" in interests else "les nouvelles technologies",
                domaine=domaine,
                application="recommandation" if i == 0 else "analyse",
                method="le machine learning" if "machine" in interests.lower() else "des algorithmes avancés",
                probleme="classification" if i == 1 else "optimisation"
            )
            
            sujets.append({
                "titre": titre,
                "problematique": f"Comment {titre.lower()} peut-il apporter une valeur ajoutée dans le domaine du {domaine} ?",
                "keywords": f"{domaine}, {', '.join(template['keywords'])}, {', '.join(interests.split(',')[:2]) if isinstance(interests, str) else ', '.join(interests[:2])}",
                "description": f"Ce sujet explore les différentes facettes de {titre.lower()} avec une approche méthodologique rigoureuse adaptée au niveau {niveau}.",
                "methodologie": "Revue de littérature, conception, implémentation, tests et évaluation",
                "difficulté": "moyenne",
                "durée_estimée": "6 mois",
                "original": True  # Marquer comme sujet généré par IA
            })
        
        return sujets

    def get_acceptance_criteria() -> dict:
        return {
            "critères_acceptation": [
                "Pertinence académique avec le cursus",
                "Problématique claire et spécifique",
                "Originalité et contribution au domaine",
                "Faisabilité technique et temporelle",
                "Méthodologie appropriée et bien définie",
                "Accès aux ressources nécessaires",
                "Encadrement disponible et compétent",
                "Alignement avec les intérêts de recherche actuels"
            ],
            "critères_rejet": [
                "Sujet trop vague ou trop large",
                "Duplication sans valeur ajoutée",
                "Ressources insuffisantes ou inaccessibles",
                "Problématique mal formulée ou absente",
                "Délai incompatible avec le calendrier académique",
                "Manque d'encadrement disponible",
                "Hors du domaine de compétence de l'étudiant"
            ]
        }

    def get_tips() -> dict:
        return {
            "choix_sujet": [
                "Choisissez un sujet qui vous passionne vraiment",
                "Assurez-vous de l'existence de ressources bibliographiques",
                "Consultez votre directeur potentiel avant de finaliser",
                "Vérifiez la faisabilité technique et temporelle"
            ],
            "methodologie": [
                "Définissez clairement votre problématique",
                "Choisissez une méthodologie adaptée",
                "Établissez un plan de recherche détaillé",
                "Prévoyez des alternatives en cas de difficultés"
            ],
            "redaction": [
                "Commencez par la revue de littérature",
                "Rédigez régulièrement (un peu chaque jour)",
                "Structurez votre mémoire de manière logique",
                "Faites relire votre travail par des pairs"
            ]
        }


        
@router.post("/generate-three", response_model=schemas.AIGeneratedSubjects)
async def generate_three_subjects(
    request: schemas.GenerateSubjectsRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Génère exactement 3 sujets avec IA et les sauvegarde temporairement"""
    try:
        # Récupérer les préférences
        preference = crud.get_or_create_preference(db, current_user.id)
        
        # Préparer les paramètres
        params = {
            "interests": request.interests if isinstance(request.interests, list) 
                       else [request.interests] if isinstance(request.interests, str)
                       else [],
            "domaine": request.domaine or (preference.faculty if preference else "Général"),
            "niveau": request.niveau or (preference.level if preference else "M2"),
            "faculté": request.faculté or (preference.faculty if preference else "Sciences")
        }
        
        # Vérifier qu'on a des intérêts
        if not params["interests"] and preference and preference.interests:
            params["interests"] = [preference.interests]
        
        if not params["interests"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Veuillez spécifier vos intérêts pour générer des sujets pertinents"
            )
        
        # Générer 3 sujets avec IA
        generated_subjects = générer_sujets_llm(params, 3)
        
        # Créer un identifiant de session pour cette génération
        import uuid
        session_id = str(uuid.uuid4())
        
        # Formater les sujets pour correspondre au schéma
        formatted_subjects = []
        for i, subject in enumerate(generated_subjects):
            formatted_subject = {
                "session_id": session_id,
                "index": i,
                "titre": subject.get("titre", f"Sujet {i+1}"),
                "description": subject.get("description", ""),
                "problématique": subject.get("problématique", subject.get("problematique", "")),  # Gérer les deux formats
                "keywords": subject.get("keywords", ""),
                "domaine": subject.get("domaine", params["domaine"]),
                "niveau": subject.get("niveau", params["niveau"]),
                "faculté": subject.get("faculté", params["faculté"]),
                "difficulté": subject.get("difficulté", "moyenne"),
                "durée_estimée": subject.get("durée_estimée", "6 mois"),
                "methodologie": subject.get("methodologie", subject.get("méthodologie", "")),
                "generated_at": subject.get("generated_at", datetime.utcnow().isoformat()),
                "original": subject.get("original", True)
            }
            formatted_subjects.append(formatted_subject)
        
        return {
            "session_id": session_id,
            "subjects": formatted_subjects,
            "count": len(formatted_subjects),
            "message": f"3 sujets générés basés sur vos intérêts: {', '.join(params['interests'][:3])}"
        }
        
    except Exception as e:
        print(f"Erreur dans generate_three_subjects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération: {str(e)}"
        )

# Route pour sauvegarder un sujet choisi
@router.post("/save-chosen-subject", response_model=schemas.Sujet)
async def save_chosen_subject(
    request: schemas.SaveChosenSubjectRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sauvegarde un sujet choisi par l'utilisateur dans ses sujets"""
    try:
        print(f"📥 Données reçues: {request}")
        
        # Vérifier et normaliser la difficulté
        difficulty_lower = request.difficulté.lower()
        if difficulty_lower not in ['facile', 'moyenne', 'difficile']:
            difficulty_lower = 'moyenne'
        
        # Créer le sujet dans la base de données
        sujet_data = schemas.SujetCreate(
            titre=request.titre,
            description=request.description,
            keywords=request.keywords,
            domaine=request.domaine,
            niveau=request.niveau,
            faculté=request.faculté,
            problématique=request.problématique,
            méthodologie=request.méthodologie,
            difficulté=difficulty_lower,
            durée_estimée=request.durée_estimée
        )
        
        print(f"📝 Création sujet: {sujet_data}")
        
        # Créer le sujet
        sujet = crud.create_sujet(db, sujet_data, user_id=current_user.id)
        
        # Créer un historique
        history_data = schemas.UserHistoryCreate(
            user_id=current_user.id,
            action="chose_ai_subject",
            details=f"A choisi le sujet généré par IA: {sujet.titre}",
            sujet_id=sujet.id
        )
        crud.create_user_history(db, history_data)
        
        # Mettre à jour les préférences
        if request.interests:
            preference = crud.get_or_create_preference(db, current_user.id)
            current_interests = []
            if preference and preference.interests:
                current_interests = [i.strip() for i in preference.interests.split(',')]
            
            new_interests = list(set(current_interests + request.interests))
            update_data = {"interests": ', '.join(new_interests)}
            crud.update_preference(db, current_user.id, update_data)
        
        print(f"✅ Sujet créé: {sujet.id} - {sujet.titre}")
        return sujet
        
    except Exception as e:
        print(f"❌ Erreur dans save_chosen_subject: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la sauvegarde: {str(e)}"
        )

# Route améliorée pour le chat
@router.post("/chat", response_model=schemas.AIChatResponse)
async def chat_with_ai(
    request: schemas.AIChatRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat intelligent avec contexte et suggestions"""
    try:
        # Récupérer l'historique de conversation
        conversation_history = crud.get_conversation_history(db, current_user.id, limit=10)
        
        # Construire le contexte
        preference = crud.get_or_create_preference(db, current_user.id)
        user_context = f"Utilisateur: {current_user.email}\n"
        
        if preference:
            if preference.interests:
                user_context += f"Intérêts: {preference.interests}\n"
            if preference.level:
                user_context += f"Niveau: {preference.level}\n"
            if preference.faculty:
                user_context += f"Faculté: {preference.faculty}\n"
        
        # Ajouter l'historique de conversation
        history_text = "\n".join([
            f"{'Utilisateur' if h.role == 'user' else 'Assistant'}: {h.content}"
            for h in conversation_history
        ])
        
        # Construire le prompt contextuel
        full_context = f"""
        {user_context}
        
        Historique de conversation:
        {history_text}
        
        Nouvelle question de l'utilisateur: {request.message}
        
        En tant qu'assistant MemoBot, sois:
        1. **Concis mais précis** - Donne des réponses claires et structurées
        2. **Proactif** - Propose des suggestions pertinentes
        3. **Encourageant** - Soutiens l'utilisateur dans sa démarche
        4. **Pratique** - Donne des conseils applicables immédiatement
        
        Si la question concerne:
        - Un sujet de mémoire → Propose 3 pistes concrètes
        - Une méthodologie → Explique clairement avec exemples
        - Un problème spécifique → Donne des solutions étape par étape
        """
        
        # Obtenir la réponse de l'IA
        réponse = répondre_question(request.message, full_context)
        
        # Analyser la réponse pour extraire des suggestions
        suggestions = []
        action_buttons = []
        
        # Détecter le type de demande
        message_lower = request.message.lower()
        
        if any(word in message_lower for word in ['sujet', 'thème', 'idée', 'projet']):
            suggestions = [
                "Voulez-vous que je génère 3 sujets spécifiques pour vous ?",
                "Je peux vous aider à affiner votre problématique",
                "Consultez la base de sujets existants pour inspiration"
            ]
            action_buttons = [
                {"text": "🎯 Générer 3 sujets IA", "action": "generate_three"},
                {"text": "📚 Voir les sujets populaires", "action": "browse_popular"},
                {"text": "🔍 Affiner ma problématique", "action": "refine_problem"}
            ]
        
        elif any(word in message_lower for word in ['méthodo', 'méthodologie', 'approche']):
            suggestions = [
                "Choisissez une méthodologie adaptée à votre question de recherche",
                "Méthodes quantitatives: enquêtes, expérimentations",
                "Méthodes qualitatives: entretiens, études de cas"
            ]
        
        # Sauvegarder la conversation
        crud.save_conversation_message(
            db,
            user_id=current_user.id,
            role="user",
            content=request.message
        )
        
        crud.save_conversation_message(
            db,
            user_id=current_user.id,
            role="assistant",
            content=réponse
        )
        
        return {
            "message": réponse,
            "suggestions": suggestions,
            "actions": action_buttons,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Erreur dans chat_with_ai: {e}")
        # Réponse de secours
        return {
            "message": "Je suis désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ? En attendant, voici quelques conseils généraux:\n\n1. Précisez votre domaine d'étude\n2. Décrivez vos intérêts de recherche\n3. Mentionnez votre niveau académique\n\nCela m'aidera à mieux vous assister !",
            "suggestions": ["Réessayez votre question", "Consultez les FAQs", "Contactez un enseignant"],
            "actions": [],
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/ask", response_model=schemas.AIResponse)
async def ask_question(
    request: schemas.AIRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Route legacy pour compatibilité avec l'ancien frontend"""
    try:
        # Récupérer l'historique de conversation
        conversation_history = crud.get_conversation_history(db, current_user.id, limit=5)  # Limiter à 5
        
        # Construire le contexte de manière plus propre
        preference = crud.get_or_create_preference(db, current_user.id)
        
        # Construire un prompt plus simple et direct
        context_parts = []
        
        if preference and preference.interests:
            context_parts.append(f"Intérêts de l'utilisateur: {preference.interests}")
        
        if preference and preference.level:
            context_parts.append(f"Niveau académique: {preference.level}")
        
        if preference and preference.faculty:
            context_parts.append(f"Faculté: {preference.faculty}")
        
        # Ajouter l'historique récent
        if conversation_history:
            recent_history = conversation_history[-3:]  # 3 derniers messages
            history_text = "\n".join([
                f"{'Étudiant' if h.role == 'user' else 'Assistant'}: {h.content[:100]}..." 
                for h in recent_history
            ])
            context_parts.append(f"Historique récent:\n{history_text}")
        
        # Construire le contexte final
        context = "\n".join(context_parts) if context_parts else ""
        
        # Obtenir la réponse de l'IA avec un prompt plus simple
        réponse = répondre_question(request.question, context)
        
        # Nettoyer la réponse (enlever les répétitions de prompt)
        if "**RÉPONSE:**" in réponse:
            réponse = réponse.split("**RÉPONSE:**")[-1].strip()
        
        # Extraire des suggestions basées sur le type de question
        suggestions = []
        question_lower = request.question.lower()
        
        if any(word in question_lower for word in ['sujet', 'thème', 'idée', 'projet', 'mémoire']):
            suggestions = [
                "Voulez-vous que je génère 3 sujets IA spécifiques pour vous ?",
                "Je peux vous aider à affiner votre problématique",
                "Consultez notre base de sujets existants"
            ]
        elif any(word in question_lower for word in ['méthodo', 'méthodologie', 'approche', 'méthode']):
            suggestions = [
                "Méthodologie quantitative: enquêtes, expérimentations",
                "Méthodologie qualitative: entretiens, études de cas",
                "Méthodes mixtes: combinaison des deux approches"
            ]
        
        # Sauvegarder la conversation
        crud.save_conversation_message(
            db,
            user_id=current_user.id,
            role="user",
            content=request.question
        )
        
        crud.save_conversation_message(
            db,
            user_id=current_user.id,
            role="assistant",
            content=réponse
        )
        
        return schemas.AIResponse(
            question=request.question,
            réponse=réponse,
            suggestions=suggestions
        )
        
    except Exception as e:
        print(f"Erreur dans ask_question: {e}")
        return schemas.AIResponse(
            question=request.question,
            réponse="Je suis désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?",
            suggestions=["Réessayez votre question", "Consultez les FAQs", "Contactez un enseignant"]
        )

@router.post("/recommend", response_model=List[schemas.RecommendedSujet])
async def recommend_with_ai(
    request: schemas.RecommendationRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Recommandation améliorée avec suggestion de 3 sujets maximum"""
    try:
        # Limiter à 3 recommandations maximum
        request.limit = min(request.limit, 3)
        
        # Utiliser le moteur traditionnel (garder la logique existante)
        recommendations = recommendation_engine.recommend_sujets(
            db=db,
            interests=request.interests,
            niveau=request.niveau,
            faculté=request.faculté,
            domaine=request.domaine,
            difficulté=request.difficulté,
            limit=request.limit
        )
        
        # Convertir au format attendu
        results = []
        for rec in recommendations:
            results.append({
                "sujet": rec["sujet"],
                "score": rec["score"],
                "raisons": rec["raisons"],
                "critères_respectés": rec["critères_respectés"]
            })
        
        return results
        
    except Exception as e:
        print(f"Erreur dans recommend_with_ai: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la recommandation: {str(e)}"
        )
@router.post("/analyze", response_model=schemas.AIAnalysisResponse)
async def analyze_subject(
    request: schemas.AnalyzeSubjectRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyse un sujet avec l'IA"""
    try:
        # Préparer les données pour l'analyse
        sujet_data = {
            "titre": request.titre,
            "description": request.description,
            "domaine": request.domaine or "Général",
            "niveau": request.niveau or "M2",
            "faculté": request.faculté or "Sciences",
            "problématique": request.problématique or "",
            "keywords": request.keywords or ""
        }
        
        # Utiliser la fonction d'analyse existante
        analysis = analyser_sujet(sujet_data)
        
        # Sauvegarder l'analyse dans l'historique
        history_data = schemas.UserHistoryCreate(
            user_id=current_user.id,
            action="ai_analysis",
            details=f"Analysé le sujet: {request.titre[:50]}...",
            metadata={
                "titre": request.titre,
                "pertinence": analysis.get("pertinence", 75),
                "points_forts": analysis.get("points_forts", []),
                "points_faibles": analysis.get("points_faibles", [])
            }
        )
        crud.create_user_history(db, history_data)
        
        # Formater la réponse selon le schéma
        return {
            "pertinence": analysis.get("pertinence", 75),
            "points_forts": analysis.get("points_forts", []),
            "points_faibles": analysis.get("points_faibles", []),
            "suggestions": analysis.get("suggestions", []),
            "recommandations": analysis.get("recommandations", [])
        }
        
    except Exception as e:
        print(f"Erreur dans analyze_subject: {e}")
        # Retourner une analyse par défaut en cas d'erreur
        return {
            "pertinence": 75,
            "points_forts": [
                "Sujet bien structuré",
                "Problématique intéressante",
                "Domaine porteur"
            ],
            "points_faibles": [
                "Méthodologie à préciser",
                "Ressources bibliographiques à vérifier"
            ],
            "suggestions": [
                "Approfondir la revue de littérature",
                "Définir un protocole expérimental précis",
                "Établir un calendrier de recherche"
            ],
            "recommandations": [
                "Consulter un expert du domaine",
                "Valider la faisabilité technique",
                "Planifier les ressources nécessaires"
            ]
        }
# Route publique pour le chat sans authentification
@router.post("/ask-public", response_model=schemas.AIResponse)
async def ask_question_public(
    request: schemas.AIRequest,
    db: Session = Depends(get_db)  # Pas de get_current_user ici
):
    """Route publique pour le chat - accessible sans authentification"""
    try:
        # Construire un prompt simple
        context = "Utilisateur non connecté posant une question sur un sujet de mémoire."
        
        # Obtenir la réponse de l'IA
        réponse = répondre_question(request.question, context)
        
        # Nettoyer la réponse
        if "**RÉPONSE:**" in réponse:
            réponse = réponse.split("**RÉPONSE:**")[-1].strip()
        
        # Suggestions génériques pour les non-connectés
        suggestions = [
            "Créez un compte gratuit pour sauvegarder vos conversations",
            "Accédez à notre base de sujets en vous inscrivant",
            "Recevez des recommandations personnalisées avec un compte"
        ]
        
        # Ajouter une suggestion pour s'inscrire si la question concerne des sujets
        question_lower = request.question.lower()
        if any(word in question_lower for word in ['sujet', 'thème', 'idée', 'projet', 'mémoire']):
            suggestions.append("Inscrivez-vous pour générer des sujets personnalisés avec IA")
        
        return schemas.AIResponse(
            question=request.question,
            réponse=réponse,
            suggestions=suggestions
        )
        
    except Exception as e:
        print(f"Erreur dans ask_question_public: {e}")
        return schemas.AIResponse(
            question=request.question,
            réponse="Je suis désolé, je rencontre des difficultés techniques. Veuillez réessayer.",
            suggestions=[
                "Réessayez votre question",
                "Contactez-nous si le problème persiste"
            ]
        )

# Vous pouvez aussi créer une route d'analyse publique
@router.post("/analyze-public", response_model=schemas.AIAnalysisResponse)
async def analyze_subject_public(
    request: schemas.AnalyzeSubjectRequest
):
    """Analyse un sujet avec l'IA - accessible sans authentification"""
    try:
        # Préparer les données pour l'analyse
        sujet_data = {
            "titre": request.titre,
            "description": request.description,
            "domaine": request.domaine or "Général",
            "niveau": request.niveau or "M2",
            "faculté": request.faculté or "Sciences",
            "problématique": request.problématique or "",
            "keywords": request.keywords or ""
        }
        
        # Utiliser la fonction d'analyse existante
        analysis = analyser_sujet(sujet_data)
        
        return {
            "pertinence": analysis.get("pertinence", 75),
            "points_forts": analysis.get("points_forts", []),
            "points_faibles": analysis.get("points_faibles", []),
            "suggestions": analysis.get("suggestions", []),
            "recommandations": analysis.get("recommandations", [])
        }
        
    except Exception as e:
        print(f"Erreur dans analyze_subject_public: {e}")
        return {
            "pertinence": 75,
            "points_forts": [
                "Sujet bien structuré",
                "Problématique intéressante",
                "Domaine porteur"
            ],
            "points_faibles": [
                "Méthodologie à préciser",
                "Ressources bibliographiques à vérifier"
            ],
            "suggestions": [
                "Approfondir la revue de littérature",
                "Définir un protocole expérimental précis",
                "Établir un calendrier de recherche"
            ],
            "recommandations": [
                "Créez un compte pour des analyses plus approfondies",
                "Consultez un expert du domaine",
                "Valider la faisabilité technique"
            ]
        }