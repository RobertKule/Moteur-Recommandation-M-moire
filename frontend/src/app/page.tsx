// src/app/page.tsx - Version corrigée (sans erreur d'hydratation)
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, GraduationCap, BookOpen, Filter, Target, Clock, Check, Users, Shield, Lightbulb, Sparkles, MessageSquare } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import QuickChat from '@/components/chat/quick-chat'
import ThemeToggle from '@/components/ui/theme-toggle'
import Link from 'next/link'

// Composant pour les particules (CSR seulement)
const AnimatedParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    // Générer les particules uniquement côté client
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setParticles(newParticles)
  }, [])

  if (particles.length === 0) return null

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{ 
            x: `${particle.x}%`, 
            y: `${particle.y}%`,
            opacity: 0
          }}
          animate={{ 
            y: [null, '-100%'],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('domain')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsClient(true)
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -8,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  // Données constantes (pas d'aléatoire côté serveur)
  const statsData = [
    { value: "5K+", label: "Étudiants accompagnés", icon: Users },
    { value: "98%", label: "Satisfaction", icon: Check },
    { value: "48h", label: "Temps moyen", icon: Clock },
    { value: "100%", label: "Personnalisation", icon: Target }
  ]

  const tabsData = [
    { id: 'domain', label: 'Votre domaine', icon: BookOpen },
    { id: 'level', label: 'Votre niveau', icon: GraduationCap },
    { id: 'interests', label: 'Vos intérêts', icon: Target },
    { id: 'timeline', label: 'Votre temps', icon: Clock }
  ]

  const stepsData = [
    {
      step: "1",
      title: "On fait connaissance",
      description: "Parlez-nous de vous, de vos passions et de vos aspirations",
      icon: MessageSquare
    },
    {
      step: "2",
      title: "On affine ensemble",
      description: "Nous discutons de vos critères pour mieux vous comprendre",
      icon: Filter
    },
    {
      step: "3",
      title: "On découvre des pistes",
      description: "Recevez des suggestions qui vous ressemblent vraiment",
      icon: Lightbulb
    },
    {
      step: "4",
      title: "On valide avec confiance",
      description: "Vous choisissez en étant parfaitement éclairé",
      icon: Check
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-white/50 dark:from-blue-950/10 dark:to-gray-900/50"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full mb-8"
              >
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Votre parcours commence ici
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              >
                Trouvez le sujet qui <span className="text-blue-600 dark:text-blue-400">vous correspond</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Nous comprenons que chaque étudiant est unique. Notre système vous guide pas à pas vers le sujet qui correspond à votre personnalité et vos ambitions.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Link 
                  href="/register"
                  className="relative px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Commencer mon parcours
                  </span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#criteria"
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 hover:border-blue-300 dark:hover:border-blue-500"
                >
                  <BookOpen className="w-5 h-5" />
                  Explorer les critères
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {statsData.map((stat, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4"
                  >
                    <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Critères */}
      <section id="criteria" className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Un chemin <span className="text-blue-600 dark:text-blue-400">fait pour vous</span>
              </motion.h2>
              <motion.p 
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Découvrez comment nos critères s'adaptent à votre profil unique
              </motion.p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {tabsData.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Contenu des tabs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
              >
                {activeTab === 'domain' && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Votre domaine d'études
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                      Chaque domaine a ses spécificités. Nous les comprenons et adaptons nos recommandations en conséquence.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {['Génie Informatique', 'Génie Civil', 'Génie Electrique', 'Génie Mecanique', 'Génie Electronique'].map((item) => (
                        <motion.span
                          key={item}
                          whileHover={{ scale: 1.1 }}
                          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg"
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'level' && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Votre niveau académique
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                      De la licence au doctorat, chaque étape demande des approches différentes. Nous en tenons compte.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Licence', 'Master 1', 'Master 2', 'Doctorat'].map((item) => (
                        <motion.div
                          key={item}
                          whileHover={{ scale: 1.05 }}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Section Processus */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Votre parcours <span className="text-blue-600 dark:text-blue-400">pas à pas</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Un accompagnement humain à chaque étape de votre recherche
              </p>
            </motion.div>

            <div className="relative">
              {/* Ligne de progression */}
              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 dark:bg-blue-800 transform -translate-y-1/2 hidden md:block"
              />
              
              <div className="grid md:grid-cols-4 gap-8 relative">
                {stepsData.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    onHoverStart={() => setHoveredCard(index)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="relative"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center relative z-10">
                      <motion.div 
                        animate={{ 
                          scale: hoveredCard === index ? 1.1 : 1,
                          rotate: hoveredCard === index ? 5 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6"
                      >
                        {step.step}
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                    
                    {/* Effet de halo */}
                    {hoveredCard === index && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 rounded-2xl blur-xl -z-10"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Ils nous ont <span className="text-blue-600 dark:text-blue-400">fait confiance</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Découvrez les parcours de nos étudiants satisfaits
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Marie K.",
                  role: "Master Informatique",
                  content: "J'avais du mal à trouver un sujet qui me passionne vraiment. L'équipe m'a écoutée et m'a guidée vers des pistes que je n'aurais jamais explorées seule.",
                  delay: 0
                },
                {
                  name: "Thomas D.",
                  role: "Doctorant Biologie",
                  content: "Ce qui m'a marqué, c'est l'écoute et la compréhension de mes contraintes. Ils ont vraiment pris le temps de me comprendre avant de proposer quoi que ce soit.",
                  delay: 0.1
                },
                {
                  name: "Sophie L.",
                  role: "Master Génie Civil",
                  content: "J'ai senti qu'on s'intéressait vraiment à moi en tant que personne, pas juste à mon dossier académique. Ça a fait toute la différence.",
                  delay: 0.2
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: testimonial.delay }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 relative overflow-hidden group"
                >
                  {/* Effet de fond animé */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30 dark:group-hover:from-blue-900/10 dark:group-hover:to-blue-800/20"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                      >
                        <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-700 dark:text-gray-300 italic relative"
                    >
                      "{testimonial.content}"
                      <motion.span
                        className="absolute -top-2 -left-2 text-blue-400/20 dark:text-blue-500/10 text-4xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        "
                      </motion.span>
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 dark:from-blue-800 dark:via-blue-800 dark:to-blue-900 relative overflow-hidden">
        {/* Particules - Chargées côté client seulement */}
        {isClient && (
          <div className="absolute inset-0">
            <AnimatedParticles />
          </div>
        )}
        
        <div className="container relative mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex p-6 bg-white/10 backdrop-blur-sm rounded-3xl mb-8"
            >
              <Target className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Prêt à écrire <span className="text-yellow-300">votre histoire</span> ?
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
            >
              Rejoignez une communauté d'étudiants qui ont trouvé leur voie grâce à un accompagnement humain et personnalisé.
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/register"
                className="relative px-8 py-4 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white to-gray-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  <GraduationCap className="w-5 h-5" />
                  Commencer mon parcours
                </span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
              
              <Link
                href="#criteria"
                className="px-8 py-4 border-2 border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                En savoir plus
              </Link>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-blue-200 text-sm"
            >
              Un accompagnement humain • Gratuit • Sans engagement
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      <QuickChat />
      
      {mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <ThemeToggle />
        </motion.div>
      )}
    </div>
  )
}