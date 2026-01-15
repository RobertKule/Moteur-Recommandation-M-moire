(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "testBackendConnection",
    ()=>testBackendConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// src/lib/api.ts - VERSION COMPLÈTE CORRIGÉE
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8000/api/v1") || 'http://localhost:8000';
// ========== CLASSE API SERVICE ==========
class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('🔄 API Request:', {
            url,
            endpoint,
            method: options.method || 'GET'
        });
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        // Récupérer le token depuis localStorage seulement côté client
        let token = null;
        if ("TURBOPACK compile-time truthy", 1) {
            token = localStorage.getItem('access_token');
            console.log('Token available:', !!token);
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
            });
            console.log('📡 API Response:', {
                url,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            // Si erreur 401, nettoyer le token
            if (response.status === 401) {
                console.log('Unauthorized, removing token');
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.removeItem('access_token');
                }
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                    console.error('❌ API Error Details:', errorData);
                } catch  {
                    const errorText = await response.text();
                    errorData = {
                        detail: errorText || `HTTP ${response.status}: ${response.statusText}`
                    };
                }
                const errorMessage = typeof errorData === 'object' ? errorData.detail || errorData.message || JSON.stringify(errorData) : errorData;
                throw new Error(errorMessage);
            }
            // Si la réponse est vide (ex: DELETE), retourner true
            if (response.status === 204) {
                return true;
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
    async login(email, password) {
        return this.request('/auth/login-json', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });
    }
    async register(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getCurrentUser() {
        return this.request('/auth/me');
    }
    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({
                email
            })
        });
    }
    async resetPassword(token, new_password) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
                token,
                new_password
            })
        });
    }
    // ========== SUJETS ==========
    async getSujets(params) {
        const query = new URLSearchParams(params ? Object.entries(params).filter(([_, v])=>v !== undefined) : []).toString();
        return this.request(`/sujets?${query}`);
    }
    async getSujet(id) {
        return this.request(`/sujets/${id}`);
    }
    async recommendSujets(data) {
        return this.request('/sujets/recommend', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    // ========== IA ==========
    async askAI(question, context) {
        return this.request('/ai/ask', {
            method: 'POST',
            body: JSON.stringify({
                question,
                context
            })
        });
    }
    async generateSubjects(data) {
        return this.request('/ai/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async analyzeSubject(data) {
        return this.request('/ai/analyze', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getAcceptanceCriteria() {
        return this.request('/ai/criteria');
    }
    async getTips() {
        return this.request('/ai/tips');
    }
    // ========== PREFERENCES ==========
    async getPreferences() {
        return this.request('/users/me/preferences');
    }
    async updatePreferences(data) {
        return this.request('/users/me/preferences', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    // ========== USERS ==========
    async getUserProfile(userId) {
        try {
            return await this.request(`/users/${userId}/profile`);
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
    async getUserSkills(userId) {
        try {
            return await this.request(`/users/${userId}/skills`);
        } catch (error) {
            console.log('Using mock skills data');
            return [];
        }
    }
    async getUserStats(userId) {
        try {
            return await this.request(`/users/${userId}/stats`);
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
    async updateUserProfile(userId, data) {
        try {
            return await this.request(`/users/${userId}/profile`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.log('Mock update profile');
            // Simulation de mise à jour
            return {
                user_id: userId,
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
    }
    async updateUserSkills(userId, skills) {
        return this.request(`/users/${userId}/skills`, {
            method: 'PUT',
            body: JSON.stringify({
                skills
            })
        });
    }
    // ========== FEEDBACK ==========
    async submitFeedback(data) {
        return this.request('/sujets/feedback', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    // ========== STATS ==========
    async getPopularSujets(limit = 10) {
        return this.request(`/sujets/stats/popular?limit=${limit}`);
    }
    async getPopularKeywords(limit = 20) {
        return this.request(`/sujets/stats/keywords?limit=${limit}`);
    }
    async getDomainsStats() {
        return this.request('/sujets/stats/domains');
    }
    // ========== UTILITAIRES ==========
    async healthCheck() {
        return this.request('/health');
    }
    async getConfig() {
        return this.request('/config');
    }
}
const api = new ApiService();
async function testBackendConnection() {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
// src/contexts/AuthContext.tsx
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    /**
   * 🔐 Initialisation de l'auth (1 seule fois)
   */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            let mounted = true;
            const initAuth = {
                "AuthProvider.useEffect.initAuth": async ()=>{
                    try {
                        const token = localStorage.getItem('access_token');
                        if (!token) {
                            if (mounted) {
                                setUser(null);
                                setIsLoading(false); // 👈 MANQUAIT ICI
                            }
                            return;
                        }
                        const userData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getCurrentUser();
                        if (mounted) setUser(userData);
                    } catch (error) {
                        localStorage.removeItem('access_token');
                        if (mounted) setUser(null);
                    } finally{
                        if (mounted) setIsLoading(false);
                    }
                }
            }["AuthProvider.useEffect.initAuth"];
            initAuth();
            return ({
                "AuthProvider.useEffect": ()=>{
                    mounted = false;
                }
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    /**
   * 🔑 LOGIN
   */ const login = async (email, password)=>{
        setIsLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].login(email, password);
            if (!response?.access_token) {
                throw new Error('No access token received');
            }
            localStorage.setItem('access_token', response.access_token);
            const userData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getCurrentUser();
            setUser(userData);
            return userData;
        } catch (error) {
            localStorage.removeItem('access_token');
            setUser(null);
            throw new Error(error.message || 'Échec de la connexion');
        } finally{
            setIsLoading(false);
        }
    };
    /**
   * 📝 REGISTER
   */ const register = async (data)=>{
        setIsLoading(true);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].register(data);
            const loginResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].login(data.email, data.password);
            if (!loginResponse?.access_token) {
                throw new Error('No access token after registration');
            }
            localStorage.setItem('access_token', loginResponse.access_token);
            const userData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getCurrentUser();
            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.message || 'Échec de l’inscription');
        } finally{
            setIsLoading(false);
        }
    };
    /**
   * 🚪 LOGOUT
   */ const logout = ()=>{
        localStorage.removeItem('access_token');
        setUser(null);
    };
    /**
   * 🔄 UPDATE USER
   */ const updateUser = (updatedUser)=>{
        setUser(updatedUser);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            register,
            logout,
            updateUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)"); // CHANGÉ ICI
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// src/components/providers.tsx
'use client';
;
;
;
;
function Providers({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1
                    }
                }
            })
    }["Providers.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: [
                "  ",
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                    position: "top-right",
                    toastOptions: {
                        duration: 4000,
                        style: {
                            background: '#fff',
                            color: '#374151',
                            border: '1px solid #e5e7eb'
                        }
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/providers.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/providers.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/providers.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_s(Providers, "qWUK1JbLJ+XRDCc4mQFRfeVIBp0=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_a8d078d3._.js.map