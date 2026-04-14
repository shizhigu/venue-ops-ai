"use client"

import Section from "@/components/Section"
import { motion } from "framer-motion"
import { 
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BoltIcon,
  WrenchIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

const incidentTypes = [
  {
    icon: MagnifyingGlassIcon,
    title: "Lost & Found",
    examples: ["iPhone found", "Missing wallet", "Left backpack"],
    color: "blue",
    stat: "94% match rate"
  },
  {
    icon: WrenchIcon,
    title: "Maintenance",
    examples: ["Door broken", "Light out", "AC not working"],
    color: "orange",
    stat: "5 min dispatch"
  },
  {
    icon: ExclamationTriangleIcon,
    title: "Safety & Security",
    examples: ["Spill hazard", "Suspicious activity", "Medical need"],
    color: "red",
    stat: "30 sec alert"
  }
]

export default function SolutionSection() {
  return (
    <Section className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
          <SparklesIcon className="w-4 h-4" />
          One System, Every Type of Issue
        </div>
        <h2 className="heading-2 mb-4">
          Not just lost & found. Not just maintenance.
          <br />
          <span className="text-orange-600">Everything.</span>
        </h2>
        <p className="body-large max-w-3xl mx-auto text-gray-600">
          Whether it's a lost phone, broken facility, or security concern - 
          same simple process, complete accountability.
        </p>
      </motion.div>

      {/* Three parallel use cases */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {incidentTypes.map((type, index) => {
          const Icon = type.icon
          return (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className={`w-12 h-12 bg-${type.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 text-${type.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{type.title}</h3>
              <div className="space-y-2 mb-4">
                {type.examples.map((example, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{example}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900">{type.stat}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* How it works - unified process */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2">Same simple process for everything</h3>
          <p className="text-gray-400">Your team doesn't need to learn different systems</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-2xl font-bold text-orange-400">1</span>
            </div>
            <h4 className="font-medium mb-2">Report</h4>
            <p className="text-sm text-gray-400">Voice, text, or photo - any incident type</p>
          </div>
          
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-2xl font-bold text-orange-400">2</span>
            </div>
            <h4 className="font-medium mb-2">Route</h4>
            <p className="text-sm text-gray-400">AI sends to the right team instantly</p>
          </div>
          
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-2xl font-bold text-orange-400">3</span>
            </div>
            <h4 className="font-medium mb-2">Resolve</h4>
            <p className="text-sm text-gray-400">Track to completion with full records</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">Most venues start with one type and expand naturally.</p>
          <p className="text-lg font-medium text-orange-400">
            The beauty? Your team uses the same interface for everything.
          </p>
        </div>
      </motion.div>
    </Section>
  )
}