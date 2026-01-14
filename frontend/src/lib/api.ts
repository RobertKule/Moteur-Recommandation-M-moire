// src/lib/api.ts - VERSION COMPLÈTE ET CORRIGÉE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // IMPORTANT: Les routes FastAPI commencent par /api/v1
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔄 API Request:', {
      url,
      endpoint,
      method: options.method || 'GET'
    });

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ API Error Details:', errorData);
        } catch {
          const errorText = await response.text();
          errorData = { detail: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        throw new Error(
          typeof errorData === 'object' 
            ? (errorData.detail || errorData.message || JSON.stringify(errorData))
            : errorData
        );
      }

      // Si la réponse est vide (ex: DELETE), retourner true
      if (response.status === 204) {
        return true as T;
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('🔥 API Request failed:', error);
      throw error;
    }
  }

  // ========== AUTH ==========
  async login(email: string, password: string) {
    // CORRECTION: Utiliser login-json avec email/password en JSON
    return this.request<{ access_token: string; token_type: string }>('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ email, password }), // email, pas username
    });
  }

  async register(data: {
    email: string;
    full_name: string;
    password: string;
    role: 'admin' | 'enseignant' | 'etudiant';
  }) {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, new_password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
  }

  // ========== SUJETS ==========
  async getSujets(params?: {
    search?: string;
    domaine?: string;
    faculté?: string;
    niveau?: string;
    skip?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(
      params ? Object.entries(params).filter(([_, v]) => v !== undefined) : []
    ).toString();
    return this.request<Sujet[]>(`/sujets?${query}`);
  }

  async getSujet(id: number) {
    return this.request<Sujet>(`/sujets/${id}`);
  }

  async recommendSujets(data: {
    interests: string[];
    niveau?: string;
    faculté?: string;
    domaine?: string;
    difficulté?: string;
    limit?: number;
  }) {
    return this.request<RecommendedSujet[]>('/sujets/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== IA ==========
  async askAI(question: string, context?: string) {
    return this.request<AIResponse>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  }

  async generateSubjects(data: {
    interests: string[];
    domaine?: string;
    niveau?: string;
    faculté?: string;
    count?: number;
  }) {
    return this.request<GeneratedSubject[]>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeSubject(data: {
    titre: string;
    description: string;
    domaine?: string;
    niveau?: string;
    faculté?: string;
    problématique?: string;
    keywords?: string;
    context?: string;
  }) {
    return this.request<AIAnalysisResponse>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAcceptanceCriteria() {
    return this.request<AcceptanceCriteria>('/ai/criteria');
  }

  async getTips() {
    return this.request<{
      choix_sujet: string[];
      methodologie: string[];
      redaction: string[];
      soutenance: string[];
    }>('/ai/tips');
  }

  // ========== PREFERENCES ==========
  async getPreferences() {
    return this.request<UserPreference>('/users/me/preferences');
  }

  async updatePreferences(data: Partial<UserPreference>) {
    return this.request<UserPreference>('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== FEEDBACK ==========
  async submitFeedback(data: {
    sujet_id: number;
    rating?: number;
    pertinence?: number;
    commentaire?: string;
    intéressé?: boolean;
    sélectionné?: boolean;
  }) {
    return this.request<Feedback>('/sujets/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== STATS ==========
  async getPopularSujets(limit: number = 10) {
    return this.request<Sujet[]>(`/sujets/stats/popular?limit=${limit}`);
  }

  async getPopularKeywords(limit: number = 20) {
    return this.request<{ keyword: string; count: number }[]>(
      `/sujets/stats/keywords?limit=${limit}`
    );
  }

  async getDomainsStats() {
    return this.request<{ domaine: string; count: number; avg_views: number }[]>(
      '/sujets/stats/domains'
    );
  }

  // ========== UTILITAIRES ==========
  async healthCheck() {
    return this.request<{ status: string; service: string }>('/health');
  }

  async getConfig() {
    return this.request<{
      database_url: string;
      gemini_api_key: string;
      environment: string;
    }>('/config');
  }
}

export const api = new ApiService();

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'enseignant' | 'etudiant';
  is_active: boolean;
  created_at: string;
}

export interface Sujet {
  id: number;
  titre: string;
  keywords: string;
  domaine: string;
  faculté: string;
  niveau: string;
  problématique: string;
  méthodologie?: string;
  technologies?: string;
  description: string;
  difficulté: 'facile' | 'moyenne' | 'difficile';
  durée_estimée?: string;
  ressources?: string;
  vue_count: number;
  like_count: number;
  is_active: boolean;
  created_at: string;
}

export interface RecommendedSujet {
  sujet: Sujet;
  score: number;
  raisons: string[];
  critères_respectés: string[];
}

export interface AIResponse {
  question: string;
  réponse: string;
  suggestions: string[];
}

export interface GeneratedSubject {
  titre: string;
  problématique: string;
  keywords: string;
  description: string;
  methodologie: string;
  difficulté: string;
  durée_estimée: string;
}

export interface AIAnalysisResponse {
  pertinence: number;
  points_forts: string[];
  points_faibles: string[];
  suggestions: string[];
  recommandations: string[];
}

export interface AcceptanceCriteria {
  critères_acceptation: string[];
  critères_rejet: string[];
  conseils_pratiques: string[];
}

export interface UserPreference {
  id: number;
  user_id: number;
  interests?: string;
  faculty?: string;
  level?: string;
  created_at: string;
  updated_at?: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  sujet_id: number;
  rating?: number;
  pertinence?: number;
  commentaire?: string;
  intéressé: boolean;
  sélectionné: boolean;
  created_at: string;
}

// Types pour les réponses API supplémentaires
export interface StatsDomains {
  domaine: string;
  count: number;
  avg_views: number;
}

export interface PopularKeyword {
  keyword: string;
  count: number;
}

export interface HealthCheck {
  status: string;
  service: string;
}

export interface Config {
  database_url: string;
  gemini_api_key: string;
  environment: string;
}