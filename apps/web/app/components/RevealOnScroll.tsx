'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function RevealOnScroll({
  children,
  delay = 0,
  className = '',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const delayClass = delay > 0 ? `reveal-delay-${delay}` : ''

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'active' : ''} ${delayClass} ${className}`}
    >
      {children}
    </div>
  )
}
