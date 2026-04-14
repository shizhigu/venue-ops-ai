"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DocumentTextIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

export default function StickyBottomCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed in this session
    if (sessionStorage.getItem("sticky-cta-dismissed")) {
      setIsDismissed(true)
      return
    }

    const handleScroll = () => {
      // Show after scrolling 30% of the page
      const scrollPercentage = (window.scrollY / document.documentElement.scrollHeight) * 100
      
      if (scrollPercentage > 30 && !isDismissed) {
        setIsVisible(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem("sticky-cta-dismissed", "true")
  }

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 sm:pb-6"
        >
          <div className="mx-auto max-w-5xl">
            <div className="relative bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="2" fill="white"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>

              <div className="relative px-6 py-4 sm:px-8 sm:py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left Side - Content */}
                  <div className="flex items-center gap-4 text-white">
                    <div className="hidden sm:flex w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        How Leading Venues Turn Lost Items Into 5-Star Reviews
                      </h3>
                      <p className="text-xs sm:text-sm opacity-90">
                        Get our 2024 Guest Experience Report: Lost & Found Impact Study
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        // Handle download action
                        console.log("Download report")
                      }}
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Get Free Report
                    </button>
                    
                    <button
                      onClick={handleDismiss}
                      className="p-2 text-white/70 hover:text-white transition-colors"
                      aria-label="Dismiss"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Mobile-only trust text */}
                <p className="sm:hidden text-xs text-white/80 text-center mt-3">
                  No email required • Instant PDF download
                </p>
              </div>

              {/* Desktop trust text */}
              <div className="hidden sm:block absolute bottom-2 left-8 text-xs text-white/60">
                No email required • Instant download
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}