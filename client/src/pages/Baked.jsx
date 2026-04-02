import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Baked() {
    const [bakedProducts, setBakedProducts] = useState([]);

    useEffect(() => {
        
        axios.get("http://localhost:8080/api/products?category=Nui bỏ lò")
            .then(res => {
                setBakedProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Nui bỏ lò</h2>
            <div className="product-list">
                {bakedProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    );
}
