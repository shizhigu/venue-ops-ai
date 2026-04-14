"use client"

import Section from "@/components/Section"
import Card from "@/components/Card"
import { motion } from "framer-motion"
import { Trophy, GraduationCap, School, Calendar } from "lucide-react"

const markets = [
  {
    icon: Trophy,
    title: "Sports Venues",
    description: "Game day crowds, high-value electronics, time pressure",
    features: [
      "Handle 50+ events annually",
      "Manage thousands of items",
      "Premium fan experience",
      "Real-time reunions"
    ],
    stat: "2,000+",
    statLabel: "items/year"
  },
  {
    icon: GraduationCap,
    title: "Universities",
    description: "Student essentials, frequent incidents, budget-conscious",
    features: [
      "Campus-wide coverage",
      "Student ID integration",
      "Multi-building support",
      "Academic year patterns"
    ],
    stat: "1,500+",
    statLabel: "items/year"
  },
  {
    icon: School,
    title: "K-12 Private Schools",
    description: "Parent satisfaction, branded experience, premium service",
    features: [
      "Parent communication",
      "Student safety focus",
      "Branded experience",
      "Accountability priority"
    ],
    stat: "800+",
    statLabel: "items/year"
  },
  {
    icon: Calendar,
    title: "Event Venues",
    description: "Concert chaos, international visitors, reputation management",
    features: [
      "Multi-event handling",
      "VIP guest service",
      "International support",
      "Quick turnaround"
    ],
    stat: "1,200+",
    statLabel: "items/year"
  }
]

export default function TargetMarkets() {
  return (
    <Section className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
          Built for Venues That Care About Customer Experience
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Whether you're managing game day chaos or ensuring student satisfaction, 
          our AI adapts to your unique needs
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {markets.map((market, index) => {
          const Icon = market.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {market.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {market.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {market.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-primary-600 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-2xl font-bold text-primary-600">
                      {market.stat}
                    </div>
                    <div className="text-xs text-gray-500">
                      {market.statLabel}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}