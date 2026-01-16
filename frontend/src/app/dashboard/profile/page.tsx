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
  Loader2,
  Plus,
  Trash2,
  Briefcase,
  Globe,
  Linkedin,
  Github,
  Phone
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api, UserProfile as UserProfileType, UserSkill as UserSkillType, UserStats as UserStatsType } from '@/lib/api'

interface SkillFormData {
  name: string
  level: number
  category: string
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
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [skills, setSkills] = useState<UserSkillType[]>([])
  const [userStats, setUserStats] = useState<UserStatsType | null>(null)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState<SkillFormData>({
    name: '',
    level: 5,
    category: ''
  })
  
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
      const userSkills = await api.getUserSkills(user.id)
      setSkills(userSkills)
      
      // 3. Récupérer les statistiques
      const stats = await api.getUserStats(user.id)
      setUserStats(stats)
      
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
    setIsAddingSkill(false)
    setNewSkill({ name: '', level: 5, category: '' })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = async () => {
    if (!user?.id || !newSkill.name.trim()) return
    
    try {
      setLoading(true)
      
      // Ajouter la nouvelle compétence
      const newSkillData = {
        name: newSkill.name,
        level: newSkill.level,
        category: newSkill.category
      }
      
      // Créer la compétence via l'API
      await api.updateUserSkills(user.id, [...skills, newSkillData])
      
      // Recharger les compétences
      const updatedSkills = await api.getUserSkills(user.id)
      setSkills(updatedSkills)
      
      setIsAddingSkill(false)
      setNewSkill({ name: '', level: 5, category: '' })
      
    } catch (err: any) {
      console.error('Error adding skill:', err)
      setError(err.message || 'Erreur lors de l\'ajout de la compétence')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Filtrer la compétence à supprimer
      const updatedSkills = skills.filter(skill => skill.id !== skillId)
      
      // Mettre à jour via l'API
      await api.updateUserSkills(user.id, updatedSkills)
      
      // Mettre à jour l'état local
      setSkills(updatedSkills)
      
    } catch (err: any) {
      console.error('Error removing skill:', err)
      setError(err.message || 'Erreur lors de la suppression de la compétence')
    } finally {
      setLoading(false)
    }
  }

  const handleSkillChange = (field: keyof SkillFormData, value: string | number) => {
    setNewSkill(prev => ({
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
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
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center relative">
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
                  <Calendar className="w-5 h-5 text-blue-600" />
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
                    <Award className="w-5 h-5 text-blue-600" />
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

          {/* Informations de contact */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Informations de contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
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
                      <Globe className="w-4 h-4 inline mr-2" />
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
                      <Linkedin className="w-4 h-4 inline mr-2" />
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
                      <Github className="w-4 h-4 inline mr-2" />
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
                </>
              ) : (
                <>
                  {profile?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900 dark:text-white">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile?.linkedin && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {profile?.github && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Github className="w-5 h-5 text-blue-600" />
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        GitHub
                      </a>
                    </div>
                  )}
                  {!profile?.phone && !profile?.website && !profile?.linkedin && !profile?.github && (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        Aucune information de contact ajoutée. Ajoutez-les en mode édition.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Compétences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compétences</h3>
              {isEditing && !isAddingSkill && (
                <button 
                  onClick={() => setIsAddingSkill(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une compétence
                </button>
              )}
            </div>
            
            {isAddingSkill && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compétence
                    </label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => handleSkillChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Python, JavaScript, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Niveau (1-10)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newSkill.level}
                        onChange={(e) => handleSkillChange('level', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">{newSkill.level}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      value={newSkill.category}
                      onChange={(e) => handleSkillChange('category', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Programmation, Design, etc."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSkill}
                    disabled={!newSkill.name.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setIsAddingSkill(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700 dark:text-gray-300">
                          {skill.name} {skill.category && `(${skill.category})`}
                        </span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {skill.level}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Aucune compétence ajoutée. Ajoutez vos compétences pour améliorer vos recommandations.
                  </p>
                  {isEditing && (
                    <button 
                      onClick={() => setIsAddingSkill(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ajouter votre première compétence
                    </button>
                  )}
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
                { 
                  label: 'Contact', 
                  progress: (profile?.phone || profile?.website || profile?.linkedin || profile?.github) ? 100 : 0 
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
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Complétez vos informations académiques</span>
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Taux d'exploration</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userStats.explored_subjects} sujets
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Statut</h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                profileCompletion >= 80 ? 'bg-green-500' :
                profileCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {profileCompletion >= 80 ? 'Profil complet' :
                   profileCompletion >= 50 ? 'Profil en cours' : 'Profil à compléter'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {profileCompletion >= 80 ? 'Excellent ! Votre profil est complet.' :
                   profileCompletion >= 50 ? 'Continuez à compléter votre profil.' :
                   'Ajoutez plus d\'informations pour de meilleures recommandations.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}