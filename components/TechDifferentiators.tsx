"use client"

import Section from "@/components/Section"
import { motion } from "framer-motion"
import { Brain, MessageSquare } from "lucide-react"
import { ShieldExclamationIcon } from "@heroicons/react/24/outline"

const features = [
  {
    icon: Brain,
    title: "Smart Routing",
    description: "AI knows who should handle what - maintenance to facilities, lost items to guest services",
    example: "Routes 'broken door' to maintenance, 'found wallet' to security"
  },
  {
    icon: ShieldExclamationIcon,
    title: "Priority Detection",
    description: "Identifies urgent safety issues and escalates automatically",
    example: "'Wet floor' triggers immediate alert, 'loose railing' goes to safety team"
  },
  {
    icon: MessageSquare,
    title: "Smart Matching",
    description: "Connects related reports - finds patterns others miss",
    example: "Links 'blue phone' report with 'dark iPhone' inquiry"
  }
]

export default function TechDifferentiators() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
          AI That Speeds Up Everything
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
          From smart routing to priority detection, our AI handles the thinking so your team can focus on doing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  {feature.description}
                </p>
                <div className="bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                  <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Example:</p>
                  <p className="text-xs sm:text-sm text-gray-700 italic">
                    {feature.example}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-white mx-4 sm:mx-0"
      >
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
            <span className="text-gray-400">The Result:</span>{" "}
            <span className="text-orange-600 block sm:inline mt-1 sm:mt-0">Operations That Run Themselves</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">7 min</div>
              <div className="text-sm text-gray-300">Average resolution</div>
              <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">vs 23-45 min industry average</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">95%</div>
              <div className="text-sm text-gray-300">Match accuracy</div>
              <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">AI understands context</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">100%</div>
              <div className="text-sm text-gray-300">Issues tracked</div>
              <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">Complete audit trail</div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h4 className="font-semibold text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base">Live Example: Multiple Issues, One System</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-orange-400 font-semibold mb-1.5 sm:mb-2">LOST ITEM</p>
                <p className="text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">"Found blue backpack"</p>
                <p className="text-xs text-gray-500">→ Guest Services</p>
                <p className="text-xs text-green-400 mt-0.5 sm:mt-1">Matched with owner in 5 min</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-orange-400 font-semibold mb-1.5 sm:mb-2">SAFETY ISSUE</p>
                <p className="text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">"Wet floor near entrance"</p>
                <p className="text-xs text-gray-500">→ Priority Alert</p>
                <p className="text-xs text-green-400 mt-0.5 sm:mt-1">Cleaned & signed in 3 min</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-orange-400 font-semibold mb-1.5 sm:mb-2">MAINTENANCE</p>
                <p className="text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">"Door won't lock"</p>
                <p className="text-xs text-gray-500">→ Facilities Team</p>
                <p className="text-xs text-green-400 mt-0.5 sm:mt-1">Fixed with photo proof in 8 min</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}