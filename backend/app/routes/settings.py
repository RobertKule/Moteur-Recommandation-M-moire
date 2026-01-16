# app/routes/settings.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import json
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app import schemas
from app.models import User, UserPreference

router = APIRouter()

@router.get("/preferences")
def get_user_preferences(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les préférences de l'utilisateur connecté
    """
    # Chercher les préférences existantes
    preference = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    
    # Si pas de préférences, créer une entrée par défaut
    if not preference:
        preference = UserPreference(
            user_id=current_user.id,
            interests="",
            faculty="",
            level="",
            preferences='{}'
        )
        db.add(preference)
        db.commit()
        db.refresh(preference)
    
    # Parser les préférences JSON
    prefs_dict = {}
    if preference.preferences:
        try:
            prefs_dict = json.loads(preference.preferences)
        except json.JSONDecodeError:
            prefs_dict = {}
    
    return {
        "interests": preference.interests or "",
        "faculty": preference.faculty or "",
        "level": preference.level or "",
        "preferences": prefs_dict
    }

@router.put("/preferences")
def update_preferences(
    preferences: Dict[str, Any],
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour les préférences de l'utilisateur
    """
    # Chercher les préférences existantes
    preference = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    
    # Si pas de préférences, créer une nouvelle entrée
    if not preference:
        preference = UserPreference(user_id=current_user.id)
        db.add(preference)
    
    # Mettre à jour les préférences JSON
    preference.preferences = json.dumps(preferences.get("preferences", {}))
    
    # Mettre à jour les autres champs si présents
    if "interests" in preferences:
        preference.interests = preferences["interests"]
    if "faculty" in preferences:
        preference.faculty = preferences["faculty"]
    if "level" in preferences:
        preference.level = preferences["level"]
    
    preference.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Préférences mises à jour avec succès"}

@router.post("/change-password")
def change_password(
    data: Dict[str, str],
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Changer le mot de passe de l'utilisateur
    """
    from app.auth import verify_password, get_password_hash
    
    old_password = data.get("old_password")
    new_password = data.get("new_password")
    
    if not old_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien et nouveau mot de passe requis"
        )
    
    # Vérifier l'ancien mot de passe
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien mot de passe incorrect"
        )
    
    # Valider le nouveau mot de passe
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit contenir au moins 6 caractères"
        )
    
    # Mettre à jour le mot de passe
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Mot de passe changé avec succès"}