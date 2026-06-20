import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const ProductFilter = ({
  filters,
  setFilters,
  categoryOptions = [],
  sizeOptions = [],
  colorOptions = [],
  priceMax = 10000000,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSizeChange = (size) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorChange = (color) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handlePriceChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value, 10);
    if (newRange[0] <= newRange[1]) {
      setFilters((prev) => ({
        ...prev,
        priceRange: newRange,
      }));
    }
  };

  const colorMap = {
    black: "#000000",
    white: "#FFFFFF",
    gray: "#808080",
    red: "#FF0000",
    blue: "#0000FF",
    neon: "#00FF00",
    khaki: "#F0E68C",
    cream: "#FFFDD0",
    navy: "#000080",
  };

  return (
    <div className="lg:col-span-1">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">FILTER</h2>

        <div className="mb-6 border-b border-gray-200 pb-6">
          <button
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between mb-3 hover:text-blue-600 transition-colors"
          >
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              Category
            </h3>
            {expandedSections.category ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.category && (
            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label
                  key={category}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 border-b border-gray-200 pb-6">
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between mb-3 hover:text-blue-600 transition-colors"
          >
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              Price Range
            </h3>
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.price && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 uppercase">Min</label>
                <input
                  type="range"
                  min="0"
                  max={priceMax}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="text-sm font-semibold text-gray-900">
                  {moneyFormatter.format(Number(filters.priceRange[0] || 0))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 uppercase">Max</label>
                <input
                  type="range"
                  min="0"
                  max={priceMax}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="text-sm font-semibold text-gray-900">
                  {moneyFormatter.format(Number(filters.priceRange[1] || 0))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 border-b border-gray-200 pb-6">
          <button
            onClick={() => toggleSection("size")}
            className="w-full flex items-center justify-between mb-3 hover:text-blue-600 transition-colors"
          >
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              Size
            </h3>
            {expandedSections.size ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.size && (
            <div className="grid grid-cols-4 gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`py-2 px-3 border rounded text-xs font-semibold transition-all ${
                    filters.sizes.includes(size)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-6">
          <button
            onClick={() => toggleSection("color")}
            className="w-full flex items-center justify-between mb-3 hover:text-blue-600 transition-colors"
          >
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              Color
            </h3>
            {expandedSections.color ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.color && (
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    filters.colors.includes(color)
                      ? "border-black scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: colorMap[color] || "#9CA3AF" }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {(filters.categories.length > 0 ||
        filters.sizes.length > 0 ||
        filters.colors.length > 0 ||
        filters.priceRange[0] !== 0 ||
        filters.priceRange[1] !== priceMax) && (
        <button
          onClick={() => {
            setFilters({
              categories: [],
              priceRange: [0, priceMax],
              sizes: [],
              colors: [],
            });
          }}
          className="w-full bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors"
        >
          CLEAR FILTERS
        </button>
      )}
    </div>
  );
};

export default ProductFilter;
