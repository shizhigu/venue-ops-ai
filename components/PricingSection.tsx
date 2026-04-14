"use client"

import { useState } from "react"
import Section from "@/components/Section"
import Button from "@/components/Button"
import Card from "@/components/Card"
import { motion } from "framer-motion"
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { StarIcon, BoltIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline"

const plans = [
  {
    name: "Starter",
    subtitle: "Small venues (<10K seats)",
    monthlyPrice: "597",
    originalMonthlyPrice: "997",
    description: "Perfect for testing ROI",
    badge: "FOUNDER PRICE",
    badgeColor: "bg-orange-100 text-orange-700",
    features: [
      { text: "Unlimited users", included: true },
      { text: "Unlimited tasks", included: true },
      { text: "Basic reporting", included: true },
      { text: "Email support", included: true },
      { text: "Data export", included: true },
      { text: "API access", included: false },
      { text: "Advanced reports", included: false }
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
    showPrice: true
  },
  {
    name: "Professional",
    subtitle: "Mid-size venues (10-30K seats)",
    monthlyPrice: "997",
    originalMonthlyPrice: "1997",
    description: "Full operations platform",
    badge: "MOST POPULAR",
    badgeColor: "bg-green-100 text-green-700",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "API integrations", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Compliance reports", included: true },
      { text: "Priority phone support", included: true },
      { text: "Custom fields", included: true },
      { text: "3rd party integrations", included: true }
    ],
    cta: "Start Free Trial",
    variant: "brand" as const,
    showPrice: true,
    highlighted: true
  },
  {
    name: "Enterprise",
    subtitle: "Large venues (30K+ seats)",
    monthlyPrice: "2,497+",
    originalMonthlyPrice: null,
    description: "White-glove service",
    badge: "CUSTOM",
    badgeColor: "bg-gray-100 text-gray-700",
    features: [
      { text: "Everything in Professional", included: true },
      { text: "Multi-venue management", included: true },
      { text: "White label option", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "On-site training", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Custom development", included: true }
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    showPrice: true
  }
]

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  const [remainingSpots, setRemainingSpots] = useState(13)

  return (
    <Section id="pricing" className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
          Pricing
        </p>
        <h2 className="heading-2 mb-4">
          Simple, transparent pricing
        </h2>
        <p className="body-large max-w-3xl mx-auto text-gray-600 mb-6">
          Choose the plan that fits your venue size
        </p>
        
        {/* Founder pricing alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Founder special: First 20 customers lock in 50% off forever</span>
          <span className="px-2 py-0.5 bg-orange-200 rounded-full text-xs font-bold">
            {remainingSpots} spots left
          </span>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${plan.highlighted ? 'lg:-mt-4' : ''}`}
          >
            <Card className={`h-full ${plan.highlighted ? 'border-2 border-brand shadow-xl' : ''}`}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 ${plan.badgeColor} rounded-full text-xs font-semibold`}>
                  {plan.badge}
                </div>
              )}
              
              <div className="p-6">
                {/* Plan header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-primary mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{plan.subtitle}</p>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-4 sm:mb-6">
                  {plan.showPrice ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-primary">
                          ${plan.monthlyPrice}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      {plan.originalMonthlyPrice && (
                        <p className="text-sm text-gray-500 line-through mt-1">
                          Originally ${plan.originalMonthlyPrice}/month
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-primary">Custom Quote</div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  variant={plan.variant}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bottom features */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-600 font-medium mb-4">All plans include:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckIcon className="w-4 h-4 text-green-500" />
            30-day free trial
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckIcon className="w-4 h-4 text-green-500" />
            Free data migration
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckIcon className="w-4 h-4 text-green-500" />
            No setup fees
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckIcon className="w-4 h-4 text-green-500" />
            Cancel anytime
          </div>
        </div>
      </motion.div>
    </Section>
  )
}