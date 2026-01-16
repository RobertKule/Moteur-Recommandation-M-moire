from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import crud, schemas
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["users"])

# Routes pour les préférences utilisateur
@router.get("/me/preferences")
def get_my_preferences(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les préférences de l'utilisateur connecté
    """
    preferences = crud.get_or_create_preference(db, current_user.id)
    return preferences

@router.put("/me/preferences")
def update_my_preferences(
    preference_update: dict,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour les préférences de l'utilisateur connecté
    """
    preferences = crud.update_preference(db, current_user.id, preference_update)
    return preferences

# Routes pour le profil utilisateur
@router.get("/{user_id}/profile")
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Récupérer le profil utilisateur
    """
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # TEMPORAIRE: Retourner des données mock
    return {
        "user_id": user_id,
        "bio": "Étudiant passionné par la technologie et l'innovation",
        "location": "Paris, France",
        "university": "Université Paris-Saclay",
        "field": "Informatique",
        "level": "Master 2",
        "interests": "IA, Machine Learning, Web Development, Data Science",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

@router.put("/{user_id}/profile")
def update_user_profile(
    user_id: int,
    profile_update: dict,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Mettre à jour le profil utilisateur
    """
    # Vérifier que l'utilisateur peut mettre à jour son propre profil
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's profile"
        )
    
    # TEMPORAIRE: Simuler la mise à jour
    return {
        "user_id": user_id,
        **profile_update,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

# Routes admin
@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)  # Seulement pour les admins
):
    """
    Récupérer tous les utilisateurs.
    Accessible uniquement aux administrateurs.
    """
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)  # Seulement pour les admins
):
    """
    Récupérer un utilisateur spécifique par ID.
    Accessible uniquement aux administrateurs.
    """
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

# Ajoutez ces routes pour les compétences et statistiques (mock)
@router.get("/{user_id}/skills")
def get_user_skills(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Récupérer les compétences de l'utilisateur
    """
    # TEMPORAIRE: Données mock
    return [
        {
            "id": 1,
            "user_id": user_id,
            "name": "Python",
            "level": 8,
            "category": "Programming",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": 2,
            "user_id": user_id,
            "name": "FastAPI",
            "level": 7,
            "category": "Web Development",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": 3,
            "user_id": user_id,
            "name": "Machine Learning",
            "level": 6,
            "category": "AI",
            "created_at": datetime.now().isoformat()
        }
    ]

@router.get("/{user_id}/stats")
def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Récupérer les statistiques de l'utilisateur
    """
    # TEMPORAIRE: Données mock
    return {
        "profile_completion": 75,
        "explored_subjects": 15,
        "recommendations_count": 8,
        "active_days": 24,
        "last_active": datetime.now().isoformat()
    }
    
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import crud, schemas
from app.dependencies import get_current_user, require_admin

router = APIRouter()

# Routes pour les préférences utilisateur
@router.get("/me/preferences")
def get_my_preferences(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les préférences de l'utilisateur connecté
    """
    preferences = crud.get_or_create_preference(db, current_user.id)
    return preferences

@router.put("/me/preferences")
def update_my_preferences(
    preference_update: dict,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour les préférences de l'utilisateur connecté
    """
    preferences = crud.update_preference(db, current_user.id, preference_update)
    return preferences

# Routes pour le profil utilisateur

@router.get("/{user_id}/profile", response_model=schemas.UserProfile)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Récupérer le profil utilisateur
    """
    # Vérifier que l'utilisateur peut accéder à ce profil
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other user's profile"
        )
    
    profile = crud.get_or_create_profile(db, user_id)
    return profile

@router.put("/{user_id}/profile", response_model=schemas.UserProfile)
def update_user_profile(
    user_id: int,
    profile_update: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Mettre à jour le profil utilisateur
    """
    # Vérifier que l'utilisateur peut mettre à jour son propre profil
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other user's profile"
        )
    
    profile = crud.update_user_profile(db, user_id, profile_update.dict(exclude_unset=True))
    return profile

@router.get("/{user_id}/skills", response_model=List[schemas.UserSkill])
def get_user_skills(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Récupérer les compétences de l'utilisateur
    """
    # Vérifier que l'utilisateur peut accéder à ces données
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other user's skills"
        )
    
    skills = crud.get_user_skills(db, user_id)
    return skills

@router.post("/{user_id}/skills", response_model=schemas.UserSkill)
def create_user_skill_endpoint(
    user_id: int,
    skill: schemas.UserSkillCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Créer une compétence pour l'utilisateur
    """
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create skill for other user"
        )
    
    return crud.create_user_skill(db, user_id, skill.dict())

@router.put("/{user_id}/skills", response_model=List[schemas.UserSkill])
def update_user_skills_endpoint(
    user_id: int,
    skills: List[schemas.UserSkillCreate],
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Mettre à jour toutes les compétences de l'utilisateur
    """
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update skills for other user"
        )
    
    return crud.update_user_skills(db, user_id, [skill.dict() for skill in skills])

@router.get("/{user_id}/stats", response_model=schemas.UserStats)
def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Récupérer les statistiques de l'utilisateur
    """
    # Vérifier que l'utilisateur peut accéder à ces données
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other user's stats"
        )
    
    stats = crud.get_user_stats(db, user_id)
    return stats


# Routes admin
@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)  # Seulement pour les admins
):
    """
    Récupérer tous les utilisateurs.
    Accessible uniquement aux administrateurs.
    """
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)  # Seulement pour les admins
):
    """
    Récupérer un utilisateur spécifique par ID.
    Accessible uniquement aux administrateurs.
    """
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

    