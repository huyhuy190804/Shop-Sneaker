import React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-between min-h-[400px]">
      {/* Background huge text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black italic text-[#141414] select-none z-0 pointer-events-none leading-none w-full text-center whitespace-nowrap overflow-hidden">
        SOLESTYLE
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-3xl px-8 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-black italic text-white tracking-tighter leading-none mb-4 uppercase">
          JOIN THE <br /> MONOLITH
        </h2>
        <p className="text-gray-400 text-xs mt-2 mb-8 max-w-sm">
          Become a member and unlock early access to drops, exclusive editorial content, and member-only events.
        </p>

        <div className="flex w-full max-w-md items-center shadow-lg">
          <Input
            type="email"
            placeholder="YOUR EMAIL ADDRESS"
            className="flex-1 bg-[#1a1a1a] border-none text-white placeholder:text-gray-500 rounded-none h-12 text-[10px] font-bold tracking-widest px-4 focus-visible:ring-1 focus-visible:ring-gray-600 focus-visible:ring-offset-0"
          />
          <Button className="bg-white text-black hover:bg-gray-200 rounded-none h-12 px-6 text-[10px] font-bold tracking-widest uppercase">
            SUBSCRIBE
          </Button>
        </div>
        <p className="text-[8px] text-gray-600 mt-4 tracking-widest uppercase">
          BY JOINING, YOU AGREE TO OUR PRIVACY POLICY AND TERMS OF SERVICE.
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-8 border-t border-[#1f1f1f] text-[10px] text-gray-500 font-bold tracking-widest uppercase">
        <div className="text-white text-xl md:text-lg font-black italic tracking-tighter mb-6 md:mb-0">
          ShopSneaker
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 md:mb-0 max-w-sm md:max-w-none w-full">
          <span className="cursor-pointer hover:text-white transition-colors">PRIVACY</span>
          <span className="cursor-pointer hover:text-white transition-colors">TERMS</span>
          <span className="cursor-pointer hover:text-white transition-colors">RETURNS</span>
          <span className="cursor-pointer hover:text-white transition-colors">LOCATIONS</span>
        </div>
        <div className="text-center md:text-right">
          © 2026 ShopSneaker MONOLITH. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  )
}
