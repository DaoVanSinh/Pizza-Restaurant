import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { useSearchProducts } from "../hooks/useProducts";
import { Loader2 } from "lucide-react";

export default function ProductList({ category, title, fetchHook, maxItems, showExpandButton }) {
  // Nếu có truyền custom fetchHook (như useSearchProducts), thì sử dụng nó, nếu không dùng fetchHook mặc định (ngầm định trong file này là data prop)
  const { products, isLoading, isError } = fetchHook(category);
  const [isExpanded, setIsExpanded] = useState(false);

  // Nhóm các sản phẩm trùng tên và chọn sản phẩm có giá nhỏ nhất (Size S) làm đại diện
  const groupedProducts = React.useMemo(() => {
    if (!products) return [];
    
    const map = {};
    products.forEach((p) => {
      const nameKey = p.name.trim().toLowerCase();
      if (!map[nameKey]) {
        map[nameKey] = p;
      } else {
        if (p.price < map[nameKey].price) {
          map[nameKey] = p;
        }
      }
    });

    // Chuyển object thành mảng
    return Object.values(map);
  }, [products]);

  // Cắt danh sách dựa trên trạng thái hiển thị
  const displayedProducts = (maxItems && !isExpanded) ? groupedProducts.slice(0, maxItems) : groupedProducts;

  return (
    <div className="w-full px-[5%] py-[3%]">
      <h2 className="text-3xl font-bold mb-6 text-foreground">{title}</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-destructive text-center py-10">Lỗi khi tải dữ liệu!</div>
      ) : groupedProducts.length === 0 ? (
        <div className="text-muted-foreground text-center py-10">Không tìm thấy sản phẩm nào.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Nút Xem thêm / Thu gọn full width theo yêu cầu */}
          {showExpandButton && groupedProducts.length > maxItems && (
            <div className="mt-8">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-[#f8f9fa] hover:bg-[#e9ecef] text-gray-600 transition-colors py-3.5 text-[15px] font-medium flex justify-center items-center gap-1.5"
              >
                {isExpanded ? "Thu gọn -" : "Xem thêm +"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}