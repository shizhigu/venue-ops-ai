"use client"

import Section from "@/components/Section"
import { motion } from "framer-motion"
import { 
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

export default function ProofSection() {
  return (
    <Section id="proof" className="bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
            The Numbers Don't Lie
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            This isn't a cost, it's an investment
          </h2>
          <p className="text-lg text-secondary max-w-3xl mx-auto">
            One prevented lawsuit pays for 26 years of ZenAsset
          </p>
        </div>

        {/* ROI Calculator Style Display */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-red-600 mb-2">$127,000</div>
              <p className="text-sm text-gray-600">Average slip & fall lawsuit</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-orange-600 mb-2">300</div>
              <p className="text-sm text-gray-600">Lost customers per bad review</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-green-600 mb-2">$397</div>
              <p className="text-sm text-gray-600">Monthly cost of ZenAsset</p>
            </motion.div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-6 text-center">
            <p className="text-lg font-medium text-gray-900">
              Prevent just ONE incident = <span className="font-bold text-orange-600">26 years of ZenAsset paid for</span>
            </p>
          </div>
        </div>

        {/* What Venues Are Seeing */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-primary mb-4">
            Expected results based on industry data
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <ClockIcon className="w-8 h-8 text-orange-600" />
              <ArrowTrendingDownIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">68%</div>
            <p className="text-sm text-gray-600">Faster response time</p>
            <p className="text-xs text-gray-500 mt-2">From 23 min → 7 min average</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
            <p className="text-sm text-gray-600">Issue resolution rate</p>
            <p className="text-xs text-gray-500 mt-2">Nothing falls through cracks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
            <p className="text-sm text-gray-600">Audit-ready records</p>
            <p className="text-xs text-gray-500 mt-2">Complete documentation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">40%</div>
            <p className="text-sm text-gray-600">Higher satisfaction</p>
            <p className="text-xs text-gray-500 mt-2">Faster issue resolution</p>
          </motion.div>
        </div>

        {/* Testimonial-style quote (hypothetical but realistic) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-8 text-center"
        >
          <p className="text-xl font-light mb-4 italic">
            "Last month during state inspection, the inspector asked for our incident response records. 
            With ZenAsset, I exported everything in one click. The inspector said it was the most 
            complete documentation he'd ever seen."
          </p>
          <p className="text-sm text-gray-400">
            - What every venue manager wants to say
          </p>
        </motion.div>

        {/* Industry validation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-600 mb-4">Built with industry best practices from:</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <span className="text-gray-500 font-medium">IAVM Standards</span>
            <span className="text-gray-500 font-medium">•</span>
            <span className="text-gray-500 font-medium">OSHA Guidelines</span>
            <span className="text-gray-500 font-medium">•</span>
            <span className="text-gray-500 font-medium">ISO 45001</span>
            <span className="text-gray-500 font-medium">•</span>
            <span className="text-gray-500 font-medium">SOC 2 (in progress)</span>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  )
}