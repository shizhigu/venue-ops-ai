"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Button from "@/components/Button"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"

const navItems = [
  { name: "How It Works", href: "#solution" },
  { name: "Use Cases", href: "#use-cases" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" }
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="flex flex-col items-start">
              <div>
                <span 
                  className="text-3xl font-light tracking-tight"
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
                  className="text-3xl font-bold tracking-tight text-primary"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  asset
                </span>
              </div>
              <span 
                className="text-[10px] font-medium tracking-wider text-secondary mt-0.5 uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Venue Operations Software
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-secondary hover:text-primary font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.querySelector(item.href)
                  element?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                {item.name}
              </a>
            ))}
            <Button 
              variant="brand" 
              size="sm"
              onClick={() => window.location.href = '/venue-ops'}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-gray-100"
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2.5 text-secondary hover:text-primary font-medium transition-colors text-sm"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  const element = document.querySelector(item.href)
                  element?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4">
              <Button 
                variant="brand" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/venue-ops'}
              >
                Start Free Trial
              </Button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}