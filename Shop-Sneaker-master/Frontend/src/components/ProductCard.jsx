import { Heart, ShoppingCart, Star, Loader2 } from "lucide-react";
import { useState } from "react";

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const ProductCard = ({
  product,
  onAddToCart,
  isFavorite = false,
  onToggleWishlist,
  isLoading = false,
}) => {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Sale Badge */}
        {product.isSale && product.originalPrice > 0 && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              setIsAddingToWishlist(true);
              try {
                await onToggleWishlist(product);
              } finally {
                setIsAddingToWishlist(false);
              }
            }
          }}
          disabled={isAddingToWishlist}
          className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {isAddingToWishlist ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          )}
        </button>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart?.(product);
          }}
          disabled={isLoading}
          className="absolute bottom-0 left-0 right-0 bg-black text-white py-2 flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">ADD TO CART</span>
            </>
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          {product.collection}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 cursor-pointer transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.rating})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {moneyFormatter.format(Number(product.price || 0))}
            </span>
            {product.originalPrice !== product.price && (
              <span className="text-sm text-gray-500 line-through">
                {moneyFormatter.format(Number(product.originalPrice || 0))}
              </span>
            )}
          </div>
        </div>

        {/* Size Options Preview */}
        <div className="mt-3 flex gap-1 flex-wrap">
          {product.sizes.slice(0, 3).map((size) => (
            <span
              key={size}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {size}
            </span>
          ))}
          {product.sizes.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-600">
              +{product.sizes.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
