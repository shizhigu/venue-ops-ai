'use client'

import { motion } from 'framer-motion'
import { 
  PhoneIcon,
  PlayCircleIcon,
  PresentationChartBarIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'

const links = [
  {
    title: 'Try Live Demo',
    description: 'Experience the product yourself',
    href: '/demo',
    icon: PlayCircleIcon,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    external: false
  },
  {
    title: 'View Pitch Deck',
    description: 'See our investor presentation',
    href: '/pitch-pro',
    icon: PresentationChartBarIcon,
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    external: false
  },
  {
    title: 'Call Me',
    description: '518-961-8035',
    href: 'tel:518-961-8035',
    icon: PhoneIcon,
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
    external: false
  },
  {
    title: 'Email Me',
    description: 'mike.gu@zenasset.io',
    href: 'mailto:mike.gu@zenasset.io',
    icon: EnvelopeIcon,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    external: false
  },
  {
    title: 'Schedule Meeting',
    description: 'Book a 30-min call',
    href: 'https://calendly.com/mike-getstarket',
    icon: CalendarDaysIcon,
    color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    external: true
  }
]

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Logo/Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="text-center">
              <span 
                className="text-3xl font-light"
                style={{ 
                  fontFamily: "'Raleway', sans-serif",
                  background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                zen
              </span>
              <span 
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                asset
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mike(Shizhi) Gu
          </h1>
          <p className="text-gray-600 mb-1">
            Founder & CEO at ZenAsset
          </p>
          <p className="text-sm text-gray-500">
            AI-Powered Venue Operations
          </p>
        </motion.div>

        {/* Links Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {links.map((link, index) => (
            <motion.a
              key={link.title}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center flex-shrink-0`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Text */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {link.title}
                      </h3>
                      {link.external && (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {link.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="ml-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 mb-2">
            Building the future of venue operations
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>© 2024 ZenAsset</span>
            <span>•</span>
            <span>AI-Powered Operations</span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="bg-white/50 backdrop-blur rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-600">Venues</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-900">3.8K</p>
            <p className="text-xs text-gray-600">Issues Handled</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-900">7min</p>
            <p className="text-xs text-gray-600">Avg Response</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}