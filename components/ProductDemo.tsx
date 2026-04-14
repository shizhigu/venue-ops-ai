"use client"

import Section from "@/components/Section"
import { motion } from "framer-motion"
import { Play, Smartphone, MessageSquare, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function ProductDemo() {
  const [activeTab, setActiveTab] = useState<"staff" | "guest" | "match">("staff")
  
  const tabs = {
    staff: {
      title: "Report Any Issue",
      icon: Smartphone,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Staff speaks into phone:</p>
            <p className="font-medium">"Spill in Section 203, needs immediate cleanup"</p>
          </div>
          <div className="flex items-center gap-3 text-success-600">
            <CheckCircle className="w-5 h-5" />
            <span>Task created in 10 seconds, routed to cleaning team</span>
          </div>
        </div>
      )
    },
    guest: {
      title: "AI Understands",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">AI processes and categorizes:</p>
            <p className="font-medium">Category: Cleaning | Priority: High | Location: Section 203</p>
          </div>
          <div className="flex items-center gap-3 text-primary-600">
            <MessageSquare className="w-5 h-5" />
            <span>Smart routing based on content and urgency</span>
          </div>
        </div>
      )
    },
    match: {
      title: "Task Tracked",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-success-100 rounded-lg p-4">
            <p className="text-sm text-success-700 mb-2">System confirms:</p>
            <p className="font-medium">✅ Task #1234 created | Assigned to: Cleaning Team | ETA: 5 min</p>
          </div>
          <div className="flex items-center gap-3 text-success-600">
            <CheckCircle className="w-5 h-5" />
            <span>Full accountability - nothing falls through cracks</span>
          </div>
        </div>
      )
    }
  }
  
  return (
    <Section className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
          See It In Action
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
          Watch how voice reports become tracked, actionable tasks
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-600 to-success-600 p-1">
            <div className="bg-white">
              <div className="flex">
                {Object.entries(tabs).map(([key, tab]) => {
                  const Icon = tab.icon
                  const isActive = activeTab === key
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as keyof typeof tabs)}
                      className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                        isActive 
                          ? "bg-gradient-to-r from-primary-600 to-success-600 text-white" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{tab.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tabs[activeTab].content}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-primary-200">
            <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Before: Traditional System</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>15-20 minutes to log each item</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>Complex forms and training required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>40% matching accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>No after-hours support</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-success-50 rounded-xl p-4 sm:p-6 border-2 border-success-200">
            <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">After: Smart System</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-0.5">✓</span>
                <span>30 seconds with voice input</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-0.5">✓</span>
                <span>Natural conversation, zero training</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-0.5">✓</span>
                <span>95%+ matching accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 mt-0.5">✓</span>
                <span>24/7 availability with full accountability</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}