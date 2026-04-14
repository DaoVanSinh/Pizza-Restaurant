import { useState, useEffect } from "react";
import { productApi } from "../services/modules/product.api";
import ProductCard from "./ProductCard";

export default function PromoSection() {
    const [promoProducts, setPromoProducts] = useState([]);

    useEffect(() => {
        productApi.getProductsByCategory("combo-khuyen-mai")
            .then(res => {
                setPromoProducts(res.data || []);
            })
            .catch(err => console.error("Lỗi lấy dữ liệu PromoSection:", err));
    }, []);

    return (
        <div className="promo-section-container">
            <h2 style={{ margin: '20px 5%' }}>Khuyến mãi đặc biệt</h2>
            <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '0 5%' }}>
                {promoProducts.length > 0 ? (
                    promoProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))
                ) : (
                    <p style={{ margin: '0 5%' }}>Đang cập nhật các chương trình khuyến mãi...</p>
                )}
            </div>
        </div>
    );
}