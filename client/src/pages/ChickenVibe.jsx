import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function ChickenVibe() {
    const [chickenVibeProducts, setChickenVibeProducts] = useState([]);

    useEffect(() => {
        
        axios.get("http://localhost:8080/api/products?category=Gà rán")
            .then(res => {
                setChickenVibeProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Gà Vibe</h2>
            <div className="product-list">
                {chickenVibeProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    );
}
