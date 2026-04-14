import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  id?: string
}

export default function Section({ 
  children, 
  className, 
  containerClassName,
  id 
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 lg:py-24", className)}>
      <div className={cn("container", containerClassName)}>
        {children}
      </div>
    </section>
  )
}