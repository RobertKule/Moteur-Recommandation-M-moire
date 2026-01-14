// src/app/(dashboard)/profile/page.tsx
'use client'

import { useState } from 'react'
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
  Clock
} from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: 'Jean Dupont',
    email: 'jean.dupont@universite.ac',
    university: 'Université Paris-Saclay',
    field: 'Informatique',
    level: 'Master 2',
    interests: 'IA, Cybersécurité, Machine Learning, DevOps',
    location: 'Paris, France',
    bio: 'Étudiant en Master 2 Informatique spécialisé en IA et cybersécurité. Passionné par les nouvelles technologies et leur impact sur la société.'
  })

  const stats = [
    { label: 'Profil complété', value: 95, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Sujets explorés', value: 12, icon: Target, color: 'text-blue-600' },
    { label: 'Recommandations', value: 24, icon: Star, color: 'text-yellow-600' },
    { label: 'Jours actifs', value: 45, icon: Calendar, color: 'text-purple-600' },
  ]

  const skills = [
    { name: 'Machine Learning', level: 85 },
    { name: 'Python', level: 90 },
    { name: 'Cybersécurité', level: 75 },
    { name: 'Cloud Computing', level: 70 },
    { name: 'Data Analysis', level: 80 },
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Ici, on enverrait les données à l'API
    console.log('Données sauvegardées:', formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Modifier
              </>
            )}
          </button>
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
                  <User className="w-16 h-16 text-white" />
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg"
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
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{formData.fullName}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{formData.bio}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formData.location}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}{stat.label.includes('%') ? '' : ''}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
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
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 dark:text-white">{formData.university}</span>
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
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900 dark:text-white">{formData.field}</span>
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
                    <option value="Licence">Licence</option>
                    <option value="Master 1">Master 1</option>
                    <option value="Master 2">Master 2</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-900 dark:text-white">{formData.level}</span>
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
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.split(', ').map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compétences */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compétences techniques</h3>
              {isEditing && (
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  + Ajouter
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
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
                { label: 'Informations personnelles', progress: 100 },
                { label: 'Profil académique', progress: 100 },
                { label: 'Compétences', progress: 85 },
                { label: 'Centres d\'intérêt', progress: 95 },
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
                <span>Ajoutez vos projets académiques</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Précisez vos compétences techniques</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Mettez à jour vos centres d'intérêt</span>
              </li>
            </ul>
          </div>

          {/* Dernières activités */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Dernières activités</h3>
            <div className="space-y-4">
              {[
                { action: 'Profil mis à jour', time: 'Il y a 2 jours' },
                { action: 'Nouveau sujet ajouté', time: 'Il y a 3 jours' },
                { action: 'Compétences évaluées', time: 'Il y a 1 semaine' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{activity.action}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}