// src/lib/api.ts - VERSION COMPLÈTE CORRIGÉE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ========== TYPES DÉFINIS EN PREMIER ==========

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'enseignant' | 'etudiant';
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id?: number;
  user_id: number;
  bio?: string;
  location?: string;
  university?: string;
  field?: string;
  level?: string;
  interests?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  name: string;
  level: number;
  category?: string;
  created_at: string;
}

export interface UserStats {
  profile_completion: number;
  explored_subjects: number;
  recommendations_count: number;
  active_days: number;
  last_active: string;
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

// ========== CLASSE API SERVICE ==========
class ApiService {
private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🔄 API Request:', {
    url,
    endpoint,
    method: options.method || 'GET'
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Récupérer le token depuis localStorage seulement côté client
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
    console.log('Token available:', !!token);
  }

  if (token && !endpoint.includes('/auth/login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    console.log('📡 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // Si erreur 401, ne pas lancer d'exception immédiatement
    // On va laisser la logique de gestion à l'appelant
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      console.log('Unauthorized, removing token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
      
      // Retourner une réponse d'erreur structurée au lieu de lancer une exception
      const errorData = await response.json().catch(() => ({ 
        detail: 'Session expirée. Veuillez vous reconnecter.' 
      }));
      
      throw {
        status: 401,
        message: errorData.detail || 'Session expirée. Veuillez vous reconnecter.',
        isUnauthorized: true
      };
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ API Error Details:', errorData);
      } catch {
        const errorText = await response.text();
        errorData = { detail: errorText || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = typeof errorData === 'object' 
        ? (errorData.detail || errorData.message || JSON.stringify(errorData))
        : errorData;
      
      if (endpoint.includes('/auth/login')) {
        throw new Error(errorMessage || 'Email ou mot de passe incorrect');
      }
      
      throw new Error(errorMessage || `Erreur HTTP ${response.status}`);
    }

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
    return this.request<{ access_token: string; token_type: string }>('/auth/login-json', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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

    // Ajoutez "?" seulement si des paramètres existent
    const endpoint = query ? `/sujets?${query}` : '/sujets';

    return this.request<Sujet[]>(endpoint); // Maintenant c'est un GET
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

  
async saveChosenSubject(data: {
  titre: string;
  description: string;
  keywords: string;
  domaine: string;
  niveau: string;
  faculté: string;
  problématique: string;
  méthodologie: string;
  difficulté: string;
  durée_estimée: string;
  interests?: string[];
}): Promise<any> {
  // Normaliser la difficulté avant envoi
  const normalizedData = {
    ...data,
    difficulté: data.difficulté.toLowerCase(),
    keywords: data.keywords || '',
    méthodologie: data.méthodologie || '',
    durée_estimée: data.durée_estimée || '6 mois'
  };
  
  return this.request('/ai/save-chosen-subject', {
    method: 'POST',
    body: JSON.stringify(normalizedData),
  });
}

async generateThreeSubjects(data: {
  interests: string[];
  domaine?: string;
  niveau?: string;
  faculté?: string;
}): Promise<{ subjects: any[]; session_id: string }> {
  return this.request<{ subjects: any[]; session_id: string }>('/ai/generate-three', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

  async generateSubjects(data: {
    interests: string[];
    domaine?: string;
    niveau?: string;
    faculté?: string;
    count?: number;
  }): Promise<GeneratedSubject[]> {
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

// ========== IA PUBLIQUE (sans authentification) ==========
async askAIPublic(question: string, context?: string): Promise<AIResponse> {
  return this.request<AIResponse>('/ai/ask-public', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  });
}

async analyzeSubjectPublic(data: {
  titre: string;
  description: string;
  domaine?: string;
  niveau?: string;
  faculté?: string;
  problématique?: string;
  keywords?: string;
  context?: string;
}): Promise<AIAnalysisResponse> {
  return this.request<AIAnalysisResponse>('/ai/analyze-public', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
  // ========== USERS ==========
  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      return await this.request<UserProfile>(`/users/${userId}/profile`);
    } catch (error) {
      console.log('Using mock profile data');
      // Données mock temporaires
      return {
        user_id: userId,
        bio: '',
        location: '',
        university: '',
        field: '',
        level: '',
        interests: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    try {
      return await this.request<UserSkill[]>(`/users/${userId}/skills`);
    } catch (error) {
      console.log('Using mock skills data');
      return [];
    }
  }

  async getUserStats(userId: number): Promise<UserStats> {
    try {
      return await this.request<UserStats>(`/users/${userId}/stats`);
    } catch (error) {
      console.log('Using mock stats data');
      return {
        profile_completion: 0,
        explored_subjects: 0,
        recommendations_count: 0,
        active_days: 0,
        last_active: new Date().toISOString()
      };
    }
  }

  async updateUserProfile(userId: number, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await this.request<UserProfile>(`/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log('Mock update profile');
      // Simulation de mise à jour
      return {
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }
  }

  async updateUserSkills(userId: number, skills: Array<{ name: string; level: number; category?: string }>): Promise<UserSkill[]> {
    return this.request<UserSkill[]>(`/users/${userId}/skills`, {
      method: 'PUT',
      body: JSON.stringify(skills),
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
    return this.request<PopularKeyword[]>(
      `/sujets/stats/keywords?limit=${limit}`
    );
  }

  async getDomainsStats() {
    return this.request<StatsDomains[]>(
      '/sujets/stats/domains'
    );
  }

  // Settings
  async getSettings(): Promise<any> {
    return this.request('/settings');
  }

  // Dans votre fichier api.ts - Assurez-vous que ces méthodes existent
  async getPreferences(): Promise<any> {
    try {
      return await this.request('/settings/preferences');
    } catch (error) {
      console.log('Using default preferences');
      return {
        theme: 'system',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          newsletter: false,
          recommendations: true
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showActivity: true
        }
      };
    }
  }

  async updatePreferences(preferences: any): Promise<any> {
    return this.request('/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return this.request('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      }),
    });
  }

  // ========== UTILITAIRES ==========
  async healthCheck() {
    return this.request<HealthCheck>('/health');
  }

  async getConfig() {
    return this.request<Config>('/config');
  }
}

// ========== EXPORT ==========
export const api = new ApiService();

// Fonction utilitaire pour tester la connexion
export async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    const health = await fetch(`${API_BASE_URL}/health`);
    console.log('Backend health:', await health.json());
    return true;
  } catch (error) {
    console.error('Backend not reachable:', error);
    return false;
  }
}
