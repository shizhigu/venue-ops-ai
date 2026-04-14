"use client"

import Section from "@/components/Section"
import Button from "@/components/Button"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "How accurate is the AI categorization?",
    answer: "Our system achieves 95%+ accuracy in understanding and routing reports. It knows 'bathroom needs supplies' goes to facilities, while 'guest fell' goes to security. The AI continuously learns from your venue's specific vocabulary and improves over time."
  },
  {
    question: "What if staff don't use the system?",
    answer: "The voice-first interface makes reporting so quick (10 seconds) that compliance rates reach 90%+. It's faster than walkie-talkies and creates automatic accountability. Staff actually prefer it because they get confirmation their report was received."
  },
  {
    question: "How long does setup take?",
    answer: "Most venues are operational within 10 minutes. There's no complex software to install - staff just need a phone. The system is pre-trained on thousands of operational scenarios. Start with lost & found, then naturally expand to other report types."
  },
  {
    question: "Can it integrate with our existing systems?",
    answer: "Yes! We can push reports to your work order system, Slack, Teams, or any platform with an API. The beauty is you don't need to replace anything - we enhance what you have. Reports can become tickets, emails, or SMS automatically."
  },
  {
    question: "What about data privacy and security?",
    answer: "We're SOC 2 and GDPR compliant with 256-bit encryption for all data. Customer information is automatically purged after your retention period. Full audit trails ensure accountability while maintaining privacy. We never sell or share your data."
  },
  {
    question: "How does the voice interface work?",
    answer: "Staff simply press and speak - like a smart walkie-talkie. No special commands needed. The AI understands context: 'spill in 203' becomes a cleaning task for that location. Works in noisy environments and with any accent."
  },
  {
    question: "What types of reports can it handle?",
    answer: "Everything from lost & found to maintenance, supplies, security, and cleaning. The AI learns your specific needs. Most venues start with lost & found, then staff naturally begin using it for everything. The system adapts to your operations."
  },
  {
    question: "Can we customize workflows?",
    answer: "Professional and Enterprise plans can customize routing rules, priority levels, and notification preferences. Set up automatic escalations, define team responsibilities, and create venue-specific task types. The system learns and suggests optimizations."
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
          Frequently Asked Questions
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
          Everything you need to know about transforming your venue operations
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 px-4 sm:px-6 lg:px-0">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 sm:p-6 text-left"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-3 sm:pr-4">
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </div>
              
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600"
                >
                  {faq.answer}
                </motion.div>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8 sm:mt-12 text-center px-4 sm:px-0"
      >
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          Still have questions? We're here to help.
        </p>
        <Button variant="outline">
          Contact Support
        </Button>
      </motion.div>
    </Section>
  )
}