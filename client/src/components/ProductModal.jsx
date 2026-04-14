import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { getImg } from "../lib/utils";
import { useSearchProducts } from "../hooks/useProducts";
import { toast } from "sonner";

export default function ProductModal({ product: initialProduct, onClose }) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // Tìm các sản phẩm cùng tên nhưng khác size
  const { products: searchResults } = useSearchProducts(initialProduct?.name);
  
  // Lọc các sản phẩm cùng tên (các variants)
  const variants = (searchResults || [])
    .filter(p => p.name.trim().toLowerCase() === initialProduct.name.trim().toLowerCase())
    .sort((a, b) => a.price - b.price);

  const hasSizes = variants.length > 0;
  
  // Kiểm tra xem sản phẩm có phải Pizza không
  // Dựa vào category slug của product
  const isPizza = initialProduct?.category?.slug === "pizza" || initialProduct?.category?.name?.toLowerCase().includes("pizza");

  // Khi data load xong, nếu có variant trùng ID thì set mặc định
  useEffect(() => {
    if (variants.length > 0) {
      const current = variants.find(v => v.id === initialProduct.id) || variants[0];
      setSelectedProduct(current);
    }
  }, [searchResults]);

  if (!initialProduct) return null;

  const currentPrice = selectedProduct?.price || initialProduct.price;
  const currentVariantSize = selectedProduct?.variant?.size || initialProduct.variant?.size;

  const handleAddToCart = () => {
    const productPayload = {
      ...(selectedProduct || initialProduct),
      price: currentPrice,
    };
    
    // addToCart(product, quantity, note, size)
    addToCart(
      productPayload, 
      quantity, 
      note.trim(), 
      currentVariantSize || "Tiêu chuẩn"
    );
    
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: "16px",
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: "20px",
          maxWidth: "500px", width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden", position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(0,0,0,0.12)", border: "none",
            borderRadius: "50%", width: 32, height: 32,
            cursor: "pointer", fontSize: "1rem", fontWeight: 700,
            color: "#333", zIndex: 10,
          }}
        >✕</button>

        {/* Product Image */}
        <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
          <img
            src={getImg((selectedProduct || initialProduct).imageUrl)}
            alt={initialProduct.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: "#f9f9f9" }}
            onError={(e) => {
              e.target.src = "https://placehold.co/400x400/png?text=No+Image";
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)"
          }}/>
          <h2 style={{
            position: "absolute", bottom: 16, left: 20,
            color: "white", margin: 0, fontSize: "1.4rem", fontWeight: 800,
          }}>{initialProduct.name}</h2>
        </div>

        <div style={{ padding: "24px" }}>
          {initialProduct.description && (
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px", lineHeight: 1.6 }}>
              {initialProduct.description}
            </p>
          )}

          {/* Quy trình chọn size theo Database thực tế - CHỈ ÁP DỤNG PIZZA */}
          {hasSizes && variants.length > 1 && isPizza && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontWeight: 700, marginBottom: "10px", color: "#333" }}>Chọn kích thước:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {variants.map((v) => {
                  const isSelected = selectedProduct?.id === v.id;
                  const sizeName = v.variant?.size || "Mặc định";
                  
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedProduct(v)}
                      style={{
                        flex: "1 1 calc(33.33% - 10px)", padding: "10px 8px",
                        borderRadius: "10px",
                        border: isSelected ? "2.5px solid #e53935" : "2px solid #ddd",
                        background: isSelected ? "#fff0f0" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: isSelected ? "#e53935" : "#333", fontSize: "0.95rem" }}>
                        {sizeName}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: isSelected ? "#e53935" : "#888", marginTop: 3 }}>
                        {v.price.toLocaleString()}đ
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Display */}
          <div style={{
            textAlign: "center",
            marginBottom: "20px",
            padding: "14px",
            background: "linear-gradient(135deg, #fff5f5, #fff)",
            borderRadius: "12px",
            border: "1px solid #fde8e8"
          }}>
            <span style={{ fontSize: "0.85rem", color: "#888" }}>Giá</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e53935" }}>
              {currentPrice?.toLocaleString()}đ
            </div>
          </div>

          {/* Ghi chú */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: 700, marginBottom: "8px", color: "#333", fontSize: "0.95rem" }}>Ghi chú thêm (Tuỳ chọn)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Không hành, Cắt làm 8 miếng, Thêm tương ớt..."
              style={{
                width: "100%", height: "70px", padding: "10px",
                borderRadius: "8px", border: "1px solid #ddd",
                fontSize: "0.9rem", resize: "none", outline: "none",
                fontFamily: "inherit"
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e53935")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          {/* Quantity Selector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "2px solid #e53935", background: "white",
                color: "#e53935", fontSize: "1.4rem", fontWeight: 700,
                cursor: "pointer", lineHeight: 1,
              }}
            >−</button>
            <span style={{ fontSize: "1.3rem", fontWeight: 700, minWidth: "30px", textAlign: "center" }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "2px solid #e53935", background: "#e53935",
                color: "white", fontSize: "1.4rem", fontWeight: 700,
                cursor: "pointer", lineHeight: 1,
              }}
            >+</button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #e53935, #c62828)",
              color: "white", border: "none",
              borderRadius: "12px", fontSize: "1rem",
              fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(229,57,53,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(229,57,53,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 12px rgba(229,57,53,0.35)"; }}
          >
            🛒 Thêm vào giỏ — {(currentPrice * quantity).toLocaleString()}đ
          </button>
        </div>
      </div>
    </div>
  );
}