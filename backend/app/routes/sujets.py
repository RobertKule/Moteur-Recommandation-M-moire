from app.models import Sujet, User, Feedback, UserPreference
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import datetime
from app.database import get_db
from app import crud, schemas
from app.dependencies import get_current_user, require_admin
from app.llm_service import (
    recommander_sujets_llm as recommander_sujets,
    analyser_sujet,
    générer_sujets_llm as générer_sujets,
    répondre_question
)

router = APIRouter()

@router.post("/recommend", response_model=List[schemas.RecommendedSujet])
async def recommend_sujets(
    request: schemas.RecommendationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Recommander des sujets basés sur les intérêts avec IA
    """
    # Mettre à jour les préférences de l'utilisateur
    crud.update_preference(db, current_user.id, {
        "interests": ", ".join(request.interests),
        "faculty": request.faculté,
        "level": request.niveau
    })
    
    # Récupérer les sujets correspondants
    sujets_db = crud.search_sujets_by_keywords(
        db, 
        request.interests, 
        limit=50
    )
    
    if not sujets_db:
        raise HTTPException(
            status_code=404,
            detail="Aucun sujet trouvé pour ces intérêts"
        )
    
    # Préparer les données pour LLM
    sujets_data = []
    for sujet in sujets_db:
        sujets_data.append({
            "id": sujet.id,
            "titre": sujet.titre,
            "problematique": sujet.problématique,
            "keywords": sujet.keywords,
            "domaine": sujet.domaine,
            "niveau": sujet.niveau,
            "faculté": sujet.faculté,
            "difficulté": sujet.difficulté
        })
    
    # Obtenir les recommandations LLM
    recommendations = recommander_sujets(
        interests=request.interests,
        sujets=sujets_data,
        critères={
            "niveau": request.niveau,
            "faculté": request.faculté,
            "domaine": request.domaine,
            "difficulté": request.difficulté
        }
    )
    
    # Mapper les recommandations avec les sujets complets
    result = []
    for rec in recommendations[:request.limit]:
        sujet = next((s for s in sujets_db if s.id == rec["id"]), None)
        if sujet:
            result.append({
                "sujet": sujet,
                "score": rec.get("score", 0),
                "raisons": rec.get("raisons", []),
                "critères_respectés": rec.get("critères", [])
            })
    
    return result

@router.get("/search")
async def search_sujets(
    q: str = Query(None, description="Terme de recherche"),
    domaine: str = Query(None, description="Domaine"),
    faculté: str = Query(None, description="Faculté"),
    niveau: str = Query(None, description="Niveau"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Rechercher des sujets
    """
    sujets = crud.get_sujets(
        db=db,
        skip=skip,
        limit=limit,
        search=q,
        domaine=domaine,
        faculté=faculté,
        niveau=niveau
    )
    
    return sujets

@router.get("/{sujet_id}")
async def get_sujet(
    sujet_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Récupérer un sujet spécifique avec analyse IA
    """
    sujet = crud.get_sujet(db, sujet_id)
    if not sujet or not sujet.is_active:
        raise HTTPException(status_code=404, detail="Sujet non trouvé")
    
    # Incrémenter le compteur de vues
    crud.update_sujet_vue_count(db, sujet_id)
    
    # Analyser le sujet avec IA
    analyse = analyser_sujet({
        "titre": sujet.titre,
        "domaine": sujet.domaine,
        "niveau": sujet.niveau,
        "faculté": sujet.faculté,
        "problematique": sujet.problématique,
        "description": sujet.description,
        "keywords": sujet.keywords
    })
    
    return {
        "sujet": sujet,
        "analyse": analyse
    }

@router.post("/", response_model=schemas.Sujet)
async def create_sujet(
    sujet: schemas.SujetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Créer un nouveau sujet (admin only)
    """
    return crud.create_sujet(db, sujet)
@router.get("/", response_model=List[schemas.Sujet])
async def list_sujets(
    q: str = Query(None, description="Terme de recherche"),
    domaine: str = Query(None, description="Domaine"),
    faculté: str = Query(None, description="Faculté"),
    niveau: str = Query(None, description="Niveau"),
    difficulté: str = Query(None, description="Difficulté"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lister tous les sujets avec filtres
    """
    sujets = crud.get_sujets(
        db=db,
        skip=skip,
        limit=limit,
        search=q,
        domaine=domaine,
        faculté=faculté,
        niveau=niveau,
        difficulté=difficulté
    )
    
    return sujets
@router.post("/generate")
async def generate_sujets(
    interests: List[str] = Query(..., description="Intérêts"),
    domaine: str = Query("Génie Civil", description="Domaine"),
    niveau: str = Query("L3", description="Niveau"),
    faculté: str = Query("Génie Civil", description="Faculté"),
    count: int = Query(3, ge=1, le=10, description="Nombre de sujets à générer"),
    current_user = Depends(get_current_user)
):
    """
    Générer de nouveaux sujets avec IA
    """
    sujets = générer_sujets({
        "interests": ", ".join(interests),
        "domaine": domaine,
        "niveau": niveau,
        "faculté": faculté
    }, count)
    
    return sujets

@router.post("/feedback")
async def submit_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Soumettre un feedback sur un sujet
    """
    return crud.create_feedback(db, feedback, current_user.id)

@router.get("/stats/popular")
def get_popular_sujets(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100)
):
    """Récupère les sujets les plus populaires"""
    try:
        sujets = crud.get_popular_sujets(db, limit=limit)
        
        # Convertir en schéma Sujet
        result = []
        for sujet in sujets:
            sujet_dict = {
                "id": sujet.id,
                "titre": sujet.titre,
                "description": sujet.description,
                "domaine": sujet.domaine,
                "faculté": sujet.faculté,
                "niveau": sujet.niveau,
                "difficulté": sujet.difficulté,
                "vue_count": sujet.vue_count,
                "like_count": sujet.like_count,
                "created_at": sujet.created_at.isoformat() if sujet.created_at else None,
                "problématique": sujet.problématique or "",
                "méthodologie": sujet.méthodologie or "",
                "keywords": sujet.keywords or ""
            }
            result.append(sujet_dict)
        
        return result
        
    except Exception as e:
        print(f"Erreur dans get_popular_sujets: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.get("/stats/keywords")
async def get_popular_keywords(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Mots-clés les plus populaires
    """
    return crud.get_popular_keywords(db, limit)

@router.get("/stats/domains")
async def get_domains_stats(db: Session = Depends(get_db)):
    """
    Statistiques par domaine
    """
    from sqlalchemy import func
    
    stats = db.query(
        Sujet.domaine,
        func.count(Sujet.id).label('count'),
        func.avg(Sujet.vue_count).label('avg_views')
    ).group_by(Sujet.domaine).all()
    
    return [
        {"domaine": domaine, "count": count, "avg_views": round(avg_views or 0, 1)}
        for domaine, count, avg_views in stats
    ]
    
@router.get("/stats/popular")
def get_popular_sujets(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Récupérer les sujets les plus populaires
    """
    # Pour l'instant, retourner des données mock
    # Vous pourrez remplacer par une vraie requête plus tard
    return [
        {
            "id": 1,
            "titre": "Impact de l'IA sur la cybersécurité moderne",
            "domaine": "Informatique",
            "niveau": "Master 2",
            "vue_count": 125,
            "created_at": "2024-01-15T10:30:00"
        },
        {
            "id": 2,
            "titre": "Blockchain pour la traçabilité alimentaire",
            "domaine": "Informatique",
            "niveau": "Master 1",
            "vue_count": 89,
            "created_at": "2024-01-14T14:20:00"
        },
        {
            "id": 3,
            "titre": "Optimisation des réseaux 5G avec IA",
            "domaine": "Télécommunications",
            "niveau": "Master 2",
            "vue_count": 76,
            "created_at": "2024-01-13T09:15:00"
        }
    ]
