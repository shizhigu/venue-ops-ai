"use client"

import Section from "@/components/Section"
import Button from "@/components/Button"
import { motion } from "framer-motion"
import { 
  ArrowLongRightIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CheckIcon
} from "@heroicons/react/24/outline"

export default function FinalCTA() {
  return (
    <Section className="bg-primary text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-0 bottom-0 -ml-40 -mb-40 h-80 w-80 rounded-full bg-brand-secondary blur-3xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative text-center max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
          <ShieldCheckIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          Transform Voice Reports Into Tracked Tasks
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
          Ready to Transform Your Operations?
        </h2>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-6 lg:px-0">
          Join venues eliminating communication chaos. Every voice report becomes 
          a tracked, actionable task. Start with lost & found, expand naturally. 
          Voice-first design, zero training needed, complete accountability.
        </p>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-2xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">10s</div>
            <div className="text-xs sm:text-sm text-gray-400">To Report</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">Zero</div>
            <div className="text-xs sm:text-sm text-gray-400">Missed Reports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">100%</div>
            <div className="text-xs sm:text-sm text-gray-400">Accountability</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              className="bg-brand text-white hover:bg-orange-700 border-0"
            >
              Start Free Trial
              <ArrowLongRightIcon className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              Schedule Demo
            </Button>
          </motion.div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400 px-4 sm:px-0">
          <div className="flex items-center justify-center gap-2">
            <CheckIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>Setup in under 10 minutes</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>Cancel anytime</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 lg:mt-20 pt-12 sm:pt-16 lg:pt-20 border-t border-gray-700 px-4 sm:px-6 lg:px-0"
        >
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <ShieldCheckIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold">Our Promise</span>
          </div>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We believe lost & found isn't just about returning items—it's about showing 
            customers you care when they're stressed. Our smart system doesn't just match items; 
            it transforms frustrating moments into demonstrations of your brand's excellence. 
            With complete accountability and voice-first simplicity, you'll turn every 
            lost item into a found memory.
          </p>
        </motion.div>
      </motion.div>
    </Section>
  )
}