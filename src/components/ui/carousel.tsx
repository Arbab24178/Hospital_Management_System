"use client"

import { memo, useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Slide {
  icon: React.ReactNode
  title: string
  description: string
}

interface CarouselProps {
  slides: Slide[]
  interval?: number
  className?: string
}

const SlideItem = memo(function SlideItem({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-[opacity,transform] duration-500 will-change-transform will-change-opacity",
        isActive
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <div className="mb-3">{slide.icon}</div>
      <h3 className="text-lg font-semibold mb-1">{slide.title}</h3>
      <p className="text-sm text-white/80">{slide.description}</p>
    </div>
  )
})

function Dots({ total, current, onGoTo }: { total: number; current: number; onGoTo: (i: number) => void }) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onGoTo(index)}
          className={cn(
            "rounded-full transition-all duration-300",
            index === current
              ? "w-6 h-2 bg-white"
              : "w-2 h-2 bg-white/40 hover:bg-white/60"
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
}

export function Carousel({ slides, interval = 5000, className }: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
      }, interval)
    }
  }, [interval, slides.length])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    timerRef.current = setInterval(next, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [next, interval])

  if (slides.length === 0) return null

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-red-700 text-white", className)}>
      <div className="relative h-48" style={{ contain: "layout style" }}>
        {slides.map((slide, index) => (
          <SlideItem key={index} slide={slide} isActive={index === current} />
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-1 text-white/80 hover:bg-white/30 hover:text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-1 text-white/80 hover:bg-white/30 hover:text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      <Dots total={slides.length} current={current} onGoTo={goTo} />
    </div>
  )
}
