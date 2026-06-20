import React from 'react'
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative w-full bg-[#f8f8f8] px-8 py-16 md:py-24 overflow-hidden">
      {/* Background huge text */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-[15rem] font-black italic text-transparent stroke-gray-200 opacity-20 select-none z-0 pointer-events-none" style={{ WebkitTextStroke: '2px #ccc' }}>
        HYPE
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col items-start gap-4 md:gap-6">
          <p className="text-blue-600 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-4 md:mt-0">Limited Edition 2026</p>
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9]">
            KINETIC <br /> GRAVITY
          </h2>
          <p className="text-gray-600 text-xs md:text-sm max-w-md leading-relaxed font-medium">
            Engineered for the urban athlete. A silhouette that defines the intersection of high-performance technicality and brutalist aesthetics.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mt-2 w-full sm:w-auto">
            <Button className="bg-black text-white hover:bg-gray-800 rounded-none px-6 md:px-8 py-6 text-xs font-bold tracking-widest uppercase w-full sm:w-auto">
              Shop Now
            </Button>
            <Button variant="ghost" className="hover:bg-transparent rounded-none px-6 md:px-8 py-6 text-xs font-bold tracking-widest uppercase underline underline-offset-4 w-full sm:w-auto">
              View Specs
            </Button>
          </div>
        </div>

        <div className="bg-[#f0f0f0] p-8 md:p-16 flex items-center justify-center relative">
          <div className="absolute inset-x-0 h-full bg-white/50 -rotate-3 z-0"></div>
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
            alt="Kinetic Gravity Sneaker"
            className="w-full max-w-[500px] object-contain drop-shadow-2xl -rotate-12 z-10 hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  )
}
