import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Pasta() {
    
    const [pastaProducts, setPastaProducts] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/products?category=Mì ý")
            .then(res => {
                setPastaProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Mì Ý</h2>
            <div className="product-list">
                {}
                {pastaProducts.length > 0 ? (
                    pastaProducts.map(p => (
                        <ProductCard key={p.id} product={p}/>
                    ))
                ) : (
                    <p>Đang tải danh sách mỳ Ý...</p>
                )}
            </div>
        </div>
    );
}