"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "brand" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md",
      brand: "bg-brand text-white hover:bg-orange-700 shadow-sm hover:shadow-md",
      outline: "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "font-medium rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"

export default Button