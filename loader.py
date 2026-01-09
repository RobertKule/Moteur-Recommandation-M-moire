# loader.py
"""
Chargement et préparation du dataset de sujets de mémoire
Gestion robuste des formats CSV académiques
"""

import pandas as pd
import logging
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_thesis_data(csv_path: str = "data/Sujet_EtudiantsB.csv") -> pd.DataFrame:
    """
    Charge le fichier CSV des sujets de mémoire
    Gère les cas particuliers (guillemets multilignes, retours à la ligne, etc.)
    
    Args:
        csv_path: Chemin vers le fichier CSV
        
    Returns:
        DataFrame nettoyé et prêt pour l'analyse
    """
    
    csv_path = Path(csv_path)
    
    if not csv_path.exists():
        logger.error(f"❌ Fichier non trouvé : {csv_path}")
        raise FileNotFoundError(f"Fichier CSV introuvable : {csv_path}")
    
    logger.info(f"📂 Chargement du fichier : {csv_path}")
    
    try:
        # Lecture robuste du CSV (car contient des guillemets multilignes)
        df = pd.read_csv(
            csv_path,
            sep=";",
            encoding="utf-8",
            engine="python",
            on_bad_lines="skip",
            quotechar='"'
        )
        
        logger.info(f"✅ CSV chargé : {len(df)} lignes, {len(df.columns)} colonnes")
        logger.info(f"Colonnes détectées : {list(df.columns)}")
        
        # Vérification des colonnes essentielles
        essential_columns = ["thesis_title", "description_sujet"]
        missing = [col for col in essential_columns if col not in df.columns]
        
        if missing:
            logger.warning(f"⚠️ Colonnes manquantes : {missing}")
            logger.warning("Utilisation des premières colonnes disponibles")
            # Utilise la première colonne comme titre si thesis_title manque
            if "thesis_title" not in df.columns and len(df.columns) > 0:
                df = df.rename(columns={df.columns[0]: "thesis_title"})
        
        # Nettoyage de base
        df = df.dropna(subset=["thesis_title"]).reset_index(drop=True)
        
        # Création d'un texte complet pour l'embedding
        df["full_text"] = df.apply(_create_full_text, axis=1)
        
        logger.info(f"🎯 {len(df)} sujets préparés pour l'analyse sémantique")
        return df
        
    except Exception as e:
        logger.error(f"❌ Erreur lors du chargement du CSV : {str(e)}")
        raise

def _create_full_text(row) -> str:
    """
    Crée un texte complet à partir des informations d'un sujet
    """
    parts = []
    
    # Titre
    if "thesis_title" in row and pd.notna(row["thesis_title"]):
        parts.append(f"Titre: {row['thesis_title']}")
    
    # Mots-clés
    if "thesis_keywords" in row and pd.notna(row["thesis_keywords"]):
        parts.append(f"Mots-clés: {row['thesis_keywords']}")
    
    # Problématique
    if "Problématique" in row and pd.notna(row["Problématique"]):
        parts.append(f"Problématique: {row['Problématique']}")
    
    # Description
    if "description_sujet" in row and pd.notna(row["description_sujet"]):
        parts.append(f"Description: {row['description_sujet']}")
    
    # Méthode
    if "Méthode" in row and pd.notna(row["Méthode"]):
        parts.append(f"Méthode: {row['Méthode']}")
    
    # Technologies
    if "technologies" in row and pd.notna(row["technologies"]):
        parts.append(f"Technologies: {row['technologies']}")
    
    return " | ".join(parts)

if __name__ == "__main__":
    # Test du chargement
    df = load_thesis_data()
    print(f"\n🔍 Aperçu des données :")
    print(df[["thesis_title", "student_faculty", "student_level"]].head())