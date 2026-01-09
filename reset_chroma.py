# reset_chroma.py
"""
Script pour réinitialiser complètement la base Chroma
"""
import shutil
import os

def reset_chroma_db():
    """Supprime complètement le dossier chroma_db et recrée une base vide"""
    
    chroma_dir = "chroma_db"
    
    if os.path.exists(chroma_dir):
        print(f"🗑️  Suppression du dossier {chroma_dir}...")
        try:
            shutil.rmtree(chroma_dir)
            print(f"✅ Dossier {chroma_dir} supprimé avec succès")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression: {e}")
            return False
    else:
        print(f"ℹ️  Le dossier {chroma_dir} n'existe pas")
    
    # Créer un dossier vide
    os.makedirs(chroma_dir, exist_ok=True)
    print(f"📁 Dossier {chroma_dir} créé")
    
    return True

if __name__ == "__main__":
    print("🔄 Réinitialisation de la base Chroma...")
    if reset_chroma_db():
        print("\n✅ Réinitialisation terminée !")
        print("\nMaintenant, relancez app_console.py pour créer une nouvelle base avec vos 1344 sujets.")
    else:
        print("\n❌ Échec de la réinitialisation")