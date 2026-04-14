"use client"

import Section from "@/components/Section"
import Button from "@/components/Button"
import { motion } from "framer-motion"
import { useState } from "react"
import { Calculator, DollarSign, Clock, TrendingUp } from "lucide-react"

export default function ROICalculator() {
  const [events, setEvents] = useState(50)
  const [itemsPerEvent, setItemsPerEvent] = useState(20)
  const [hourlyWage, setHourlyWage] = useState(20)
  
  const annualItems = events * itemsPerEvent
  const minutesPerItem = 15
  const annualHours = (annualItems * minutesPerItem) / 60
  const currentCost = annualHours * hourlyWage
  
  const aiMinutesPerItem = 2
  const aiAnnualHours = (annualItems * aiMinutesPerItem) / 60
  const aiCost = aiAnnualHours * hourlyWage
  
  const savings = currentCost - aiCost
  const savingsPercent = Math.round((savings / currentCost) * 100)
  const monthlySubscription = 400
  const annualSubscription = monthlySubscription * 12
  const netSavings = savings - annualSubscription
  const roi = Math.round((netSavings / annualSubscription) * 100)
  
  return (
    <Section className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
          Calculate Your Savings
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See exactly how much time and money you'll save with smart lost & found
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary-600" />
                Your Venue Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Events
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={events}
                  onChange={(e) => setEvents(Number(e.target.value))}
                  className="w-full slider-brand"
                  style={{
                    background: `linear-gradient(to right, #FED7AA 0%, #FED7AA ${((events - 10) / (200 - 10)) * 100}%, #E5E7EB ${((events - 10) / (200 - 10)) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>10</span>
                  <span className="font-bold text-brand">{events} events</span>
                  <span>200</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lost Items per Event
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={itemsPerEvent}
                  onChange={(e) => setItemsPerEvent(Number(e.target.value))}
                  className="w-full slider-brand"
                  style={{
                    background: `linear-gradient(to right, #FED7AA 0%, #FED7AA ${((itemsPerEvent - 5) / (50 - 5)) * 100}%, #E5E7EB ${((itemsPerEvent - 5) / (50 - 5)) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>5</span>
                  <span className="font-bold text-brand">{itemsPerEvent} items</span>
                  <span>50</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Hourly Wage
                </label>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  className="w-full slider-brand"
                  style={{
                    background: `linear-gradient(to right, #FED7AA 0%, #FED7AA ${((hourlyWage - 15) / (40 - 15)) * 100}%, #E5E7EB ${((hourlyWage - 15) / (40 - 15)) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>$15</span>
                  <span className="font-bold text-brand">${hourlyWage}/hour</span>
                  <span>$40</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-success-600" />
                Your Annual Savings
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Current Annual Cost</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${Math.round(currentCost).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">With Smart System</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${Math.round(aiCost).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Staff Time Saved</span>
                  <span className="text-xl font-bold text-success-600">
                    {savingsPercent}%
                  </span>
                </div>
                
                <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Net Annual Savings</span>
                    <span className="text-2xl font-bold text-success-600">
                      ${Math.round(netSavings).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className="text-lg font-bold text-primary-600">
                      {roi}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="primary" className="w-full">
                  Get Your Custom ROI Report
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <DollarSign className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{annualItems}</div>
                <div className="text-sm text-gray-600">Items/Year</div>
              </div>
              <div>
                <Clock className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(annualHours - aiAnnualHours)}
                </div>
                <div className="text-sm text-gray-600">Hours Saved</div>
              </div>
              <div>
                <TrendingUp className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(netSavings / annualSubscription)} months
                </div>
                <div className="text-sm text-gray-600">Payback Period</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}