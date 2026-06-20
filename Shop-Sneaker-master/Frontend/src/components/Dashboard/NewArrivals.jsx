import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";

const formatPrice = (product) => {
  const price = Number(product?.salePrice ?? product?.basePrice ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function NewArrivals({ products = [] }) {
  return (
    <section className="w-full py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-black italic tracking-tight">
            NEW ARRIVALS
          </h2>
          <p className="text-[11px] md:text-xs text-gray-500 font-bold tracking-[0.25em] mt-1">
            FRESH DROPS WEEKLY
          </p>
        </div>
        {/* We will use Carousel controls, but they are nested inside Carousel context. 
            So we structure Carousel carefully. */}
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
      >
        <div className="absolute -top-12 right-0 gap-2 hidden md:flex">
          <CarouselPrevious className="static translate-y-0 h-8 w-8 rounded-none border border-gray-200" />
          <CarouselNext className="static translate-y-0 h-8 w-8 rounded-none border border-gray-200" />
        </div>

        <CarouselContent className="-ml-4">
          {products.map((item) => (
            <CarouselItem
              key={item._id}
              className="pl-4 md:basis-1/2 lg:basis-1/4"
            >
              <Link to={`/project-details/${item._id}`}>
                <article className="group h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/5] w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 overflow-hidden">
                    <img
                      src={item.productImages?.[0] || "/api/placeholder/600/750"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1 min-h-[94px]">
                    <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">
                      {item.category?.name || "SNEAKER"}
                    </p>
                    <h3 className="font-extrabold text-base leading-tight tracking-tight text-slate-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 font-black text-2xl tracking-tight">
                      {formatPrice(item)}
                    </p>
                  </div>
                </article>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
