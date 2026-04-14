"use client"

import { useState } from 'react'

const competitors = {
  paper: {
    name: 'Paper/Excel',
    subtitle: '47% of venues',
    position: { left: '15%', bottom: '20%' },
    color: 'bg-gray-200',
    weaknesses: [
      'No search capability',
      'Manual process takes 45+ min',
      '15% return rate',
      'No tracking or reporting'
    ]
  },
  lifesaver: {
    name: 'Lifesaver',
    subtitle: '2C tags',
    position: { left: '25%', bottom: '50%' },
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
    weaknesses: [
      'Consumer-focused, not B2B',
      'No venue workflow',
      "Can't handle scale",
      'No reporting features'
    ]
  },
  repoapp: {
    name: 'RepoApp',
    subtitle: 'Basic SaaS',
    position: { left: '50%', bottom: '40%' },
    color: 'bg-gray-100',
    weaknesses: [
      'Limited automation',
      'No AI capabilities',
      'Basic search only',
      'No shipping integration'
    ]
  },
  lostings: {
    name: 'Lostings',
    subtitle: 'Email-first',
    position: { left: '55%', bottom: '60%' },
    color: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    weaknesses: [
      'Email-dependent',
      'No real-time chat',
      'Limited AI features',
      'Basic matching only'
    ]
  },
  crowdfind: {
    name: 'Crowdfind',
    subtitle: 'Navy Pier +50%',
    position: { left: '80%', bottom: '75%' },
    color: 'bg-green-100',
    textColor: 'text-green-700',
    weaknesses: [
      'Complex setup',
      'High cost',
      'Limited AI chat',
      'Slower adoption curve'
    ]
  },
  zenasset: {
    name: 'ZenAsset',
    subtitle: 'AI-native, 30s',
    position: { left: '65%', bottom: '80%' },
    color: 'bg-orange-500',
    textColor: 'text-white',
    isOurs: true,
    strengths: [
      '30-second AI capture',
      'Natural language chat',
      '94% match accuracy',
      'Zero training needed',
      'Instant setup & ROI'
    ]
  }
}

export default function CompetitiveLandscape() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('zenasset')

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-base font-medium tracking-[0.3em] text-gray-500 mb-2">
          COMPETITIVE LANDSCAPE
        </div>
        <h2 className="text-[4rem] leading-[1.1] font-light text-black mb-6">
          Positioned for market leadership
        </h2>
        
        <div className="flex gap-6">
          {/* Left: Main Chart */}
          <div className="flex-[2]">
            <div className="bg-gray-50 rounded-2xl p-6 h-[420px]">
              <div className="relative h-full">
                {/* Axes */}
                <div className="absolute bottom-10 left-14 right-8 top-8 border-l-2 border-b-2 border-gray-400">
                  {/* Y-axis label */}
                  <div className="absolute -left-12 bottom-0 h-full flex items-center">
                    <div className="-rotate-90 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">
                        Guest Self-Service & Experience →
                      </span>
                    </div>
                  </div>
                  {/* X-axis label */}
                  <div className="absolute bottom-[-30px] left-0 w-full text-center">
                    <span className="text-sm font-medium text-gray-700">
                      Process Automation Depth →
                    </span>
                  </div>
                  
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0.25, 0.5, 0.75].map((pos) => (
                      <div key={`grid-${pos}`}>
                        <div 
                          className="absolute w-full border-t border-gray-200"
                          style={{ bottom: `${pos * 100}%` }}
                        />
                        <div 
                          className="absolute h-full border-l border-gray-200"
                          style={{ left: `${pos * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Competitors */}
                  <div className="absolute inset-0">
                    {Object.entries(competitors).map(([key, comp]) => (
                      <div
                        key={key}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ 
                          left: comp.position.left, 
                          bottom: comp.position.bottom,
                          width: (comp as any).isOurs ? '8rem' : '7rem'
                        }}
                        onClick={() => setSelectedCompetitor(key)}
                      >
                        <div className={`
                          rounded-lg p-2 text-center transition-all hover:scale-110 
                          ${comp.color} 
                          ${(comp as any).isOurs ? 'shadow-xl animate-pulse' : ''}
                          ${selectedCompetitor === key ? 'ring-2 ring-offset-2 ' + ((comp as any).isOurs ? 'ring-orange-500' : 'ring-gray-500') : ''}
                        `}>
                          <p className={`text-sm font-${(comp as any).isOurs ? 'bold' : 'medium'} ${(comp as any).textColor || 'text-gray-700'}`}>
                            {comp.name}
                          </p>
                          <p className={`text-xs ${(comp as any).textColor ? 'opacity-80' : 'text-gray-500'}`}>
                            {comp.subtitle}
                          </p>
                        </div>
                        {(comp as any).isOurs && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rotate-45"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Quadrant labels */}
                  <div className="absolute top-4 right-4 text-xs text-gray-400 font-medium">
                    Leaders
                  </div>
                  <div className="absolute top-4 left-4 text-xs text-gray-400 font-medium">
                    Niche
                  </div>
                  <div className="absolute bottom-4 left-4 text-xs text-gray-400 font-medium">
                    Legacy
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
                    Challengers
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Info Panel */}
          <div className="flex-1">
            <div className="bg-black text-white rounded-2xl p-6 h-[420px] flex flex-col">
              <h3 className="text-xl font-medium mb-4 text-gray-100">
                {competitors[selectedCompetitor as keyof typeof competitors].name}
              </h3>
              
              {selectedCompetitor === 'zenasset' ? (
                <>
                  <div className="mb-4">
                    <p className="text-orange-400 font-medium mb-2 text-lg">Our Strengths</p>
                    <ul className="space-y-2">
                      {competitors.zenasset.strengths?.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-400">✓</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-700">
                    <p className="text-sm text-orange-400">
                      Sweet spot: High automation + High guest experience
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-orange-400 font-medium mb-2 text-lg">Weaknesses</p>
                    <ul className="space-y-2">
                      {(competitors[selectedCompetitor as keyof typeof competitors] as any).weaknesses?.map((weakness: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-400">•</span>
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedCompetitor === 'crowdfind' && (
                    <div className="mt-auto pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400">
                        <span className="font-medium text-white">Benchmark:</span> Achieved +50% return rate at Navy Pier
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom: Two Cards */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="bg-gray-100 rounded-xl p-5">
            <h3 className="text-lg font-medium text-black mb-3">Market Reality</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>47% still use paper/Excel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Crowdfind leads but complex & expensive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Most solutions stuck in "middle zone"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>2C solutions can't scale to B2B</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-5">
            <h3 className="text-lg font-medium text-black mb-3">Our Advantage</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-900">Superior Guest Experience</p>
                <p className="text-xs text-gray-600">AI chat, instant matching, zero-friction claims</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Approaching Automation Leader</p>
                <p className="text-xs text-gray-600">30-second capture, auto-routing, API-ready</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Unique Position</p>
                <p className="text-xs text-gray-600">Only AI-native solution designed for venues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}