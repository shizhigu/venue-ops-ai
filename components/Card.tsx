"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  elevated?: boolean
}

export default function Card({ children, className, hover = false, elevated = false }: CardProps) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={cn(
          "bg-white rounded-xl p-6",
          elevated 
            ? "shadow-lg border border-slate-100" 
            : "shadow-sm border border-slate-200",
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          className
        )}
      >
        {children}
      </motion.div>
    )
  }
  
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6",
        elevated 
          ? "shadow-lg border border-slate-100" 
          : "shadow-sm border border-slate-200",
        className
      )}
    >
      {children}
    </div>
  )
}