from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="etudiant", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    history = relationship("UserHistory", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("ConversationMessage", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Sujet(Base):
    __tablename__ = "sujets"
    
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(500), nullable=False, index=True)
    keywords = Column(Text, nullable=False)
    domaine = Column(String(100), nullable=False, index=True)
    faculté = Column(String(100), nullable=False, index=True)
    niveau = Column(String(50), nullable=False, index=True)
    problématique = Column(Text, nullable=False)
    méthodologie = Column(Text)
    technologies = Column(Text)
    description = Column(Text, nullable=False)
    difficulté = Column(String(50), default="moyenne")
    durée_estimée = Column(String(50))
    ressources = Column(Text)
    
    # AJOUTEZ CES CHAMPS:
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Peut être null pour les sujets par défaut
    is_generated = Column(Boolean, default=False)  # Marqueur pour les sujets générés par IA
    
    vue_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    feedbacks = relationship("Feedback", back_populates="sujet")
    history_entries = relationship("UserHistory", back_populates="sujet")
    user = relationship("User")  # Ajoutez cette relation


class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sujet_id = Column(Integer, ForeignKey("sujets.id"), nullable=False)
    rating = Column(Integer)
    pertinence = Column(Integer)
    commentaire = Column(Text)
    intéressé = Column(Boolean, default=False)
    sélectionné = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    sujet = relationship("Sujet", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")


class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    interests = Column(Text, nullable=True)
    faculty = Column(String(255), nullable=True)
    level = Column(String(100), nullable=True)
    preferences = Column(JSON, nullable=True, default=dict)  # JSON au lieu de Text
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relation
    user = relationship("User", back_populates="preferences")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    university = Column(String(255), nullable=True)
    field = Column(String(255), nullable=True)
    level = Column(String(100), nullable=True)
    interests = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(500), nullable=True)
    linkedin = Column(String(500), nullable=True)
    github = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relation
    user = relationship("User", back_populates="profile")


class UserSkill(Base):
    __tablename__ = "user_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    level = Column(Integer, nullable=False)  # 1-10
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relation
    user = relationship("User", back_populates="skills")


class UserHistory(Base):
    __tablename__ = "user_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    sujet_id = Column(Integer, ForeignKey("sujets.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    user = relationship("User", back_populates="history")
    sujet = relationship("Sujet", back_populates="history_entries")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' ou 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relation
    user = relationship("User", back_populates="conversations")


class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    notifications_enabled = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    theme = Column(String(20), default="light")
    language = Column(String(10), default="fr")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relation
    user = relationship("User", back_populates="settings")