from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, sujets, users, ai

# Créer les tables si elles n'existent pas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MemoBot API",
    description="API pour la recommandation de sujets de mémoire avec IA",
    version="1.0.0"
)

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes avec le préfixe /api/v1
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(sujets.router, prefix="/api/v1/sujets", tags=["sujets"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API MemoBot"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "memo-bot-api"}

@app.get("/api/v1/health")
def health_check_v1():
    return {"status": "healthy", "service": "memo-bot-api", "version": "v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)