'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Siren,
  Activity,
  Target,
  Gauge,
  Cpu,
  Layers,
  Flame,
  BadgeCheck,
  AtSign,
  Orbit,
  Phone,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  Star,
  Users,
  Sparkles,
  CheckCircle,
  Zap,
  Building2,
  Shield,
  ScanLine,
  MapPin,
  MessageSquare,
  Calendar,
  Award,
  Wrench,
  Package,
  BellRing
} from 'lucide-react'

const slides = [
  // Slide 1: Hook (15 seconds)
  {
    id: 'hook',
    header: null,
    content: (
      <div className="h-full flex flex-col justify-center bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="mb-2">
              <span 
                className="text-[6rem] font-light tracking-tight"
                style={{ 
                  fontFamily: "'Raleway', sans-serif",
                  background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                zen
              </span>
              <span 
                className="text-[6rem] font-bold tracking-tight text-gray-900"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                asset
              </span>
            </div>
            <p className="text-2xl text-gray-600 font-light tracking-wide">
              Track Every Issue, Every Response
            </p>
          </div>
          
          <div className="my-16">
            <div className="inline-block">
              <div className="text-[8rem] font-black text-gray-900 leading-none mb-4">
                200+
              </div>
              <div className="text-3xl text-gray-600 font-medium">
                operational issues per event
              </div>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-xl text-gray-500 font-light">
              From chaos to clarity in 30 seconds
            </p>
          </div>
        </div>
      </div>
    )
  },

  // Slide 2: Problem Story (30 seconds)
  {
    id: 'problem',
    header: 'THE PROBLEM',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-6xl font-bold text-gray-900 mb-12 text-center">
            What Happens Today
          </h2>
          
          <div className="grid grid-cols-2 gap-12">
            {/* Current State */}
            <div className="bg-gray-50 p-10 border border-gray-300 flex flex-col">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 flex items-center gap-3">
                <Siren className="w-10 h-10 text-orange-600" />
                Current Reality
              </h3>
              <div className="flex-1 flex flex-col justify-between space-y-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 font-bold text-2xl">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-gray-800">"Toilet blocked in section 3"</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 font-bold text-2xl">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-gray-800">"Who's handling it?"</p>
                    <p className="text-xl text-gray-600 mt-1">Nobody knows</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 font-bold text-2xl">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-gray-800">45 minutes later...</p>
                    <p className="text-xl text-gray-600 mt-1">Still not fixed</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 font-bold text-2xl">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-gray-800">Guest posts angry tweet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Cost */}
            <div className="bg-gray-900 p-10 text-white">
              <h3 className="text-3xl font-bold mb-8">The Cost</h3>
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-300">Legal Risk</span>
                    <span className="text-4xl font-bold text-white">$127K</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Average lawsuit settlement</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-300">Lost Customers</span>
                    <span className="text-4xl font-bold text-white">15%</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Never return after bad experience</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-300">Google Rating</span>
                    <span className="text-4xl font-bold text-white">3.2★</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Industry average for poor ops</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur p-6 border border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-300">Documentation</span>
                    <span className="text-4xl font-bold text-white">NONE</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">No records for legal protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 3: How It Works (30 seconds)
  {
    id: 'how',
    header: 'HOW IT WORKS',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-6xl font-bold text-gray-900 mb-12 text-center">
            One System, Every Problem
          </h2>
          
          {/* Problem Types */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 border border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Cleaning</h3>
              <p className="text-sm text-gray-600">"Spill in hall"</p>
            </div>
            <div className="bg-white p-6 border border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Maintenance</h3>
              <p className="text-sm text-gray-600">"Door broken"</p>
            </div>
            <div className="bg-white p-6 border border-gray-300 text-center relative">
              <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                MVP READY
              </div>
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Lost & Found</h3>
              <p className="text-sm text-gray-600">"Found wallet"</p>
            </div>
            <div className="bg-white p-6 border border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Security</h3>
              <p className="text-sm text-gray-600">"Fight in lot"</p>
            </div>
          </div>

          {/* Universal Process */}
          <div className="bg-gray-900 p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Universal Process</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="font-semibold">Report</p>
              </div>
              <div className="text-gray-600">→</div>
              <div className="text-center">
                <Cpu className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="font-semibold">AI Understands</p>
              </div>
              <div className="text-gray-600">→</div>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="font-semibold">Assigns</p>
              </div>
              <div className="text-gray-600">→</div>
              <div className="text-center">
                <Layers className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="font-semibold">Tracks</p>
              </div>
              <div className="text-gray-600">→</div>
              <div className="text-center">
                <BadgeCheck className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p className="font-semibold">Complete</p>
              </div>
            </div>
            
            <div className="mt-8 text-center p-4 bg-white/10">
              <p className="text-xl font-semibold">
                ↓ Complete Audit Trail for Legal Protection ↓
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 4: Solution Demo - Complex AI Scenario (45 seconds) ⭐ AHA MOMENT
  {
    id: 'demo',
    header: 'THE MAGIC',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-5xl font-bold text-gray-900 mb-2 text-center">
            Watch This <span style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Magic</span>
          </h2>
          <p className="text-xl text-gray-600 mb-6 text-center">Real scenario: AC breaks during event</p>
          
          <div className="bg-gray-50 p-5 border-2 border-gray-400">
            {/* AI Workflow Visualization */}
            <div className="space-y-6">
              {/* Step 1: Report */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)" }}>
                  <span className="text-white text-4xl font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Staff Reports</h3>
                  <div className="bg-white p-4 border-2 border-gray-400">
                    <p className="text-2xl font-semibold text-gray-800">
                      "Main hall AC stopped working"
                    </p>
                    <p className="text-lg text-gray-500 mt-1">Via voice • 2 seconds</p>
                  </div>
                </div>
              </div>

              {/* Step 2: AI Actions */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)" }}>
                  <Cpu className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">AI Takes Over</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 border-2 border-gray-400">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-6 h-6 text-orange-600" />
                        <span className="text-lg font-bold text-gray-800">Calls vendors</span>
                      </div>
                      <p className="text-base text-gray-700 font-medium">
                        AI calls 3 AC<br/>repair vendors
                      </p>
                    </div>
                    <div className="bg-white p-3 border-2 border-gray-400">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <span className="text-lg font-bold text-gray-800">Gets quotes</span>
                      </div>
                      <p className="text-base text-gray-700 font-medium">
                        A: $1,200<br/>
                        <span className="text-green-600 font-bold">B: $900 ✓</span><br/>
                        C: $1,100
                      </p>
                    </div>
                    <div className="bg-white p-3 border-2 border-gray-400">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-800">Availability</span>
                      </div>
                      <p className="text-base text-gray-700 font-medium">
                        A: 2 hours<br/>
                        <span className="text-green-600 font-bold">B: 30 mins ✓</span><br/>
                        C: 1 hour
                      </p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 mt-2 font-semibold">All automated • 45 seconds</p>
                </div>
              </div>

              {/* Step 3: Decision & Action */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)" }}>
                  <Target className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Manager Approves</h3>
                  <div className="bg-white p-4 border-3" style={{ borderColor: "#EA580C", borderWidth: "3px" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xl font-bold text-gray-800 mb-3">
                          Vendor B: $900, arrives in 30 min
                        </p>
                        <div className="flex gap-3">
                          <button className="px-6 py-3 text-white font-bold text-xl" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)" }}>
                            ✓ Approve
                          </button>
                          <button className="px-6 py-3 bg-gray-300 text-gray-700 font-bold text-xl">
                            Modify
                          </button>
                        </div>
                      </div>
                      <div className="text-center ml-6 px-6">
                        <p className="text-6xl font-black" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>7m</p>
                        <p className="text-lg text-gray-600 font-semibold">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white py-4 px-6 text-center border-2 border-gray-400">
                <p className="text-5xl font-black" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>100%</p>
                <p className="text-xl text-gray-700 font-semibold mt-1">Documented</p>
              </div>
              <div className="bg-white py-4 px-6 text-center border-2 border-gray-400">
                <p className="text-5xl font-black text-gray-900">$300</p>
                <p className="text-xl text-gray-700 font-semibold mt-1">Saved</p>
              </div>
              <div className="bg-white py-4 px-6 text-center border-2 border-gray-400">
                <p className="text-5xl font-black" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>17x</p>
                <p className="text-xl text-gray-700 font-semibold mt-1">Faster</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 5: Market Opportunity (20 seconds)
  {
    id: 'market',
    header: 'THE OPPORTUNITY',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
            A Massive, Underserved Market
          </h2>
          
          {/* Market Funnel */}
          <div className="mb-10">
            {/* Total Market */}
            <div className="bg-gray-100 p-6 mb-4 border-l-4 border-gray-400">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">US Facility Management Market</p>
                  <p className="text-lg text-gray-600 mt-1">The massive umbrella market</p>
                </div>
                <p className="text-4xl font-black text-gray-700">$300B</p>
              </div>
            </div>

            {/* Venues Segment */}
            <div className="bg-gray-50 p-6 mb-4 ml-12 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">Venues & Events Segment</p>
                  <p className="text-lg text-gray-600 mt-1">Stadiums, arenas, convention centers</p>
                </div>
                <p className="text-4xl font-black text-blue-600">$30B</p>
              </div>
            </div>

            {/* Our TAM */}
            <div className="bg-orange-50 p-6 mb-4 ml-24 border-l-4 border-orange-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">Our Addressable Market (1%)</p>
                  <p className="text-lg text-gray-600 mt-1">AI-powered operations software</p>
                </div>
                <p className="text-4xl font-black text-orange-600">$300M</p>
              </div>
            </div>

            {/* Initial Focus */}
            <div className="bg-green-50 p-6 ml-36 border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">Initial Focus</p>
                  <p className="text-lg text-gray-600 mt-1">2,000 premium venues @ $2K/mo</p>
                </div>
                <p className="text-4xl font-black text-green-600">$48M</p>
              </div>
            </div>
          </div>

          {/* Bottom Points */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-5 border-2 border-gray-300 text-center">
              <Target className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">Land & Expand</p>
              <p className="text-sm text-gray-600 mt-1">Start with ops, add modules</p>
            </div>
            <div className="bg-white p-5 border-2 border-gray-300 text-center">
              <Shield className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">Risk = Budget</p>
              <p className="text-sm text-gray-600 mt-1">Compliance drives decisions</p>
            </div>
            <div className="bg-white p-5 border-2 border-gray-300 text-center">
              <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">Growing Market</p>
              <p className="text-sm text-gray-600 mt-1">15% CAGR in venue tech</p>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 6: Product Status (30 seconds)
  {
    id: 'status',
    header: 'PRODUCT STATUS',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-6xl font-bold text-gray-900 mb-12 text-center">
            Ready to Deploy
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {/* Completed */}
            <div className="bg-white p-8 border-2" style={{ borderColor: "#EA580C" }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BadgeCheck className="w-8 h-8 text-green-600" />
                Completed
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <span className="text-lg">Core product working</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <span className="text-lg">94% AI accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <span className="text-lg">Voice/text/photo input</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <span className="text-lg">30-second process</span>
                </li>
              </ul>
            </div>

            {/* In Progress */}
            <div className="bg-gray-50 p-8 border border-gray-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                In Progress
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 mt-1" />
                  <span className="text-lg">Finding pilot venues</span>
                </li>
                <li className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 mt-1" />
                  <span className="text-lg">Collecting real data</span>
                </li>
                <li className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 mt-1" />
                  <span className="text-lg">Iterating on feedback</span>
                </li>
              </ul>
            </div>

            {/* Next 30 Days */}
            <div className="bg-gray-100 p-8 border border-gray-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-orange-600" />
                Next 30 Days
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-600 mt-1" />
                  <span className="text-lg">3 pilots launched</span>
                </li>
                <li className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-600 mt-1" />
                  <span className="text-lg">100 real cases</span>
                </li>
                <li className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-600 mt-1" />
                  <span className="text-lg">First paying customer</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 7: Why Us (30 seconds)
  {
    id: 'why',
    header: 'WHY US',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-5xl font-bold text-gray-900 mb-3 text-center">
            Why A Solo Founder Wins with AI Leverage
          </h2>
          <p className="text-2xl text-gray-600 mb-10 text-center">
            Use AI agents as leverage to deliver in days what incumbents ship in quarters
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Traditional Corp Constraints */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-gray-700" />
                Typical Corp Constraints
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="font-bold text-lg text-gray-900">Product Development</p>
                  <p className="text-gray-700">3-6 approval layers • Quarterly releases</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">Sales Process</p>
                  <p className="text-gray-700">10+ person sales team • 6-month cycles</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">Marketing</p>
                  <p className="text-gray-700">$50K/mo agency fees • 3-month campaigns</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">Operations</p>
                  <p className="text-gray-700">Headcount-heavy • Fixed overhead</p>
                </div>
              </div>
            </div>

            {/* Solo + AI Leverage */}
            <div className="bg-gradient-to-br from-blue-900 to-black p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                Solo + AI Leverage
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="font-bold text-lg text-yellow-400">AI-Powered Development</p>
                  <p className="text-gray-200">24hr decisions • Weekly ship</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-yellow-400">AI Sales Agents</p>
                  <p className="text-gray-200">1000 outreaches/day • Weeks to close</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-yellow-400">AI Content Generation</p>
                  <p className="text-gray-200">$500/mo tools • Daily A/B testing</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-yellow-400">AI Operations</p>
                  <p className="text-gray-200">90% automated • 10% of traditional cost</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quantified Impact */}
          <div className="mt-8 bg-black text-white p-6 rounded-lg">
            <p className="text-2xl font-bold text-center mb-4">
              The Math: 1 founder + AI = 20-person startup
            </p>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-yellow-400">100x</p>
                <p className="text-sm text-gray-400">faster iteration</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">10x</p>
                <p className="text-sm text-gray-400">lower burn rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">1000x</p>
                <p className="text-sm text-gray-400">sales outreach</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">24/7</p>
                <p className="text-sm text-gray-400">customer support</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  },

  // Slide 8: Business Model (20 seconds)
  {
    id: 'business-model',
    header: 'BUSINESS MODEL',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">
          {/* How We Grow */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-5 border-b border-gray-400 pb-2">How We Grow</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 text-right font-bold text-lg text-gray-700">Land:</div>
                <div className="flex-1 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
                  <span className="text-xl">Quick win with lost & found <span className="font-bold text-orange-600">($500/mo)</span></span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-24 text-right font-bold text-lg text-gray-700">Expand:</div>
                <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                  <span className="text-xl">Add operations features <span className="font-bold text-blue-600">($2,000/mo)</span></span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-24 text-right font-bold text-lg text-gray-700">Scale:</div>
                <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                  <span className="text-xl">Become the operating system <span className="font-bold text-green-600">($5,000/mo)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Model Works */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-5 border-b border-gray-400 pb-2">Why This Model Works</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <span className="font-bold text-lg">Low CAC:</span>
                  <span className="text-lg text-gray-700 ml-2">Founder-led sales, no marketing spend</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <span className="font-bold text-lg">High LTV:</span>
                  <span className="text-lg text-gray-700 ml-2">Sticky product, {'<'}5% monthly churn</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <span className="font-bold text-lg">Quick Payback:</span>
                  <span className="text-lg text-gray-700 ml-2">1-2 months at current pricing</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <span className="font-bold text-lg">Natural Expansion:</span>
                  <span className="text-lg text-gray-700 ml-2">Customers want more features</span>
                </div>
              </div>
            </div>
          </div>

          {/* Competitive Advantages */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-5 border-b border-gray-400 pb-2">Competitive Advantages</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-gray-700 text-xl">•</span>
                <div>
                  <span className="font-bold text-lg">AI-Native:</span>
                  <span className="text-lg text-gray-700 ml-2">Not a form builder with AI bolted on</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-700 text-xl">•</span>
                <div>
                  <span className="font-bold text-lg">Venue-Specific:</span>
                  <span className="text-lg text-gray-700 ml-2">Deep domain expertise</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-700 text-xl">•</span>
                <div>
                  <span className="font-bold text-lg">Network Effects:</span>
                  <span className="text-lg text-gray-700 ml-2">Each venue improves the system</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-700 text-xl">•</span>
                <div>
                  <span className="font-bold text-lg">Speed:</span>
                  <span className="text-lg text-gray-700 ml-2">Ship features in days, not months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },

  // Slide 9: The Ask (30 seconds)
  {
    id: 'ask',
    header: 'NEXT STEPS',
    content: (
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-6xl font-bold text-gray-900 mb-16 text-center">
            Let's Build This Together
          </h2>
          
          {/* What I'm Looking For */}
          <div className="bg-gray-50 p-12 mb-12 border-l-4 border-orange-600">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">What I Need Most</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-xl">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Customer Discovery</p>
                  <p className="text-gray-600 text-lg mt-1">Connect me with venue operators to validate the problem</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Industry Expertise</p>
                  <p className="text-gray-600 text-lg mt-1">Guide me on venue operations best practices</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Early Pilots</p>
                  <p className="text-gray-600 text-lg mt-1">Test the solution with real venues (free during pilot)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Product Feedback</p>
                  <p className="text-gray-600 text-lg mt-1">Shape the product with your insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Commitment */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-orange-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900">Full-Time Commitment</p>
              <p className="text-gray-600 mt-2">100% focused on this</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900">Direct Access</p>
              <p className="text-gray-600 mt-2">Weekly updates & full transparency</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900">Customer Obsessed</p>
              <p className="text-gray-600 mt-2">Building exactly what venues need</p>
            </div>
          </div>

          {/* Simple CTA */}
          <div className="mt-12 text-center">
            <p className="text-2xl text-gray-700">
              <span className="font-bold">If you know anyone in venue operations,</span>
              <br />
              <span className="text-orange-600 font-bold">I'd love an intro</span>
            </p>
          </div>
        </div>
      </div>
    )
  },

  // Slide 10: Contact + Demo (30 seconds)
  {
    id: 'contact',
    header: null,
    content: (
      <div className="h-full flex flex-col justify-center bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-7xl font-black text-gray-900 mb-12">
            See It Work <span style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Now</span>
          </h2>
          
          <div className="p-12 mb-10 text-white relative" style={{ background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)" }}>
            <div className="flex items-center justify-center gap-12">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl">
                <img 
                  src="/qr-code.png" 
                  alt="QR Code for Demo" 
                  className="w-48 h-48"
                />
              </div>
              
              {/* Text Content */}
              <div className="text-left">
                <p className="text-5xl font-bold mb-4">
                  zenasset.io/demo
                </p>
                <p className="text-2xl">
                  Scan to try the live demo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-3">
              <AtSign className="w-8 h-8 text-orange-600" />
              <span className="text-xl text-gray-700 font-medium">mike.gu@zenasset.io</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Phone className="w-8 h-8 text-orange-600" />
              <span className="text-xl text-gray-700 font-medium">518-961-8035</span>
            </div>
          </div>

          <div className="bg-black text-white p-8 inline-block">
            <p className="text-3xl font-bold">
              "Who wants to see a live demo?"
            </p>
            <p className="text-xl text-gray-300 mt-3">
              Tell me any venue problem - I'll show you how we handle it
            </p>
          </div>
        </div>
      </div>
    )
  }
]

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPresenting, setIsPresenting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
        setIsPresenting(true)
      } else {
        await document.exitFullscreen()
        setIsPresenting(false)
      }
    } catch (err) {
      console.error('Error attempting to toggle fullscreen:', err)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
        setIsPresenting(false)
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 'r' || e.key === 'R') {
        // Reset to first slide
        setCurrentSlide(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleFullscreen])

  return (
    <div 
      ref={containerRef}
      className={`${
        isPresenting 
          ? 'fixed inset-0 z-50 bg-white' 
          : 'min-h-screen bg-white'
      }`}
    >

      {/* Header */}
      {slides[currentSlide].header && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-300 z-30">
          <div className="h-full max-w-full mx-auto px-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-baseline">
                <span 
                  className="text-2xl font-light tracking-tight"
                  style={{ 
                    fontFamily: "'Raleway', sans-serif",
                    background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  zen
                </span>
                <span 
                  className="text-2xl font-bold tracking-tight text-gray-900"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  asset
                </span>
              </div>
              <span className="text-xl text-gray-600 font-medium">{slides[currentSlide].header}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-orange-600' 
                        : index < currentSlide
                        ? 'w-2 bg-gray-600'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg text-gray-500 ml-4">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200 z-30">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            background: "linear-gradient(135deg, #EA580C 0%, #DC2626 100%)",
            width: `${((currentSlide + 1) / slides.length) * 100}%`
          }}
        />
      </div>

      {/* Slide Content */}
      <div className={`h-screen px-12 ${slides[currentSlide].header ? 'pt-20 pb-8' : 'py-8'}`}>
        {slides[currentSlide].content}
      </div>

      {/* Slide Navigation Dots */}
      {!isPresenting && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-10 h-3 bg-orange-600' 
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {!isPresenting && (
        <div className="fixed bottom-20 left-8 text-sm text-gray-400">
          <p>Press <kbd className="px-2 py-1 bg-gray-100">F</kbd> to present</p>
          <p>Use <kbd className="px-2 py-1 bg-gray-100">←</kbd> <kbd className="px-2 py-1 bg-gray-100">→</kbd> to navigate</p>
        </div>
      )}
    </div>
  )
}