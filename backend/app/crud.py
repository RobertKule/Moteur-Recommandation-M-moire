from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
from app.models import (
    User, UserPreference, Sujet, Feedback, 
    UserProfile, UserSkill, UserHistory, 
    ConversationMessage, UserSettings
)
from app import schemas
from app.auth import get_password_hash


# ========== USER FUNCTIONS ==========
def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role.value if hasattr(user.role, 'value') else user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Créer les entrées par défaut
    create_user_preference(db, db_user.id)
    create_user_profile(db, db_user.id)
    create_user_settings(db, db_user.id)
    
    return db_user

def update_user(db: Session, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
    user = get_user(db, user_id)
    if not user:
        return None
    
    for key, value in user_data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


# ========== SUJET FUNCTIONS ==========
def get_sujet(db: Session, sujet_id: int) -> Optional[Sujet]:
    return db.query(Sujet).filter(Sujet.id == sujet_id).first()

def get_sujets(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    domaine: Optional[str] = None,
    faculté: Optional[str] = None,
    niveau: Optional[str] = None,
    difficulté: Optional[str] = None,
    is_active: bool = True
) -> List[Sujet]:
    query = db.query(Sujet)
    
    if is_active:
        query = query.filter(Sujet.is_active == True)
    
    if search:
        query = query.filter(
            Sujet.titre.contains(search) |
            Sujet.keywords.contains(search) |
            Sujet.description.contains(search)
        )
    
    if domaine:
        query = query.filter(Sujet.domaine == domaine)
    
    if faculté:
        query = query.filter(Sujet.faculté == faculté)
    
    if niveau:
        query = query.filter(Sujet.niveau == niveau)
    
    if difficulté:
        query = query.filter(Sujet.difficulté == difficulté)
    
    return query.offset(skip).limit(limit).all()

def create_sujet(db: Session, sujet: schemas.SujetCreate, user_id: Optional[int] = None) -> Sujet:
    # Convertir en dict
    sujet_dict = sujet.dict()
    
    # Ajouter user_id seulement si fourni
    if user_id:
        sujet_dict["user_id"] = user_id
    
    # Créer l'instance Sujet
    db_sujet = Sujet(**sujet_dict)
    db.add(db_sujet)
    db.commit()
    db.refresh(db_sujet)
    return db_sujet

def update_sujet(db: Session, sujet_id: int, sujet_data: Dict[str, Any]) -> Optional[Sujet]:
    sujet = get_sujet(db, sujet_id)
    if not sujet:
        return None
    
    for key, value in sujet_data.items():
        if hasattr(sujet, key) and value is not None:
            setattr(sujet, key, value)
    
    db.commit()
    db.refresh(sujet)
    return sujet

def delete_sujet(db: Session, sujet_id: int) -> bool:
    sujet = get_sujet(db, sujet_id)
    if not sujet:
        return False
    
    db.delete(sujet)
    db.commit()
    return True

def update_sujet_vue_count(db: Session, sujet_id: int):
    sujet = get_sujet(db, sujet_id)
    if sujet:
        sujet.vue_count += 1
        db.commit()

def like_sujet(db: Session, sujet_id: int) -> Optional[Sujet]:
    sujet = get_sujet(db, sujet_id)
    if sujet:
        sujet.like_count += 1
        db.commit()
        db.refresh(sujet)
    return sujet


# ========== PREFERENCE FUNCTIONS ==========
def get_or_create_preference(db: Session, user_id: int) -> UserPreference:
    preference = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not preference:
        preference = create_user_preference(db, user_id)
    return preference

def create_user_preference(db: Session, user_id: int) -> UserPreference:
    preference = UserPreference(user_id=user_id)
    db.add(preference)
    db.commit()
    db.refresh(preference)
    return preference

def update_preference(db: Session, user_id: int, preference_data: Dict[str, Any]) -> UserPreference:
    preference = get_or_create_preference(db, user_id)
    
    for key, value in preference_data.items():
        if hasattr(preference, key) and value is not None:
            setattr(preference, key, value)
    
    db.commit()
    db.refresh(preference)
    return preference


# ========== FEEDBACK FUNCTIONS ==========
def create_feedback(db: Session, feedback: schemas.FeedbackCreate, user_id: int) -> Feedback:
    db_feedback = Feedback(**feedback.dict(), user_id=user_id)
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_user_feedbacks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Feedback]:
    return db.query(Feedback).filter(Feedback.user_id == user_id).offset(skip).limit(limit).all()

def get_sujet_feedbacks(db: Session, sujet_id: int, skip: int = 0, limit: int = 100) -> List[Feedback]:
    return db.query(Feedback).filter(Feedback.sujet_id == sujet_id).offset(skip).limit(limit).all()


# ========== SEARCH FUNCTIONS ==========
def search_sujets_by_keywords(db: Session, keywords: List[str], limit: int = 10) -> List[Sujet]:
    if not keywords:
        return []
    
    query = db.query(Sujet).filter(Sujet.is_active == True)
    
    import sqlalchemy as sa
    conditions = []
    for keyword in keywords:
        keyword_pattern = f"%{keyword.lower()}%"
        conditions.append(sa.func.lower(Sujet.keywords).like(keyword_pattern))
        conditions.append(sa.func.lower(Sujet.titre).like(keyword_pattern))
        conditions.append(sa.func.lower(Sujet.description).like(keyword_pattern))
    
    if conditions:
        query = query.filter(sa.or_(*conditions))
    
    return query.order_by(Sujet.vue_count.desc()).limit(limit).all()


# ========== USER PROFILE FUNCTIONS ==========
def get_user_profile(db: Session, user_id: int) -> Optional[UserProfile]:
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

def create_user_profile(db: Session, user_id: int) -> UserProfile:
    db_profile = UserProfile(user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_or_create_profile(db: Session, user_id: int) -> UserProfile:
    profile = get_user_profile(db, user_id)
    if not profile:
        profile = create_user_profile(db, user_id)
    return profile

def update_user_profile(db: Session, user_id: int, profile_data: dict) -> UserProfile:
    profile = get_or_create_profile(db, user_id)
    
    for key, value in profile_data.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile


# ========== USER SKILLS FUNCTIONS ==========
def get_user_skills(db: Session, user_id: int) -> List[UserSkill]:
    return db.query(UserSkill).filter(UserSkill.user_id == user_id).all()

def create_user_skill(db: Session, user_id: int, skill_data: dict) -> UserSkill:
    db_skill = UserSkill(user_id=user_id, **skill_data)
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def update_user_skills(db: Session, user_id: int, skills: List[dict]) -> List[UserSkill]:
    # Supprimer les anciennes compétences
    db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()
    
    # Ajouter les nouvelles
    created_skills = []
    for skill_data in skills:
        skill = create_user_skill(db, user_id, skill_data)
        created_skills.append(skill)
    
    db.commit()
    return created_skills


# ========== USER STATS FUNCTIONS ==========
def get_user_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """Calcule les statistiques de l'utilisateur"""
    # Compter les sujets explorés
    explored_subjects = db.query(Feedback).filter(
        Feedback.user_id == user_id,
        Feedback.pertinence.isnot(None)
    ).count()
    
    # Compter les recommandations
    recommendations_count = db.query(Feedback).filter(
        Feedback.user_id == user_id,
        Feedback.intéressé == True
    ).count()
    
    # Calculer la complétion du profil
    profile = get_user_profile(db, user_id)
    profile_completion = 0
    if profile:
        fields = [
            profile.bio, profile.location, profile.university, 
            profile.field, profile.level, profile.interests,
            profile.phone, profile.website, profile.linkedin, profile.github
        ]
        filled_fields = sum(1 for field in fields if field and str(field).strip())
        profile_completion = int((filled_fields / len(fields)) * 100)
    
    # Jours actifs
    active_days = db.query(func.count(func.distinct(func.date(Feedback.created_at)))).filter(
        Feedback.user_id == user_id
    ).scalar() or 0
    
    # Dernière activité
    last_feedback = db.query(Feedback).filter(
        Feedback.user_id == user_id
    ).order_by(Feedback.created_at.desc()).first()
    
    last_active = last_feedback.created_at if last_feedback else datetime.utcnow()
    
    return {
        "profile_completion": profile_completion,
        "explored_subjects": explored_subjects,
        "recommendations_count": recommendations_count,
        "active_days": active_days,
        "last_active": last_active
    }


# ========== STATISTICS FUNCTIONS ==========
def get_popular_keywords(db: Session, limit: int = 20) -> List[Dict[str, Any]]:
    """Récupère les mots-clés les plus populaires"""
    from collections import Counter
    
    sujets = get_sujets(db, limit=1000)
    all_keywords = []
    
    for sujet in sujets:
        if sujet.keywords:
            keywords = [k.strip().lower() for k in sujet.keywords.split(',')]
            all_keywords.extend(keywords)
    
    keyword_counts = Counter(all_keywords)
    popular = keyword_counts.most_common(limit)
    
    return [{"keyword": k, "count": c} for k, c in popular]

def get_domain_stats(db: Session) -> List[Dict[str, Any]]:
    """Statistiques par domaine"""
    stats = db.query(
        Sujet.domaine,
        func.count(Sujet.id).label('count'),
        func.avg(Sujet.vue_count).label('avg_views')
    ).filter(Sujet.is_active == True).group_by(Sujet.domaine).all()
    
    return [
        {"domaine": stat.domaine, "count": stat.count, "avg_views": float(stat.avg_views or 0)}
        for stat in stats
    ]

def get_popular_sujets(db: Session, limit: int = 10):
    """Récupère les sujets les plus populaires par nombre de vues"""
    return db.query(models.Sujet)\
        .filter(models.Sujet.is_active == True)\
        .order_by(models.Sujet.vue_count.desc(), models.Sujet.like_count.desc())\
        .limit(limit)\
        .all()

def get_dashboard_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """Statistiques pour le tableau de bord"""
    # Total des sujets
    total_sujets = db.query(Sujet).filter(Sujet.is_active == True).count()
    
    # Sujets de l'utilisateur
    user_sujets = db.query(Sujet).filter(Sujet.user_id == user_id).count()
    
    # Sujets sauvegardés (intéressé ou sélectionné)
    saved_sujets = db.query(Feedback).filter(
        Feedback.user_id == user_id,
        Feedback.intéressé == True
    ).count()
    
    # Recommandations générées
    recommendations_count = db.query(Feedback).filter(Feedback.user_id == user_id).count()
    
    # Dernière activité
    last_feedback = db.query(Feedback).filter(
        Feedback.user_id == user_id
    ).order_by(Feedback.created_at.desc()).first()
    
    last_activity = last_feedback.created_at if last_feedback else None
    
    # Mots-clés populaires
    popular_keywords = get_popular_keywords(db, limit=10)
    
    # Statistiques par domaine
    domain_stats = get_domain_stats(db)
    
    return {
        "total_sujets": total_sujets,
        "user_sujets": user_sujets,
        "saved_sujets": saved_sujets,
        "recommendations_count": recommendations_count,
        "last_activity": last_activity,
        "popular_keywords": popular_keywords,
        "domain_stats": domain_stats
    }


# ========== HISTORY & CONVERSATION FUNCTIONS ==========
def create_user_history(db: Session, history_data: schemas.UserHistoryCreate) -> UserHistory:
    db_history = UserHistory(**history_data.dict())
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_conversation_history(db: Session, user_id: int, limit: int = 10) -> List[ConversationMessage]:
    return db.query(ConversationMessage).filter(
        ConversationMessage.user_id == user_id
    ).order_by(ConversationMessage.timestamp.desc()).limit(limit).all()

def save_conversation_message(db: Session, user_id: int, role: str, content: str) -> ConversationMessage:
    db_message = ConversationMessage(user_id=user_id, role=role, content=content)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


# ========== SETTINGS FUNCTIONS ==========
def create_user_settings(db: Session, user_id: int) -> UserSettings:
    settings = UserSettings(user_id=user_id)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

def get_user_settings(db: Session, user_id: int) -> Optional[UserSettings]:
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

def update_user_settings(db: Session, user_id: int, settings_data: dict) -> UserSettings:
    settings = get_user_settings(db, user_id)
    if not settings:
        settings = create_user_settings(db, user_id)
    
    for key, value in settings_data.items():
        if hasattr(settings, key) and value is not None:
            setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings


# ========== AI SPECIFIC FUNCTIONS ==========
def save_chosen_subject(db: Session, user_id: int, subject_data: schemas.SaveChosenSubjectRequest) -> Sujet:
    """Sauvegarde un sujet choisi par l'utilisateur"""
    sujet_data = subject_data.dict(exclude={'interests'})
    sujet_data['user_id'] = user_id
    sujet_data['is_active'] = True
    
    # Créer le sujet
    sujet = create_sujet(db, schemas.SujetCreate(**sujet_data), user_id)
    
    # Créer un feedback pour ce sujet
    feedback_data = {
        "sujet_id": sujet.id,
        "intéressé": True,
        "sélectionné": True,
        "commentaire": "Sujet choisi parmi les recommandations IA"
    }
    create_feedback(db, schemas.FeedbackCreate(**feedback_data), user_id)
    
    # Mettre à jour les préférences avec les intérêts
    if subject_data.interests:
        preference = get_or_create_preference(db, user_id)
        current_interests = preference.interests.split(',') if preference.interests else []
        new_interests = list(set(current_interests + subject_data.interests))
        update_preference(db, user_id, {"interests": ', '.join(new_interests)})
    
    # Créer un historique
    history_data = {
        "user_id": user_id,
        "action": "chose_ai_subject",
        "details": f"A choisi le sujet généré par IA: {sujet.titre}",
        "sujet_id": sujet.id
    }
    create_user_history(db, schemas.UserHistoryCreate(**history_data))
    
    return sujet