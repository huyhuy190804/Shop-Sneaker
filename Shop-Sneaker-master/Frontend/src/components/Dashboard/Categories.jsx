import React from "react";
import { Link } from "react-router-dom";

const getCategoryImage = (cat) => {
  if (cat?.imageUrl) return cat.imageUrl;

  const title = cat?.name || "Sneaker";
  const safeTitle = String(title).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#g)" />
      <circle cx="680" cy="160" r="180" fill="rgba(255,255,255,0.08)" />
      <circle cx="140" cy="860" r="220" fill="rgba(255,255,255,0.06)" />
      <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle"
            fill="#ffffff" font-family="Arial, sans-serif" font-size="62" font-weight="700" letter-spacing="4">
        ${safeTitle.toUpperCase()}
      </text>
      <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle"
            fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif" font-size="28" letter-spacing="6">
        SHOP SNEAKER
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function Categories({ categories = [] }) {
  return (
    <section className="w-full bg-[#f8f8f8] py-8 px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {categories.slice(0, 3).map((cat) => (
          <Link
            key={cat._id}
            to={`/shop-all?search=${encodeURIComponent(cat?.name || "")}`}
          >
            <div
              className="relative aspect-[3/4] group cursor-pointer overflow-hidden bg-black flex items-end p-8"
            >
              <img
                src={getCategoryImage(cat)}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 from-black/80 to-transparent bg-gradient-to-t h-1/2"></div>
              <div className="relative z-10 text-white space-y-3 max-w-[200px]">
                <h3 className="font-black italic text-2xl tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 leading-snug">
                  {cat.description || "Explore our latest sneaker collection."}
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-bold tracking-widest border-b border-white pb-1 group-hover:text-gray-300 transition-colors uppercase">
                    EXPLORE ALL
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
