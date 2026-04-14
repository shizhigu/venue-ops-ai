"use client"

import Section from "@/components/Section"
import Card from "@/components/Card"
import { motion } from "framer-motion"
import { 
  PhoneIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

const problems = [
  {
    icon: ClockIcon,
    title: '"I reported this an hour ago!"',
    description: "Guest is furious because their issue hasn't been addressed. Staff says they never heard about it. Now you have an angry customer and bad reviews.",
    stat: "23-45",
    statLabel: "min average delay"
  },
  {
    icon: ExclamationTriangleIcon,
    title: '"Who\'s handling the Section 3 issue?"',
    description: "Radio chaos. Three people might be going, or no one. You find out later that multiple staff wasted time on the same problem while others were ignored.",
    stat: "Zero",
    statLabel: "visibility"
  },
  {
    icon: DocumentTextIcon,
    title: '"When did we fix that slip hazard?"',
    description: "Someone slipped and is suing. Lawyer needs proof you responded quickly. You have no records, no timestamps, no photos. Now you're liable.",
    stat: "$127K",
    statLabel: "average lawsuit"
  }
]

export default function ProblemSection() {
  return (
    <Section className="bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-6"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          Sound familiar?
        </h2>
        <p className="text-sm sm:text-base lg:text-lg max-w-3xl mx-auto text-gray-600">
          Industry average: 23-45 minutes to resolve • 30% of issues forgotten • 0% have complete records
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-0">
        {problems.map((problem, index) => {
          const Icon = problem.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-error-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                      {problem.description}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900">
                        {problem.stat}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500">
                        {problem.statLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8 sm:mt-12 mx-4 sm:mx-6 lg:mx-0 p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm"
      >
        <div className="text-center">
          <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2">
            The Hidden Cost of Poor Task Management
          </p>
          <p className="text-sm sm:text-base text-slate-600">
            Average venue handles <span className="font-bold text-slate-900">5,000+</span> operational reports annually, 
            each one critical to guest experience and safety
          </p>
        </div>
      </motion.div>
    </Section>
  )
}