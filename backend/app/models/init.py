from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Tous vos modèles dans un seul fichier __init__.py
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="etudiant", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relation avec UserPreference
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    interests = Column(Text, nullable=True)
    faculty = Column(String(255), nullable=True)
    level = Column(String(100), nullable=True)  # ex: "Master 2", "Licence 3"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relation
    user = relationship("User", back_populates="preferences")

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
    
    vue_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    feedbacks = relationship("Feedback", back_populates="sujet")

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
    
    sujet = relationship("Sujet", back_populates="feedbacks")