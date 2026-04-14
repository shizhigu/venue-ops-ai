"use client"

import Section from "@/components/Section"
import Card from "@/components/Card"
import Button from "@/components/Button"
import { motion } from "framer-motion"
import { Target, Users, TrendingUp } from "lucide-react"

const visions = [
  {
    icon: Target,
    venue: "Sports Stadiums",
    size: "50,000+ capacity",
    vision: "Imagine: Game day. 50,000 fans. Zero lost item stress.",
    potential: [
      "Turn angry fans into amazed advocates",
      "Free staff from paperwork prison",
      "Create viral 'wow' moments"
    ],
    impact: "Every reunion becomes a story fans share"
  },
  {
    icon: Users,
    venue: "Universities",
    size: "10,000+ students",
    vision: "Picture: Students losing items between classes, finding them before lunch.",
    potential: [
      "Students amazed by instant matches",
      "Parents impressed by care",
      "Staff doing meaningful work"
    ],
    impact: "Transform campus reputation overnight"
  },
  {
    icon: TrendingUp,
    venue: "Hotels & Resorts",
    size: "200+ rooms",
    vision: "Envision: Checkout day. Guest's charger found. Shipped before they land.",
    potential: [
      "5-star reviews mentioning service",
      "Guests becoming repeat bookers",
      "Staff proud of their workplace"
    ],
    impact: "Lost & found becomes a differentiator"
  }
]

export default function CustomerStories() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
          The Future We're Building Together
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join pioneering venues ready to transform lost & found from a pain point into a competitive advantage
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {visions.map((vision, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <div className="mb-4">
                <vision.icon className="w-10 h-10 text-brand mb-3" />
                <h3 className="text-xl font-bold text-gray-900">{vision.venue}</h3>
                <p className="text-sm text-gray-600">
                  {vision.size}
                </p>
              </div>
              
              <div className="mb-6 flex-1">
                <p className="text-gray-700 font-medium mb-4">
                  {vision.vision}
                </p>
                
                <div className="space-y-2">
                  {vision.potential.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-brand">
                  {vision.impact}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <p className="text-lg text-gray-700 font-semibold mb-4">
          Be among the first 10 beta partners shaping the future
        </p>
        <Button variant="primary">
          Apply for Beta Access
        </Button>
      </motion.div>
    </Section>
  )
}