# conversation.py
"""
Gestion de la conversation et de l'historique
"""

import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class ConversationManager:
    """
    Gère l'historique et le contexte de conversation
    """
    
    def __init__(self, max_history: int = 5):
        self.history = []
        self.max_history = max_history
        self.current_topic = None
        self.previous_recommendations = []
    
    def add_message(self, role: str, content: str, metadata: dict = None):
        """Ajoute un message à l'historique"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.history.append(message)
        
        # Limiter la taille
        if len(self.history) > self.max_history:
            self.history = self.history[-self.max_history:]
        
        logger.debug(f"💬 Message ajouté: {role}: {content[:50]}...")
    
    def get_context_summary(self) -> str:
        """Résumé du contexte pour le LLM"""
        if not self.history:
            return "Première interaction avec l'utilisateur."
        
        summary = "Historique récent de la conversation:\n"
        
        for i, msg in enumerate(self.history[-3:], 1):  # 3 derniers messages
            summary += f"{i}. {msg['role']}: {msg['content'][:100]}...\n"
        
        if self.current_topic:
            summary += f"\nThème en cours: {self.current_topic}"
        
        return summary
    
    def update_topic(self, topic: str):
        """Met à jour le thème en cours"""
        self.current_topic = topic
        logger.info(f"📌 Thème mis à jour: {topic}")
    
    def store_recommendations(self, recommendations: List[Dict]):
        """Stocke les recommandations pour référence future"""
        self.previous_recommendations = recommendations[:3]  # Garde les 3 premières
        logger.info(f"💾 {len(recommendations)} recommandations stockées")
    
    def get_previous_recommendation(self, index: int = 1) -> Dict:
        """Récupère une recommandation précédente"""
        if 0 <= index-1 < len(self.previous_recommendations):
            return self.previous_recommendations[index-1]
        return None
    
    def clear(self):
        """Efface l'historique"""
        self.history = []
        self.current_topic = None
        self.previous_recommendations = []
        logger.info("🗑️  Historique effacé")