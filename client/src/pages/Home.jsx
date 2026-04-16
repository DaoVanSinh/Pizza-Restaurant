import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Bảng ánh xạ slug (từ DB) → đường dẫn route của client.
 * Phải khớp với routes trong App.jsx
 */
const SLUG_TO_ROUTE = {
  "pizza":       "/pizza",
  "ga-ngon-vibe": "/chickenvibe",
  "mi-y":        "/pasta",
  "nui-bo-lo":   "/baked",
  "khai-vi":     "/appetizer",
  "salad":       "/salad",
  "thuc-uong":   "/drink",
};

const BANNERS = [
  "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2070&auto=format&fit=crop", // Pizza Promo 1
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop", // Pizza Promo 2
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop", // Pizza Promo 3
];

export default function Home() {
  const { categories, isLoading: catLoading } = useCategories();
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto slide
  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentIdx(prev => (prev + 1) % BANNERS.length);
      }, 4500);
      return () => clearInterval(timer);
  }, []);

  const nextBanner = () => setCurrentIdx(prev => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentIdx(prev => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <div>
      {/* Dynamic Carousel Banner */}
      <div className="relative w-full h-[250px] md:h-[450px] flex justify-center items-center py-4 overflow-hidden mt-4 mb-10">
          <div className="absolute inset-0 flex justify-center items-center">
              {BANNERS.map((img, idx) => {
                  let position = "translate-x-[200%] opacity-0 z-0"; // Hidden right far
                  
                  if (idx === currentIdx) {
                      position = "translate-x-0 opacity-100 z-20"; // Active Center
                  } else if (idx === (currentIdx - 1 + BANNERS.length) % BANNERS.length) {
                      position = "-translate-x-[105%] opacity-50 z-10 cursor-pointer hidden md:block"; // Prev Left with gap
                  } else if (idx === (currentIdx + 1) % BANNERS.length) {
                      position = "translate-x-[105%] opacity-50 z-10 cursor-pointer hidden md:block"; // Next Right with gap
                  }
                  
                  return (
                      <div 
                          key={idx} 
                          className={`absolute w-[95%] md:w-[75%] h-full transition-transform duration-700 ease-in-out rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl ${position}`}
                          onClick={() => setCurrentIdx(idx)}
                      >
                          <img src={img} className="w-full h-full object-cover select-none" alt={`Promo Banner ${idx}`} draggable="false" />
                      </div>
                  );
              })}
          </div>
          
          {/* Controls */}
          <button onClick={prevBanner} className="absolute left-2 md:left-6 lg:left-12 z-30 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 md:p-3 backdrop-blur-sm transition-all hover:scale-110">
             <ChevronLeft size={28} />
          </button>
          <button onClick={nextBanner} className="absolute right-2 md:right-6 lg:right-12 z-30 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 md:p-3 backdrop-blur-sm transition-all hover:scale-110">
             <ChevronRight size={28} />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-2 flex gap-2 z-30">
              {BANNERS.map((_, idx) => (
                  <button 
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${currentIdx === idx ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                  />
              ))}
          </div>
      </div>

      {/* Danh sách tất cả danh mục sản phẩm — lấy động từ API */}
      {catLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        categories.map((cat, idx) => {
          const route = SLUG_TO_ROUTE[cat.slug];
          return (
            <div key={cat.id} className={idx % 2 !== 0 ? "bg-gray-50 py-4" : "py-4"}>
              <ProductList
                category={cat.slug}
                title={cat.name}
                fetchHook={useProducts}
                maxItems={4}
                showExpandButton={true}
              />
            </div>
          );
        })
      )}
    </div>
  );
}