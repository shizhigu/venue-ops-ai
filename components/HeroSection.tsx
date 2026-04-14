"use client"

import Button from "@/components/Button"
import { motion } from "framer-motion"
import { 
  ArrowLongRightIcon,
  MicrophoneIcon,
  CameraIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"

export default function HeroSection() {
  const [problemCount, setProblemCount] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  
  useEffect(() => {
    // Animate numbers
    const problemInterval = setInterval(() => {
      setProblemCount(prev => {
        if (prev < 3847) return prev + 47
        clearInterval(problemInterval)
        return 3847
      })
    }, 20)
    
    const responseInterval = setInterval(() => {
      setResponseTime(prev => {
        if (prev < 7) return prev + 1
        clearInterval(responseInterval)
        return 7
      })
    }, 100)
    
    return () => {
      clearInterval(problemInterval)
      clearInterval(responseInterval)
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle grid background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/20" />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D1D5DB" strokeWidth="1" opacity="0.6"/>
              <path d="M 0 0 L 80 0" fill="none" stroke="#D1D5DB" strokeWidth="1" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute left-0 bottom-0 -ml-40 -mb-40 h-80 w-80 rounded-full bg-success/5 blur-3xl" />
      </div>
      
      <div className="container relative pt-20 pb-12 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-0"
          >
            {/* Founder Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Limited: Founder pricing for first 20 venues</span>
                <span className="sm:hidden">Founder pricing</span>
                <span className="px-2 py-0.5 bg-orange-200 rounded-full text-xs font-bold">
                  12 spots left
                </span>
              </div>
            </motion.div>
            
            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.15] sm:leading-[1.1]">
                <div className="space-y-1 sm:space-y-2">
                  <div 
                    className="tracking-tight"
                    style={{ 
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 400,
                      color: "#1F2937",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    Every venue issue,
                  </div>
                  <div 
                    className="tracking-tight"
                    style={{ 
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 900,
                      color: "#EA580C",
                      letterSpacing: "-0.02em"
                    }}
                  >
                    tracked & accountable
                  </div>
                </div>
              </h1>
              
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-secondary leading-relaxed max-w-xl font-medium">
                From spills to lost items to broken facilities - track every issue, every response, every outcome. 
                <span className="hidden sm:inline">Know who's handling what, how long it takes, and when it's done.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <Button variant="brand" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold justify-center">
                  Start Free Trial
                  <ArrowLongRightIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
                <Button variant="outline" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold justify-center">
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust text */}
              <p className="text-xs sm:text-sm text-tertiary text-center sm:text-left">
                No credit card • 5-minute setup • Cancel anytime
              </p>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-5 sm:pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">12</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Venues</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{problemCount.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Issues</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{responseTime}min</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Response</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Process Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:pl-8 hidden lg:block"
          >
            <div className="relative">
              {/* Main Demo Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
                <div className="space-y-10">
                  {/* Header */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900">From Report to Resolution</h3>
                    <p className="text-sm text-gray-600 mt-1">3 steps • 7 minutes average</p>
                  </div>

                  {/* Simplified Process Flow */}
                  <div className="flex items-center justify-between">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex-1 text-center"
                    >
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-3">
                        <MicrophoneIcon className="w-8 h-8 text-orange-600" />
                      </div>
                      <p className="font-semibold text-gray-900">Report</p>
                      <p className="text-xs text-gray-500 mt-1">Voice • Text • Photo</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="px-2"
                    >
                      <ArrowLongRightIcon className="w-6 h-6 text-gray-300" />
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex-1 text-center"
                    >
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-3">
                        <UserGroupIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-semibold text-gray-900">Route</p>
                      <p className="text-xs text-gray-500 mt-1">AI assigns right team</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="px-2"
                    >
                      <ArrowLongRightIcon className="w-6 h-6 text-gray-300" />
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex-1 text-center"
                    >
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-3">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="font-semibold text-gray-900">Resolve</p>
                      <p className="text-xs text-gray-500 mt-1">Photo confirmed</p>
                    </motion.div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">7min</p>
                      <p className="text-xs text-gray-500">Avg resolution</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">100%</p>
                      <p className="text-xs text-gray-500">Tracked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">94%</p>
                      <p className="text-xs text-gray-500">First-time fix</p>
                    </div>
                  </div>

                  {/* Live Examples Ticker */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2 text-center">Recent resolutions:</p>
                    <div className="overflow-hidden">
                      <motion.div
                        animate={{ x: [0, -100, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="flex gap-6 text-sm text-gray-700 whitespace-nowrap"
                      >
                        <span>✓ "Spill cleaned" 4min</span>
                        <span>✓ "Phone returned" 6min</span>
                        <span>✓ "Door fixed" 8min</span>
                        <span>✓ "Found wallet matched" 3min</span>
                        <span>✓ "Spill cleaned" 4min</span>
                        <span>✓ "Phone returned" 6min</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-100"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">68%</p>
                  <p className="text-xs text-gray-600">Faster Response</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Process Demo - Simplified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:hidden mt-8 px-4 sm:px-6"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-4">
                How It Works
              </h3>
              
              {/* Simple 3-step process */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Report Issue</p>
                    <p className="text-xs text-gray-500">Voice, text, or photo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">AI Routes</p>
                    <p className="text-xs text-gray-500">Right team, instantly</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Track & Resolve</p>
                    <p className="text-xs text-gray-500">Average 7 minutes</p>
                  </div>
                </div>
              </div>
              
              {/* Key stat */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-2xl font-bold text-orange-600">68% Faster</p>
                <p className="text-xs text-gray-600">Than traditional methods</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}