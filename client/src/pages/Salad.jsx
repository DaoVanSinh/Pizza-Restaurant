import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Salad() {
    const [saladProducts, setSaladProducts] = useState([]);

    useEffect(() => {
        
        axios.get("http://localhost:8080/api/products?category=Salad")
            .then(res => {
                setSaladProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Salad</h2>
            <div className="product-list">
                {saladProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    );
}
