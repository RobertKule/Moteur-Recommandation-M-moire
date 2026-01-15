// src/app/dashboard/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Target, 
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  TrendingUp,
  Award,
  Star,
  FileText,
  Users,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

// Types pour les données
interface UserProfile {
  id?: number
  user_id: number
  bio?: string
  location?: string
  university?: string
  field?: string
  level?: string
  interests?: string
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  created_at: string
  updated_at: string
}

interface UserSkill {
  id: number
  user_id: number
  name: string
  level: number
  category?: string
  created_at: string
}

interface UserStats {
  profile_completion: number
  explored_subjects: number
  recommendations_count: number
  active_days: number
  last_active: string
}

const levelOptions = [
  'Licence 1',
  'Licence 2', 
  'Licence 3',
  'Master 1',
  'Master 2',
  'Doctorat',
  'Post-doctorat'
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    university: '',
    field: '',
    level: '',
    interests: '',
    phone: '',
    website: '',
    linkedin: '',
    github: ''
  })

  // Charger les données du profil
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // 1. Récupérer le profil
      const userProfile = await api.getUserProfile(user.id)
      setProfile(userProfile)
      
      // Initialiser le formulaire avec les données du profil
      if (userProfile) {
        setFormData({
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          university: userProfile.university || '',
          field: userProfile.field || '',
          level: userProfile.level || '',
          interests: userProfile.interests || '',
          phone: userProfile.phone || '',
          website: userProfile.website || '',
          linkedin: userProfile.linkedin || '',
          github: userProfile.github || ''
        })
      }
      
      // 2. Récupérer les compétences
      try {
        const userSkills = await api.getUserSkills(user.id)
        setSkills(userSkills)
      } catch (skillError) {
        console.log('Skills not available yet')
      }
      
      // 3. Récupérer les statistiques
      try {
        const stats = await api.getUserStats(user.id)
        setUserStats(stats)
      } catch (statsError) {
        console.log('Stats not available yet')
      }
      
    } catch (err: any) {
      console.error('Error fetching user data:', err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Mettre à jour le profil via l'API
      const updatedProfile = await api.updateUserProfile(user.id, formData)
      setProfile(updatedProfile)
      setIsEditing(false)
      
      // Recharger les données
      await fetchUserData()
      
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Réinitialiser le formulaire avec les données originales
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        location: profile.location || '',
        university: profile.university || '',
        field: profile.field || '',
        level: profile.level || '',
        interests: profile.interests || '',
        phone: profile.phone || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        github: profile.github || ''
      })
    }
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculer la progression du profil
  const calculateProfileCompletion = () => {
    if (!profile) return 0
    
    const fields = [
      profile.bio,
      profile.location,
      profile.university,
      profile.field,
      profile.level,
      profile.interests
    ]
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{error}</p>
        <button
          onClick={fetchUserData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    )
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez vos informations personnelles et académiques
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Enregistrer
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Profil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte profil */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center relative">
                  <div className="text-center">
                    <User className="w-16 h-16 text-white mx-auto" />
                    <div className="mt-2 text-white text-sm font-medium">
                      {user?.full_name.split(' ')[0]}
                    </div>
                  </div>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                        placeholder="Décrivez-vous en quelques mots..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500"
                        placeholder="Votre ville, pays"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {user?.full_name || 'Utilisateur'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {profile?.bio || 'Aucune biographie fournie. Cliquez sur "Modifier" pour ajouter une description.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</span>
                      </div>
                      {profile?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileCompletion}%
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Profil complété</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats?.explored_subjects || 0}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sujets explorés</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats?.recommendations_count || 0}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Recommandations</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats?.active_days || 0}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Jours actifs</div>
              </div>
            </div>
          </div>

          {/* Informations académiques */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informations académiques</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Université
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => handleChange('university', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Votre université"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 dark:text-white">
                      {profile?.university || 'Non spécifiée'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domaine d'études
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.field}
                    onChange={(e) => handleChange('field', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Votre domaine d'études"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900 dark:text-white">
                      {profile?.field || 'Non spécifié'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau académique
                </label>
                {isEditing ? (
                  <select
                    value={formData.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionnez un niveau</option>
                    {levelOptions.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-900 dark:text-white">
                      {profile?.level || 'Non spécifié'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Centres d'intérêt
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => handleChange('interests', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Séparés par des virgules"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {profile?.interests ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.split(',').map((interest, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full"
                          >
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Aucun intérêt spécifié</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations de contact (seulement en édition) */}
          {isEditing && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informations de contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="https://votresite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="https://linkedin.com/in/votrenom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleChange('github', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="https://github.com/votrenom"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Compétences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compétences</h3>
              {isEditing && (
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  + Ajouter une compétence
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        {skill.name} {skill.category && `(${skill.category})`}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune compétence ajoutée. Ajoutez vos compétences pour améliorer vos recommandations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Progression */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Progression du profil</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { 
                  label: 'Informations personnelles', 
                  progress: (profile?.bio && profile?.location) ? 100 : 
                           (profile?.bio || profile?.location) ? 50 : 0 
                },
                { 
                  label: 'Profil académique', 
                  progress: (profile?.university && profile?.field && profile?.level) ? 100 :
                           (profile?.university || profile?.field || profile?.level) ? 33 : 0 
                },
                { 
                  label: 'Centres d\'intérêt', 
                  progress: profile?.interests ? 100 : 0 
                },
                { 
                  label: 'Compétences', 
                  progress: skills.length > 0 ? Math.min(100, skills.length * 20) : 0 
                },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5" />
              <h3 className="font-semibold">Conseils pour votre profil</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Ajoutez une bio pour personnaliser votre profil</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Précisez vos compétences pour de meilleures recommandations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Ajoutez vos centres d'intérêt académiques</span>
              </li>
            </ul>
          </div>

          {/* Statistiques avancées */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Votre activité</h3>
            <div className="space-y-4">
              {userStats && (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dernière activité</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(userStats.last_active).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Membre depuis</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user?.created_at || new Date()).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}