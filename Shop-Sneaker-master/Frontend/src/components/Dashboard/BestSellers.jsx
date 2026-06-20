import React from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const formatPrice = (product) => {
  const price = Number(product?.salePrice ?? product?.basePrice ?? 0)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function BestSellers({ products = [] }) {
  return (
    <section className="w-full bg-gradient-to-b from-slate-100 to-white py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-2xl md:text-4xl font-black italic tracking-tight uppercase text-slate-900 mb-2">BEST SELLERS</h2>
          <p className="text-[11px] md:text-xs tracking-[0.25em] font-semibold text-slate-500 uppercase">Most loved by customers</p>
          <div className="h-[3px] w-16 bg-blue-600 mt-3"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {products.map((item) => (
            <Link key={item._id} to={`/project-details/${item._id}`} className="group">
              <article className="h-full rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
                  <img 
                    src={item.productImages?.[0] || "/api/placeholder/600/450"} 
                    alt={item.name} 
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-white/90 text-slate-700 border border-slate-200">
                    Top Pick
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-extrabold text-xs md:text-sm tracking-wide uppercase text-slate-900 line-clamp-2 min-h-[2.4rem]">
                    {item.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(item.averageRating || 0)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      ({Number(item.numReviews || 0)} reviews)
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="text-base md:text-lg font-black text-slate-900">
                      {formatPrice(item)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 group-hover:text-blue-700">
                      View Detail
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {!products.length && (
          <div className="text-center py-10 text-slate-500 text-sm">
            Chưa có sản phẩm best seller để hiển thị.
          </div>
        )}
      </div>
    </section>
  )
}
