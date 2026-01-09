# embeddings.py - VERSION CORRIGÉE
"""
Gestion des embeddings sémantiques et de la base vectorielle ChromaDB
"""

import logging
import chromadb
from pathlib import Path
from typing import List, Tuple
import os
import shutil

# ✅ DÉFINIR LE LOGGER AU DÉBUT
logger = logging.getLogger(__name__)

# Import pour Chroma - utilise la nouvelle version
try:
    from langchain_chroma import Chroma
    chroma_source = "langchain_chroma"
except ImportError:
    try:
        from langchain_community.vectorstores import Chroma
        chroma_source = "langchain_community"
    except ImportError as e:
        logger.error(f"❌ Impossible d'importer Chroma: {e}")
        raise

# Import pour HuggingFace embeddings
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    hf_source = "langchain_huggingface"
except ImportError:
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        hf_source = "langchain_community"
    except ImportError:
        raise ImportError("Installez langchain-huggingface ou langchain-community: pip install langchain-huggingface")

logger.info(f"✅ Import Chroma depuis: {chroma_source}")
logger.info(f"✅ Import HuggingFace depuis: {hf_source}")

class VectorStoreManager:
    """
    Gère la création et l'accès à la base vectorielle des sujets
    """
    
    def __init__(self, persist_directory: str = "chroma_db"):
        self.persist_directory = Path(persist_directory)
        self.embeddings = None
        self.vectorstore = None
        self._initialize_embeddings()
    
    def _initialize_embeddings(self):
        """Initialise le modèle d'embeddings local (Sentence Transformers)"""
        try:
            logger.info("🤖 Initialisation des embeddings locaux (Sentence Transformers)...")
            
            # Configuration du modèle HuggingFace
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'},  # Change en 'cuda' si tu as un GPU
                encode_kwargs={
                    'normalize_embeddings': True,
                    'batch_size': 32
                }
            )
            
            logger.info("✅ Embeddings locaux initialisés")
            logger.info(f"📌 Modèle: all-MiniLM-L6-v2")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'initialisation des embeddings: {str(e)}")
            raise
    
    def ensure_vectorstore(self, texts: List[str], metadatas: List[dict] = None) -> bool:
        """
        S'assure qu'une base vectorielle existe, la crée si nécessaire
        """
        try:
            # Vérifier si une base valide existe déjà
            if self._has_valid_chroma_db():
                logger.info(f"📂 Chargement du vectorstore existant...")
                self.vectorstore = Chroma(
                    persist_directory=str(self.persist_directory),
                    embedding_function=self.embeddings,
                    collection_name="thesis_subjects"
                )
                
                # Vérifier le contenu
                try:
                    count = self.vectorstore._collection.count()
                    logger.info(f"✅ Vectorstore chargé: {count} sujets indexés")
                    
                    if count > 0:
                        return True
                    else:
                        logger.warning("⚠️  Base vide détectée, recréation...")
                except:
                    logger.warning("⚠️  Base corrompue, recréation...")
            
            # Créer une nouvelle base (soit pas de base, soit base vide/corrompue)
            logger.info(f"🧠 Création d'un nouveau vectorstore avec {len(texts)} sujets...")
            
            # S'assurer que le dossier existe
            self.persist_directory.mkdir(parents=True, exist_ok=True)
            
                        # Créer la base vectorielle - la persistance est souvent automatique
            self.vectorstore = Chroma.from_texts(
                texts=texts,
                embedding=self.embeddings,
                metadatas=metadatas,
                persist_directory=str(self.persist_directory),
                collection_name="thesis_subjects"
            )
            
            # AVEC les nouvelles versions, NE PAS appeler .persist() explicitement
            # La base est automatiquement sauvegardée dans `persist_directory`
            
            # Donner un peu de temps pour l'écriture sur disque (optionnel mais recommandé)
            import time
            time.sleep(2)  # Augmenté à 2 secondes pour être sûr
            
            # Vérifier que la création a fonctionné en accédant à la collection
            # Cela force également l'initialisation si nécessaire
            try:
                _ = self.vectorstore._collection
            except:
                pass  # Ignorer les erreurs d'accès, l'important est que l'objet existe
            
            # Vérifier la création
            count = self.vectorstore._collection.count()
            logger.info(f"✅ Nouveau vectorstore créé: {count} sujets indexés")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur critique avec le vectorstore: {str(e)}")
            
            # Tentative de nettoyage et recréation
            try:
                self._force_recreate(texts, metadatas)
                return True
            except:
                return False
    
    def _has_valid_chroma_db(self) -> bool:
        """Vérifie si une base Chroma valide existe"""
        if not self.persist_directory.exists():
            return False
        
        # Vérifier les fichiers Chroma essentiels
        required_files = ["chroma.sqlite3", "chroma.sqlite3-wal"]
        chroma_files_exist = False
        
        for file in required_files:
            if (self.persist_directory / file).exists():
                chroma_files_exist = True
                break
        
        if not chroma_files_exist:
            logger.debug(f"ℹ️  Dossier {self.persist_directory} existe mais sans fichiers Chroma")
            return False
        
        return True
    
    def _force_recreate(self, texts: List[str], metadatas: List[dict]):
        """Force la recréation complète de la base"""
        logger.warning("🔄 Forcer la recréation de la base vectorielle...")
        
        # Supprimer le dossier existant
        if self.persist_directory.exists():
            shutil.rmtree(self.persist_directory)
        
        # Recréer le dossier
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        # Créer une nouvelle base
        self.vectorstore = Chroma.from_texts(
            texts=texts,
            embedding=self.embeddings,
            metadatas=metadatas,
            persist_directory=str(self.persist_directory),
            collection_name="thesis_subjects"
        )
        
        # self.vectorstore.persist()
        logger.info(f"🔄 Base recréée avec {len(texts)} sujets")
                
    def search_similar(self, query: str, k: int = 10, filters: dict = None):
        """
        Recherche améliorée avec fallback si pas de résultats
        """
        # Essai 1: Avec filtres
        results = self.vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=filters
        )
        
        # Si pas de résultats avec filtres, essayer sans filtres
        if not results and filters:
            logger.info("   Aucun résultat avec filtres, recherche sans filtres...")
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=k,
                filter=None
            )
        
        # Si toujours pas de résultats, élargir la recherche
        if not results:
            logger.info("   Recherche élargie avec requête plus générale...")
            # Simplifier la requête
            simple_query = " ".join(query.split()[:5])  # Premiers 5 mots
            results = self.vectorstore.similarity_search_with_score(
                query=simple_query,
                k=k,
                filter=None
            )
                
        if not self.vectorstore:
            logger.error("❌ Vectorstore non initialisé")
            return []
        
        try:
            logger.debug(f"🔍 Recherche pour: '{query[:50]}...'")
            
            # Recherche par similarité
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=k,
                filter=filters
            )
            
            # Formatage des résultats
            formatted_results = []
            for doc, score in results:
                result = {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": float(score)
                }
                formatted_results.append(result)
            
            logger.info(f"📊 {len(formatted_results)} résultats trouvés")
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la recherche: {str(e)}")
            return []

    def _understand_intent(self, user_input: str, conversation_history: list) -> dict:
        """
        Comprend l'intention de l'utilisateur
        """
        intent = {
            "type": "new_query",  # Par défaut
            "referenced_topic": None,
            "action": "generate"
        }
        
        input_lower = user_input.lower()
        
        # Détection des références
        if any(word in input_lower for word in ["sujet 1", "premier sujet", "le sujet 1"]):
            intent["type"] = "reference"
            intent["referenced_topic"] = 1
            intent["action"] = "elaborate"
        
        elif any(word in input_lower for word in ["développer", "élaborer", "exploiter", "approfondir"]):
            intent["type"] = "elaboration"
            intent["action"] = "elaborate"
        
        elif any(word in input_lower for word in ["autre", "différent", "nouveau"]):
            intent["type"] = "variation"
            intent["action"] = "generate_variation"
        
        return intent
    
    def get_vectorstore_info(self) -> dict:
        """Retourne des informations sur le vectorstore"""
        if not self.vectorstore:
            return {"status": "non_initialise"}
        
        try:
            count = self.vectorstore._collection.count()
            return {
                "status": "initialise",
                "documents_count": count,
                "persist_directory": str(self.persist_directory)
            }
        except Exception as e:
            logger.error(f"❌ Erreur lors de la récupération des infos: {str(e)}")
            return {"status": "erreur", "error": str(e)}