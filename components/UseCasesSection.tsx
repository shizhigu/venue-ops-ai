"use client"

import Section from "@/components/Section"
import Card from "@/components/Card"
import { motion } from "framer-motion"
import { 
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  CubeIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline"

const useCases = [
  {
    icon: BriefcaseIcon,
    title: "Lost & Found",
    description: "Track lost items with AI matching",
    example: "\"Found blue backpack in Section 105\"",
    color: "blue"
  },
  {
    icon: WrenchScrewdriverIcon,
    title: "Maintenance",
    description: "Report and track facility issues",
    example: "\"Broken door handle in bathroom 3B\"",
    color: "orange"
  },
  {
    icon: ShieldExclamationIcon,
    title: "Security",
    description: "Quick incident reporting",
    example: "\"Suspicious activity near Gate A\"",
    color: "red"
  },
  {
    icon: SparklesIcon,
    title: "Cleaning",
    description: "Spills and cleaning requests",
    example: "\"Major spill in concourse 2\"",
    color: "green"
  },
  {
    icon: CubeIcon,
    title: "Supplies",
    description: "Inventory and restocking",
    example: "\"Paper towels out in all restrooms\"",
    color: "purple"
  },
  {
    icon: MegaphoneIcon,
    title: "Guest Services",
    description: "Customer assistance needs",
    example: "\"Guest needs wheelchair at entrance\"",
    color: "yellow"
  }
]

export default function UseCasesSection() {
  return (
    <Section id="use-cases" className="bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
          <SparklesIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          One Platform, Every Incident Type
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
          Six ways venues use ZenAsset daily
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
          All through the same simple interface. Your team doesn't need to learn different systems.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-${useCase.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 sm:w-6 h-5 sm:h-6 text-${useCase.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 sm:mb-3">
                      {useCase.description}
                    </p>
                    <div className="bg-gray-50 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
                      <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Example:</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 italic">
                        {useCase.example}
                      </p>
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
        transition={{ delay: 0.6 }}
        className="mt-8 sm:mt-12 text-center px-4 sm:px-0"
      >
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl sm:rounded-2xl">
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">10 seconds</p>
            <p className="text-xs sm:text-sm text-gray-600">To report anything</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">Zero</p>
            <p className="text-xs sm:text-sm text-gray-600">Reports missed</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">100%</p>
            <p className="text-xs sm:text-sm text-gray-600">Accountability</p>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}