# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app import crud, schemas, auth
from app.schemas import Token, User, UserLogin
from app.auth import verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Enregistrement d'un nouvel utilisateur.
    """
    # Vérifier si l'email existe déjà
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Créer l'utilisateur
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Connexion d'un utilisateur.
    Retourne un token JWT pour l'authentification.
    """
    # Vérifier l'utilisateur
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier si le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Créer le token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login-json", response_model=schemas.Token)
def login_json(
    login_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """
    Connexion avec JSON (alternative).
    """
    print(f"Login attempt for email: {login_data.email}")  # Debug
    
    # Vérifier l'utilisateur
    user = crud.get_user_by_email(db, email=login_data.email)
    print(f"User found: {user is not None}")  # Debug
    
    if not user:
        print("User not found")  # Debug
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier le mot de passe
    from app.auth import verify_password
    password_valid = verify_password(login_data.password, user.hashed_password)
    print(f"Password valid: {password_valid}")  # Debug
    
    if not password_valid:
        print("Password invalid")  # Debug
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier si le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Créer le token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    print(f"Token created for user: {user.email}")  # Debug
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(email: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Demande de réinitialisation de mot de passe.
    """
    user = crud.get_user_by_email(db, email=email.email)
    if not user:
        # Pour la sécurité, on ne révèle pas si l'email existe
        return {"message": "If an account exists with this email, you will receive a password reset link"}
    
    # Ici, on générerait un token de réinitialisation
    reset_token = create_access_token(
        data={"sub": user.email, "purpose": "password_reset"},
        expires_delta=timedelta(minutes=15)
    )
    
    # En production: envoyer l'email
    print(f"Password reset token for {user.email}: {reset_token}")
    
    return {"message": "Password reset link sent"}

@router.post("/reset-password")
def reset_password(reset_data: schemas.PasswordReset, db: Session = Depends(get_db)):
    """
    Réinitialisation du mot de passe avec un token valide.
    """
    # Vérifier le token
    payload = auth.decode_access_token(reset_data.token)
    if not payload or payload.get("purpose") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    email = payload.get("sub")
    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Mettre à jour le mot de passe
    from app.auth import get_password_hash
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()
    
    return {"message": "Password reset successful"}

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Récupérer les informations de l'utilisateur connecté.
    """
    return current_user

@router.post("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Changer le mot de passe de l'utilisateur connecté.
    """
    # Vérifier l'ancien mot de passe
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    # Mettre à jour avec le nouveau mot de passe
    from app.auth import get_password_hash
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}