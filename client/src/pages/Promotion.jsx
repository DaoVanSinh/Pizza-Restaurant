import { useState, useEffect } from "react";
import axios from "axios";

export default function Promotion() {
    const [promotionProducts, setPromotionProducts] = useState([]);

    useEffect(() => {
        // Lấy sản phẩm khuyến mãi từ MySQL [cite: 52]
        axios.get("http://localhost:8080/api/products?category=promotion")
            .then(res => setPromotionProducts(res.data))
            .catch(err => console.error("Lỗi lấy khuyến mãi:", err));
    }, []);

    return (
        <>
            <PromotionList
                title="Các khuyến mãi và combo"
                product={promotionProducts}
            />
        </>
    );
}

