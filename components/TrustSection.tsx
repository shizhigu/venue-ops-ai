"use client"

import Section from "@/components/Section"
import { motion } from "framer-motion"
import { Shield, Lock, FileCheck, Award, Database, Users, Check } from "lucide-react"

const badges = [
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    description: "Enterprise-grade security standards"
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Full data privacy protection"
  },
  {
    icon: FileCheck,
    title: "Full Audit Trail",
    description: "Complete accountability for every action"
  },
  {
    icon: Database,
    title: "Data Encrypted",
    description: "256-bit encryption in transit and at rest"
  },
  {
    icon: Award,
    title: "99.9% Uptime",
    description: "Guaranteed availability SLA"
  },
  {
    icon: Users,
    title: "CCPA Compliant",
    description: "California privacy law compliance"
  }
]

export default function TrustSection() {
  return (
    <Section className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
          Trust, Security & Accountability
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your data and your customers' trust are our top priorities. 
          Full accountability means you always know what happened, when, and why.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
        {badges.map((badge, index) => {
          const Icon = badge.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="text-center"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-white rounded-2xl p-8 shadow-xl max-w-4xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Accountability Built In
            </h3>
            <p className="text-gray-600 mb-4">
              Every interaction, every decision, every item movement is tracked and logged. 
              You'll always have a complete audit trail for compliance and customer service excellence.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-success-600" />
                <span>Who logged each item and when</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-success-600" />
                <span>Complete conversation transcripts</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-success-600" />
                <span>AI decision reasoning logs</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-success-600" />
                <span>Item status history and chain of custody</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-success-50 rounded-xl p-6">
            <div className="bg-white rounded-lg p-4 shadow mb-3">
              <div className="text-xs text-gray-500 mb-1">Audit Log Entry</div>
              <div className="font-mono text-xs space-y-1">
                <div><span className="text-gray-500">Time:</span> 2024-01-15 14:32:01</div>
                <div><span className="text-gray-500">Staff:</span> John Smith</div>
                <div><span className="text-gray-500">Action:</span> Item logged via voice</div>
                <div><span className="text-gray-500">Item:</span> Black iPhone 14 Pro</div>
                <div><span className="text-gray-500">Location:</span> Section 203</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow mb-3">
              <div className="text-xs text-gray-500 mb-1">Customer Interaction</div>
              <div className="font-mono text-xs space-y-1">
                <div><span className="text-gray-500">Time:</span> 2024-01-15 18:45:22</div>
                <div><span className="text-gray-500">Channel:</span> Voice Interface</div>
                <div><span className="text-gray-500">Query:</span> "Lost dark phone"</div>
                <div><span className="text-gray-500">Match:</span> 94% confidence</div>
                <div><span className="text-gray-500">Result:</span> Item matched</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <Shield className="w-5 h-5 text-primary-600 inline-block mr-1" />
              Full transparency, always
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}